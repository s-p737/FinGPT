import React from 'react'
import InlineTable from './InlineTable'
import { getExtStyle } from '../lib/utils'

const s = {
  row: (isUser) => ({
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    flexDirection: isUser ? 'row-reverse' : 'row',
    animation: 'fade-up 0.2s ease forwards',
  }),
  avatar: (isUser) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 500,
    fontFamily: 'var(--font-mono)',
    background: isUser ? '#0c2240' : 'var(--bg-elevated)',
    border: `1px solid ${isUser ? '#1a4f8a' : 'var(--border-subtle)'}`,
    color: isUser ? '#5b9bd5' : 'var(--text-secondary)',
    letterSpacing: '0.02em',
  }),
  bubble: (isUser) => ({
    maxWidth: '74%',
    padding: '10px 14px',
    borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
    fontSize: 13.5,
    lineHeight: 1.65,
    color: isUser ? '#c4d9ef' : 'var(--text-primary)',
    background: isUser ? '#0d1e35' : 'var(--bg-elevated)',
    border: `1px solid ${isUser ? '#1a3d6b' : 'var(--border-subtle)'}`,
  }),
  timestamp: {
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dim)',
    marginTop: 5,
    textAlign: 'right',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  tag: (ext) => ({
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    padding: '2px 7px',
    borderRadius: 4,
    background: ext.bg,
    border: `1px solid ${ext.border}`,
    color: ext.text,
    cursor: 'default',
    letterSpacing: '0.01em',
  }),
  // Inline bold/code formatting
  para: {
    margin: '0 0 8px',
  },
}

function renderContent(text) {
  // Simple markdown-ish rendering: **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.88em',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 3,
          padding: '1px 4px',
          color: 'var(--text-accent)',
        }}>
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function formatTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div style={s.row(isUser)}>
      <div style={s.avatar(isUser)}>
        {isUser ? 'SP' : 'BL'}
      </div>

      <div style={{ maxWidth: '74%' }}>
        <div style={s.bubble(isUser)}>
          {/* Split on newlines to preserve paragraph breaks */}
          {message.content.split('\n').map((line, i, arr) => (
            line.trim() === '' ? (
              i < arr.length - 1 ? <br key={i} /> : null
            ) : (
              <p key={i} style={{ ...s.para, marginBottom: i < arr.length - 1 ? 6 : 0 }}>
                {renderContent(line)}
              </p>
            )
          ))}

          {message.table && <InlineTable table={message.table} />}

          {message.sources && message.sources.length > 0 && (
            <div style={s.tagRow}>
              {message.sources.map((src, i) => {
                const ext = getExtStyle(src)
                return (
                  <span key={i} style={s.tag(ext)} title={src}>
                    {src}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <div style={s.timestamp}>{formatTime(message.timestamp)}</div>
      </div>
    </div>
  )
}
