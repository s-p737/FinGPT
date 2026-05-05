import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '../lib/api'
import { generateId, parseSourceTags } from '../lib/utils'

// ── Mock response for dev when backend isn't connected ────────────────────────
const MOCK_RESPONSES = [
  {
    content: "I found **1,956 timeouts** in the pipeline log, almost all in phase 2a (1,953). Only 64 URLs exhausted all 3 retry attempts. Here are the top offenders:",
    sources: ['pipeline_log.txt', 'analyze_timeouts.py'],
    table: {
      title: 'timeout counts · phase 2a',
      source: 'pipeline_log.txt',
      columns: ['#', 'company', 'timeouts'],
      rows: [
        ['1', 'Imerchant Direct', '31'],
        ['2', 'The Beans', '26'],
        ['3', 'Level', '24'],
        ['4', 'Clearing', '23'],
        ['5', 'Seneca Women', '23'],
      ],
    },
  },
  {
    content: "The **542 never-attempted products** all pass the `is_financial_product()` filter when their subcategory is present. The root cause was a missing `product_subcategory` column when 2c loaded them. Top subcategories:",
    sources: ['missing_products_never_attempted.csv', '2_wayback_utils.py'],
    table: {
      title: 'missing products by subcategory',
      source: 'missing_products_never_attempted.csv',
      columns: ['subcategory', 'count'],
      rows: [
        ['Payments', '131'],
        ['Banking (Consumer)', '95'],
        ['Credit Cards', '76'],
        ['Lending (Consumer)', '47'],
        ['Money Transfer', '34'],
      ],
    },
  },
  {
    content: "URL discovery rate has risen steadily from **58.6%** in 2021-01 to **76.6%** in 2025-07. Pre-2014 rates are near 0% due to limited Wayback Machine coverage for early-stage fintechs.",
    sources: ['url_discovery_timeseries.csv', 'url_discovery_timeseries.py'],
    table: {
      title: 'url discovery rate · semi-annual',
      source: 'url_discovery_timeseries.csv',
      columns: ['period', 'n_launched', 'n_found', 'share_found'],
      rows: [
        ['2021-01', '1993', '1167', '58.6%'],
        ['2022-01', '2394', '1519', '63.5%'],
        ['2023-01', '2749', '1890', '68.8%'],
        ['2024-01', '3076', '2246', '73.0%'],
        ['2025-01', '3259', '2473', '75.9%'],
      ],
    },
  },
]

let mockIdx = 0

function getMockResponse(userMessage) {
  const lower = userMessage.toLowerCase()
  if (lower.includes('timeout')) return MOCK_RESPONSES[0]
  if (lower.includes('542') || lower.includes('missing')) return MOCK_RESPONSES[1]
  if (lower.includes('discovery') || lower.includes('url') || lower.includes('rate')) return MOCK_RESPONSES[2]
  const resp = MOCK_RESPONSES[mockIdx % MOCK_RESPONSES.length]
  mockIdx++
  return resp
}

// ─────────────────────────────────────────────────────────────────────────────

export function useChat(sourceFilter) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi Stuti. I'm connected to your Yen cluster data. Ask me anything about your call report panel, fintech timelines pipeline, QC outputs, or any files in the project. I can pull rows, run summaries, and return file paths.",
      sources: [
        'panel_full_all_quarters.csv',
        'product_pages.csv',
        'build_liabilities.py',
        'pipeline_log.txt',
      ],
      table: null,
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useMock, setUseMock] = useState(true) // flip to false once backend is live
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      sources: [],
      table: null,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      let reply

      if (useMock) {
        // Simulated latency while backend isn't connected
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
        const mock = getMockResponse(text)
        reply = {
          ...mock,
          sources: mock.sources || parseSourceTags(mock.content),
        }
      } else {
        const history = messages.map(m => ({ role: m.role, content: m.content }))
        reply = await sendChatMessage([...history, { role: 'user', content: text }], sourceFilter)
      }

      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: reply.content,
        sources: reply.sources || [],
        table: reply.table || null,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, sourceFilter, useMock])

  const clearChat = useCallback(() => {
    setMessages(prev => [prev[0]]) // keep welcome message
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat, useMock, setUseMock }
}
