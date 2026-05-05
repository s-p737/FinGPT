import { useState, useEffect } from 'react'
import { checkHealth, fetchSourceCounts } from '../lib/api'

export function useBackend() {
  const [status, setStatus] = useState('checking') // 'checking' | 'connected' | 'disconnected'
  const [clusterInfo, setClusterInfo] = useState(null)
  const [sourceCounts, setSourceCounts] = useState({})

  useEffect(() => {
    let cancelled = false

    async function probe() {
      try {
        const health = await checkHealth()
        if (!cancelled) {
          setStatus('connected')
          setClusterInfo(health.cluster || 'yen.stanford.edu')
        }
        try {
          const { sources } = await fetchSourceCounts()
          if (!cancelled) {
            const map = {}
            sources.forEach(s => { map[s.id] = s.rowCount })
            setSourceCounts(map)
          }
        } catch {
          // source counts are non-critical
        }
      } catch {
        if (!cancelled) setStatus('disconnected')
      }
    }

    probe()
    const interval = setInterval(probe, 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return { status, clusterInfo, sourceCounts }
}
