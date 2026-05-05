import React, { useState } from 'react'

const s = {
  wrapper: {
    marginTop: 12,
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    overflow: 'hidden',
    fontSize: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    background: 'var(--bg-base)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-secondary)',
  },
  headerRight: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-tertiary)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'var(--bg-elevated)',
  },
  th: {
    padding: '5px 10px',
    textAlign: 'left',
    fontWeight: 500,
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-tertiary)',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '5px 10px',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-subtle)',
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 10px',
    background: 'var(--bg-base)',
    borderTop: '1px solid var(--border-subtle)',
  },
  footerText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-tertiary)',
  },
  expandBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-accent)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
}

const PREVIEW_ROWS = 5

export default function InlineTable({ table }) {
  const [expanded, setExpanded] = useState(false)
  if (!table) return null

  const rows = expanded ? table.rows : table.rows.slice(0, PREVIEW_ROWS)
  const hasMore = table.rows.length > PREVIEW_ROWS

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.headerLeft}>{table.title}</span>
        <span style={s.headerRight}>from {table.source}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              {table.columns.map((col, i) => (
                <th key={i} style={s.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
              >
                {row.map((cell, ci) => (
                  <td key={ci} style={s.td}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div style={s.footer}>
          <span style={s.footerText}>
            showing {rows.length} of {table.rows.length} rows
          </span>
          <button style={s.expandBtn} onClick={() => setExpanded(e => !e)}>
            {expanded ? 'show less ↑' : `show all ${table.rows.length} ↓`}
          </button>
        </div>
      )}
    </div>
  )
}
