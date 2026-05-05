import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import ThinkingIndicator from './ThinkingIndicator'

const s = {
  area: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 20px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  error: {
    padding: '10px 14px',
    background: '#1a0e0e',
    border: '1px solid #6b2020',
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    color: '#f87171',
  },
  spacer: { flexShrink: 0, height: 4 },
}

export default function ChatArea({ messages, isLoading, error }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div style={s.area}>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && <ThinkingIndicator />}

      {error && (
        <div style={s.error}>
          ✗ {error}
        </div>
      )}

      <div style={s.spacer} ref={bottomRef} />
    </div>
  )
}
