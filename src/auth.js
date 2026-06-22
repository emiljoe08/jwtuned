/**
 * auth.js — Secure authentication utilities for JW Tuned.
 *
 * Passwords are compared via SHA-256 hash (never stored in plaintext).
 * Sessions use HMAC-signed tokens so localStorage role values can't be
 * trivially spoofed by editing DevTools.
 */

const AUTH_SECRET = import.meta.env.VITE_AUTH_SECRET || ''
const STAFF_HASH = import.meta.env.VITE_STAFF_PASSWORD_HASH || ''
const MANAGER_HASH = import.meta.env.VITE_MANAGER_PASSWORD_HASH || ''

const SESSION_KEY = 'jw_session'

// ── Helpers ──────────────────────────────────────────────────

/**
 * Converts an ArrayBuffer to a hex string.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Converts a string to a Uint8Array (UTF-8).
 * @param {string} str
 * @returns {Uint8Array}
 */
function strToBytes(str) {
  return new TextEncoder().encode(str)
}

// ── Public API ───────────────────────────────────────────────

/**
 * Hash a password using SHA-256 via the Web Crypto API.
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} Hex-encoded SHA-256 digest.
 */
export async function hashPassword(password) {
  const digest = await crypto.subtle.digest('SHA-256', strToBytes(password))
  return bufToHex(digest)
}

/**
 * Validate a password against the stored hashes.
 * @param {string} password - The entered password.
 * @returns {Promise<'staff'|'manager'|null>} The matched role, or null.
 */
export async function validatePassword(password) {
  const hash = await hashPassword(password)

  // Constant-time-ish comparison (both are fixed-length hex strings,
  // and the hash hides the password, so timing leaks are minimal).
  if (hash === STAFF_HASH) return 'staff'
  if (hash === MANAGER_HASH) return 'manager'
  return null
}

/**
 * Create an HMAC-signed session token for the given role.
 * Token format: `role.timestamp.signature`
 * @param {string} role - 'staff' or 'manager'.
 * @returns {Promise<string>} The signed session token.
 */
export async function createSessionToken(role) {
  const timestamp = Date.now().toString()
  const payload = `${role}.${timestamp}`

  const key = await crypto.subtle.importKey(
    'raw',
    strToBytes(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, strToBytes(payload))
  return `${payload}.${bufToHex(sig)}`
}

/**
 * Validate a session token and return the role if valid.
 * @param {string} token - The session token from localStorage.
 * @returns {Promise<'staff'|'manager'|null>} The role, or null if invalid.
 */
export async function validateSessionToken(token) {
  if (!token || !AUTH_SECRET) return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [role, timestamp, signature] = parts
  if (role !== 'staff' && role !== 'manager') return null

  // Verify HMAC signature
  const payload = `${role}.${timestamp}`
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      strToBytes(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const sigBytes = new Uint8Array(signature.match(/.{2}/g).map(b => parseInt(b, 16)))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, strToBytes(payload))
    if (!valid) return null
  } catch {
    return null
  }

  // Optional: reject tokens older than 7 days
  const age = Date.now() - parseInt(timestamp, 10)
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days
  if (isNaN(age) || age > MAX_AGE || age < 0) return null

  return role
}

/**
 * Save a session token to localStorage.
 * @param {string} token - The HMAC-signed session token.
 */
export function saveSession(token) {
  localStorage.setItem(SESSION_KEY, token)
}

/**
 * Get the current auth role from a validated session.
 * @returns {Promise<'staff'|'manager'|null>}
 */
export async function getAuthRole() {
  const token = localStorage.getItem(SESSION_KEY)
  if (!token) return null
  return validateSessionToken(token)
}

/**
 * Clear the session (logout).
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
