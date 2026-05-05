import React, { useState } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import InputBar from './components/InputBar'
import { useChat } from './hooks/useChat'
import { useBackend } from './hooks/useBackend'
import './styles/globals.css'

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--bg-base)',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  // Dev toggle bar for mock/live switching
  devBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 14px',
    background: '#0e1a0e',
    borderBottom: '1px solid #1a3a1a',
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: '#4ade80',
  },
  devToggle: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 4,
    background: '#0d2010',
    border: '1px solid #22a862',
    color: '#22a862',
    cursor: 'pointer',
  },
}

export default function App() {
  const [activeSource, setActiveSource] = useState('all')
  const { status, clusterInfo, sourceCounts } = useBackend()
  const { messages, isLoading, error, sendMessage, clearChat, useMock, setUseMock } = useChat(
    activeSource === 'all' ? null : activeSource
  )

  return (
    <div style={s.root}>
      <TopBar
        backendStatus={status}
        clusterInfo={clusterInfo}
        useMock={useMock}
        onClear={clearChat}
      />

      {/* Dev banner — remove once backend is live */}
      {useMock && (
        <div style={s.devBar}>
          <span>⚡ mock mode — responses are simulated</span>
          <button
            style={s.devToggle}
            onClick={() => setUseMock(false)}
            title="Disable mock mode (requires backend at REACT_APP_API_URL)"
          >
            connect backend →
          </button>
          <span style={{ marginLeft: 'auto', color: '#2a5a2a' }}>
            set REACT_APP_API_URL in .env to connect
          </span>
        </div>
      )}

      <div style={s.body}>
        <Sidebar
          activeSource={activeSource}
          onSourceChange={setActiveSource}
          sourceCounts={sourceCounts}
          onAsk={sendMessage}
        />

        <div style={s.main}>
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            error={error}
          />
          <InputBar
            onSend={sendMessage}
            isLoading={isLoading}
            activeSource={activeSource}
          />
        </div>
      </div>
    </div>
  )
}
