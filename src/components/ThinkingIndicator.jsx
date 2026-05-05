import React, { useState, useEffect } from 'react'

const TRACES = [
  'scanning pipeline_log.txt…',
  'loading product_pages.csv…',
  'querying call report panel…',
  'reading fintech_timelines_master.csv…',
  'parsing intermediate_files…',
  'running query on cluster…',
  'scanning homepage_snapshots.csv…',
  'checking product_urls.csv…',
]

const s = {
  row: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    animation: 'fade-up 0.2s ease forwards',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-tertiary)',
    opacity: 0.7,
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '4px 14px 14px 14px',
  },
  dotsGroup: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  dot: (delay) => ({
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--text-tertiary)',
    animation: `blink 1.2s ease ${delay}s infinite`,
  }),
  trace: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-tertiary)',
  },
}

export default function ThinkingIndicator() {
  const [traceIdx, setTraceIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTraceIdx(i => (i + 1) % TRACES.length), 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={s.row}>
      <div style={s.avatar}>BL</div>
      <div style={s.indicator}>
        <div style={s.dotsGroup}>
          <div style={s.dot(0)} />
          <div style={s.dot(0.2)} />
          <div style={s.dot(0.4)} />
        </div>
        <span style={s.trace}>{TRACES[traceIdx]}</span>
      </div>
    </div>
  )
}
