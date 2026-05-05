import React, { useState, useRef, useEffect } from 'react'
import { SUGGESTED_QUERIES } from '../lib/datasources'

const s = {
  container: {
    flexShrink: 0,
    borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
  },
  suggestionsWrap: {
    padding: '8px 14px 0',
    display: 'flex',
    gap: 6,
    flexWrap: 'nowrap',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  chip: (hover) => ({
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    padding: '4px 10px',
    borderRadius: 20,
    border: `1px solid ${hover ? 'var(--border-default)' : 'var(--border-subtle)'}`,
    background: hover ? 'var(--bg-elevated)' : 'transparent',
    color: hover ? 'var(--text-secondary)' : 'var(--text-tertiary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.1s',
    flexShrink: 0,
  }),
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    padding: '10px 14px 12px',
  },
  inputWrap: (focused) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    background: 'var(--bg-elevated)',
    border: `1px solid ${focused ? 'var(--border-strong)' : 'var(--border-default)'}`,
    borderRadius: 12,
    padding: '9px 10px 9px 14px',
    transition: 'border-color 0.15s',
  }),
  textarea: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: 13.5,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.5,
    minHeight: 21,
    maxHeight: 140,
  },
  sendBtn: (disabled) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: disabled ? 'var(--bg-hover)' : '#0d2d52',
    border: `1px solid ${disabled ? 'var(--border-subtle)' : '#1a4f8a'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
    opacity: disabled ? 0.5 : 1,
  }),
  hint: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-dim)',
    padding: '0 14px 8px',
    textAlign: 'right',
  },
}

// Show a rotating subset of suggestions
const SHOWN = 5

export default function InputBar({ onSend, isLoading, activeSource }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [hoveredChip, setHoveredChip] = useState(null)
  const [suggOffset, setSuggOffset] = useState(0)
  const textareaRef = useRef(null)

  const suggestions = SUGGESTED_QUERIES.slice(suggOffset, suggOffset + SHOWN)

  useEffect(() => {
    const id = setInterval(() => {
      setSuggOffset(o => (o + 1) % SUGGESTED_QUERIES.length)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const v = value.trim()
    if (!v || isLoading) return
    onSend(v)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function applyChip(text) {
    setValue(text)
    textareaRef.current?.focus()
  }

  const sourceLabel = activeSource !== 'all'
    ? SUGGESTED_QUERIES.find(() => true) && activeSource
    : null

  return (
    <div style={s.container}>
      <div style={s.suggestionsWrap}>
        {suggestions.map((q, i) => (
          <button
            key={i}
            style={s.chip(hoveredChip === i)}
            onMouseEnter={() => setHoveredChip(i)}
            onMouseLeave={() => setHoveredChip(null)}
            onClick={() => applyChip(q)}
          >
            {q.length > 40 ? q.slice(0, 38) + '…' : q}
          </button>
        ))}
      </div>

      <div style={s.inputRow}>
        <div style={s.inputWrap(focused)}>
          {activeSource && activeSource !== 'all' && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 4,
              background: '#0e1c30',
              border: '1px solid #1a4870',
              color: '#60a5fa',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}>
              {activeSource}
            </span>
          )}
          <textarea
            ref={textareaRef}
            style={s.textarea}
            placeholder="Ask about your data, pipeline status, files…"
            value={value}
            onChange={e => { setValue(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            disabled={isLoading}
          />
          <button
            style={s.sendBtn(!value.trim() || isLoading)}
            onClick={submit}
            disabled={!value.trim() || isLoading}
            title="Send (Enter)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke={(!value.trim() || isLoading) ? 'var(--text-dim)' : '#5b9bd5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={s.hint}>shift+enter for new line · enter to send</div>
    </div>
  )
}
