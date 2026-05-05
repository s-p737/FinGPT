import { FILE_EXTENSIONS } from './datasources'

export function getExtStyle(filename) {
  if (!filename) return FILE_EXTENSIONS.default
  const ext = filename.split('.').pop()?.toLowerCase()
  return FILE_EXTENSIONS[ext] || FILE_EXTENSIONS.default
}

export function formatRowCount(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

export function shortPath(fullPath) {
  if (!fullPath) return ''
  const parts = fullPath.split('/')
  return parts[parts.length - 1] || fullPath
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function parseSourceTags(text) {
  // Extract any backtick-wrapped filenames from AI response text
  const matches = [...text.matchAll(/`([^`]+\.(csv|py|sh|log|json|txt|html|png))`/g)]
  return [...new Set(matches.map(m => m[1]))]
}
