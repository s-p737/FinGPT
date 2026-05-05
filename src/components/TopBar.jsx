import React from 'react'

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: 48,
    borderBottom: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 7,
    background: '#0c2240',
    border: '1px solid #1a4f8a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-tertiary)',
    letterSpacing: '0.02em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: (status) => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: status === 'connected' ? '#22a862'
              : status === 'disconnected' ? '#d44030'
              : '#e8a020',
    animation: status === 'connected' ? 'pulse-dot 2.5s ease infinite' : 'none',
  }),
  statusLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-tertiary)',
  },
  mockBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    padding: '2px 7px',
    borderRadius: 4,
    background: '#241a08',
    border: '1px solid #6b4608',
    color: '#fbbf24',
    letterSpacing: '0.04em',
  },
  clearBtn: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: 'var(--text-tertiary)',
    background: 'none',
    border: '1px solid var(--border-subtle)',
    borderRadius: 5,
    padding: '3px 9px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  },
}

export default function TopBar({ backendStatus, clusterInfo, useMock, onClear }) {
  const [hoverClear, setHoverClear] = React.useState(false)

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <div style={styles.logoMark}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="#5b9bd5" opacity="0.9"/>
            <rect x="9" y="2" width="5" height="2" rx="0.5" fill="#5b9bd5" opacity="0.6"/>
            <rect x="9" y="6" width="5" height="2" rx="0.5" fill="#5b9bd5" opacity="0.4"/>
            <rect x="2" y="9" width="5" height="5" rx="1" fill="#5b9bd5" opacity="0.6"/>
            <rect x="9" y="10" width="5" height="2" rx="0.5" fill="#5b9bd5" opacity="0.3"/>
            <rect x="9" y="13" width="5" height="1" rx="0.5" fill="#5b9bd5" opacity="0.2"/>
          </svg>
        </div>
        <div>
          <div style={styles.logoText}>BankLab.query</div>
          <div style={styles.logoSub}>{clusterInfo || 'yen.stanford.edu'} · snpatel7</div>
        </div>
      </div>

      <div style={styles.right}>
        {useMock && (
          <span style={styles.mockBadge}>mock mode</span>
        )}
        <div style={styles.statusGroup}>
          <div style={styles.dot(backendStatus)} />
          <span style={styles.statusLabel}>
            {backendStatus === 'connected'    ? 'backend connected'
           : backendStatus === 'disconnected' ? 'backend offline'
           : 'connecting…'}
          </span>
        </div>
        <button
          style={{
            ...styles.clearBtn,
            borderColor: hoverClear ? 'var(--border-default)' : undefined,
            color: hoverClear ? 'var(--text-secondary)' : undefined,
          }}
          onMouseEnter={() => setHoverClear(true)}
          onMouseLeave={() => setHoverClear(false)}
          onClick={onClear}
          title="Clear chat"
        >
          clear
        </button>
      </div>
    </div>
  )
}
