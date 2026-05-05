// ─────────────────────────────────────────────────────────────────────────────
// Backend API client
//
// Set BASE_URL to wherever your backend is running.
// Examples:
//   Local dev with SSH tunnel:  http://localhost:8000
//   Deployed endpoint:          https://your-server.stanford.edu/api
//
// Expected backend contract:
//
//   POST /chat
//     body:  { messages: Message[], source_filter: string | null }
//     reply: { content: string, sources: SourceRef[], table?: TableData }
//
//   GET  /files?path=<yen_path>
//     reply: { entries: FileEntry[] }
//
//   GET  /sources
//     reply: { sources: { id: string, rowCount: number }[] }
//
//   GET  /health
//     reply: { status: 'ok', cluster: string }
//
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, opts)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Send a chat message to the backend.
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @param {string|null} sourceFilter  - data source id to restrict search, or null for all
 * @returns {Promise<{content: string, sources: SourceRef[], table?: TableData}>}
 */
export async function sendChatMessage(messages, sourceFilter = null) {
  return request('POST', '/chat', { messages, source_filter: sourceFilter })
}

// ── Files ─────────────────────────────────────────────────────────────────────

/**
 * List files/dirs at a Yen path.
 *
 * @param {string} path  - absolute path on Yen cluster
 * @returns {Promise<{entries: FileEntry[]}>}
 *
 * FileEntry: { name: string, type: 'file'|'dir', size?: number, modified?: string }
 */
export async function listFiles(path) {
  const encoded = encodeURIComponent(path)
  return request('GET', `/files?path=${encoded}`)
}

// ── Sources ───────────────────────────────────────────────────────────────────

/**
 * Fetch live row counts for all data sources.
 * Returns an array; merge with DATA_SOURCES by id.
 */
export async function fetchSourceCounts() {
  return request('GET', '/sources')
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function checkHealth() {
  return request('GET', '/health')
}
