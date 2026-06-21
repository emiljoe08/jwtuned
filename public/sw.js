/**
 * JW Tuned Service Worker
 *
 * Three caching strategies:
 * 1. App shell (HTML, JS, CSS, icons)  → cache-first after pre-cache
 * 2. Supabase API (/rest/v1/jobs)      → network-first, IndexedDB fallback
 * 3. Everything else (fonts, images)   → stale-while-revalidate
 */

const CACHE_NAME = 'jwtuned-v2'

// ── Minimal IndexedDB helper (runs inside the SW context) ────
const DB_NAME = 'jw-offline'
const DB_VERSION = 1
const STORE_NAME = 'kv'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet(key) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbSet(key, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Install: pre-cache app shell ─────────────────────────────
const SHELL_URLS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  )
  self.skipWaiting()
})

// ── Activate: purge old caches ───────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch: route requests to the right strategy ──────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Strategy 2: Supabase API — network-first with IndexedDB fallback
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Skip non-GET (POST, DELETE, etc.)
  if (request.method !== 'GET') return

  // Strategy 1: Navigation requests (SPA) — cache-first, network fallback
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Strategy 3: All other assets — stale-while-revalidate
  event.respondWith(handleAssetRequest(request))
})

// ── Strategy handlers ────────────────────────────────────────

/**
 * Supabase API: try network first.
 * On success → cache the JSON in IndexedDB so it's available offline.
 * On failure → serve the last-cached response from IndexedDB.
 */
async function handleApiRequest(request) {
  // Determine cache key from URL path (e.g. "jobs", "mechanics")
  const url = new URL(request.url)
  const tableName = extractTableName(url.pathname)

  try {
    const response = await fetch(request)

    // If it's a jobs or mechanics GET, persist the JSON in IDB
    if (response.ok && request.method === 'GET' && tableName) {
      try {
        const clone = response.clone()
        const json = await clone.json()
        await idbSet(`api_${tableName}`, json)
        await idbSet(`api_${tableName}_synced_at`, new Date().toISOString())
        // Also sync to the same keys the React app uses
        if (tableName === 'jobs') {
          await idbSet('jobs', json)
          await idbSet('jobs_synced_at', new Date().toISOString())
        } else if (tableName === 'mechanics') {
          await idbSet('mechanics', json)
        }
      } catch (e) {
        // Caching failed — still return the live response
        console.warn('[SW] IDB cache write failed:', e)
      }
    }

    return response
  } catch (networkError) {
    // Network failed — try to serve from IndexedDB
    if (request.method === 'GET' && tableName) {
      try {
        const cached = await idbGet(`api_${tableName}`)
        if (cached) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-JW-Offline': 'true',
            },
          })
        }
      } catch (e) {
        console.warn('[SW] IDB cache read failed:', e)
      }
    }

    // No cached data — return an offline error response
    return new Response(
      JSON.stringify({ error: 'offline', message: 'You are offline and no cached data is available.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Navigation (SPA): serve cached shell, fall back to network.
 * All routes resolve to the same index.html in a Vite SPA.
 */
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request)
    // Cache the fresh copy
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, response.clone())
    return response
  } catch {
    // Offline — serve the cached shell
    const cached = await caches.match(request) || await caches.match('/dashboard') || await caches.match('/')
    if (cached) return cached
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

/**
 * Static assets: stale-while-revalidate.
 * Serve from cache immediately, update cache in background.
 */
async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)

  // Return cached version immediately if available, otherwise wait for network
  if (cached) {
    // Fire-and-forget the network update
    networkPromise.catch(() => {})
    return cached
  }

  const networkResponse = await networkPromise
  return networkResponse || new Response('', { status: 408 })
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Extract the Supabase table name from a PostgREST URL path.
 * e.g. "/rest/v1/jobs" → "jobs"
 */
function extractTableName(pathname) {
  const match = pathname.match(/\/rest\/v1\/([a-z_]+)/)
  return match ? match[1] : null
}