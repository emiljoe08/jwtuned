/**
 * offlineCache.js
 * Lightweight IndexedDB key-value store for persisting job/mechanic data
 * so the dashboard stays usable on patchy workshop WiFi.
 *
 * Zero dependencies — uses the raw IndexedDB API.
 */

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

async function setItem(key, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getItem(key) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Public API ───────────────────────────────────────────────

/**
 * Persist the latest fetched jobs array to IndexedDB.
 * Also records a timestamp so the UI can show "last synced X ago".
 * @param {Array} jobs - Raw job rows from Supabase (snake_case).
 */
export async function saveJobsToCache(jobs) {
  try {
    await setItem('jobs', jobs)
    await setItem('jobs_synced_at', new Date().toISOString())
  } catch (e) {
    console.warn('[offlineCache] Failed to save jobs:', e)
  }
}

/**
 * Load the last-cached jobs array from IndexedDB.
 * @returns {Promise<Array>} The cached jobs, or an empty array.
 */
export async function loadJobsFromCache() {
  try {
    return (await getItem('jobs')) || []
  } catch (e) {
    console.warn('[offlineCache] Failed to load jobs:', e)
    return []
  }
}

/**
 * Persist the mechanics roster to IndexedDB.
 * @param {Array} mechanics - Raw mechanic rows from Supabase.
 */
export async function saveMechanicsToCache(mechanics) {
  try {
    await setItem('mechanics', mechanics)
  } catch (e) {
    console.warn('[offlineCache] Failed to save mechanics:', e)
  }
}

/**
 * Load the last-cached mechanics roster from IndexedDB.
 * @returns {Promise<Array>} The cached mechanics, or an empty array.
 */
export async function loadMechanicsFromCache() {
  try {
    return (await getItem('mechanics')) || []
  } catch (e) {
    console.warn('[offlineCache] Failed to load mechanics:', e)
    return []
  }
}

/**
 * Get the ISO timestamp of the last successful job sync.
 * @returns {Promise<string|null>}
 */
export async function getCacheTimestamp() {
  try {
    return (await getItem('jobs_synced_at')) || null
  } catch {
    return null
  }
}

/**
 * Clear all cached offline data.
 */
export async function clearCache() {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
  } catch (e) {
    console.warn('[offlineCache] Failed to clear cache:', e)
  }
}
