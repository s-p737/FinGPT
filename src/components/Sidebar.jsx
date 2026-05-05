import React, { useState } from 'react'
import { DATA_SOURCES } from '../lib/datasources'
import { formatRowCount } from '../lib/utils'

const RECENT = [
  { id: 'r1', label: 'Liability panel errors',   query: 'What errors were found in the liabilities panel build?' },
  { id: 'r2', label: 'Timeout analysis',         query: 'Summarize the timeout analysis from the last pipeline run' },
  { id: 'r3', label: 'Missing 542 products',     query: 'Why were 542 products never attempted in phase 2c?' },
  { id: 'r4', label: 'JS fix with Playwright',   query: 'How many JS-only pages were fixed with Playwright in phase 2e?' },
  { id: 'r5', label: 'Discovery rate trend',     query: 'Show the URL discovery rate trend over time' },
]

const FILE_TREE = [
  {
    label: 'fintech_timelines/',
    path: '/zfs/projects/faculty/nazkoont-baas/fintech_timelines',
    children: [
      { label: 'Code/', children: [
        { label: '2_run_wayback_pipeline.sh', file: true },
        { label: '2a_scrape_homepages.py', file: true },
        { label: '2b_find_product_urls.py', file: true },
        { label: '2c_scrape_product_pages.py', file: true },
        { label: '2d_scrape_deep_terms.py', file: true },
        { label: '2e_fix_js_pages.py', file: true },
        { label: '3a_extract_context.py', file: true },
        { label: '3b_extract_product_info.py', file: true },
        { label: 'analyze_timeouts.py', file: true },
        { label: 'url_discovery_timeseries.py', file: true },
      ]},
      { label: 'Data_wayback/', children: [
        { label: 'product_pages.csv', file: true },
        { label: 'homepage_snapshots.csv', file: true },
        { label: 'product_urls.csv', file: true },
        { label: 'missing_products.csv', file: true },
        { label: 'html/', children: [
          { label: 'homepages/  (516 files)', file: true },
          { label: 'products/   (618 folders)', file: true },
        ]},
        { label: 'intermediate_files/', children: [
          { label: 'pipeline_log.txt', file: true },
          { label: 'product_pages_checkpoint.json', file: true },
          { label: 'homepage_checkpoint.json', file: true },
        ]},
      ]},
      { label: 'Data_cleaned/', children: [
        { label: 'fintech_timelines_master.csv', file: true },
        { label: 'banking_embedded_fintechs_unique.csv', file: true },
      ]},
    ],
  },
  {
    label: 'bankcallreports/',
    path: '/zfs/data/bankcallreports',
    children: [
      { label: 'raw/current/data/', children: [
        { label: 'panel_full_all_quarters.csv', file: true },
        { label: 'panel_liabilities_all_quarters.csv', file: true },
        { label: 'qc_outputs/', children: [
          { label: '*.png  (histograms)', file: true },
          { label: '*_stats.csv', file: true },
          { label: 'outliers_*.csv', file: true },
        ]},
      ]},
      { label: 'derived/', children: [
        { label: 'rc_assets_panel.csv', file: true },
        { label: 'rc_assets_recon_summary.csv', file: true },
      ]},
    ],
  },
]

const s = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    borderRight: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  section: {
    padding: '14px 10px 8px',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    marginBottom: 6,
    paddingLeft: 6,
  },
  divider: {
    height: 1,
    background: 'var(--border-subtle)',
    margin: '2px 10px',
  },
  chip: (active, hover) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 6,
    fontSize: 12,
    color: active ? 'var(--text-primary)' : hover ? 'var(--text-secondary)' : 'var(--text-secondary)',
    background: active ? 'var(--bg-elevated)' : hover ? 'var(--bg-hover)' : 'transparent',
    border: active ? '1px solid var(--border-default)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.1s',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  }),
  dot: (color) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
    opacity: 0.85,
  }),
  count: {
    marginLeft: 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text-tertiary)',
    flexShrink: 0,
  },
  treeNode: (depth, hover) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: `3px 8px 3px ${8 + depth * 12}px`,
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    color: hover ? 'var(--text-secondary)' : 'var(--text-tertiary)',
    cursor: 'pointer',
    background: hover ? 'var(--bg-hover)' : 'transparent',
    borderRadius: 4,
    transition: 'background 0.1s',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
}

function TreeNode({ node, depth = 0, onAsk }) {
  const [open, setOpen] = useState(depth < 1)
  const [hover, setHover] = useState(false)
  const isDir = !node.file

  return (
    <>
      <div
        style={s.treeNode(depth, hover)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => isDir ? setOpen(o => !o) : onAsk(`Tell me about the file ${node.label}`)}
      >
        <span style={{ color: 'var(--text-dim)', fontSize: 9, width: 8, flexShrink: 0 }}>
          {isDir ? (open ? '▾' : '▸') : '·'}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
      </div>
      {isDir && open && node.children && node.children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} onAsk={onAsk} />
      ))}
    </>
  )
}

export default function Sidebar({ activeSource, onSourceChange, sourceCounts, onAsk }) {
  const [hoverId, setHoverId] = useState(null)
  const [showTree, setShowTree] = useState(false)
  const [treeHover, setTreeHover] = useState(false)

  return (
    <div style={s.sidebar}>
      <div style={s.section}>
        <div style={s.sectionLabel}>data sources</div>
        {DATA_SOURCES.map(src => {
          const active = activeSource === src.id
          const hover = hoverId === src.id
          const count = sourceCounts[src.id] ?? src.rowCount
          return (
            <button
              key={src.id}
              style={s.chip(active, hover)}
              onMouseEnter={() => setHoverId(src.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onSourceChange(src.id)}
              title={src.description}
            >
              <div style={s.dot(src.color)} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{src.label}</span>
              <span style={s.count}>{formatRowCount(count)}</span>
            </button>
          )
        })}
      </div>

      <div style={s.divider} />

      <div style={s.section}>
        <div style={s.sectionLabel}>recent</div>
        {RECENT.map(item => (
          <button
            key={item.id}
            style={s.chip(false, hoverId === item.id)}
            onMouseEnter={() => setHoverId(item.id)}
            onMouseLeave={() => setHoverId(null)}
            onClick={() => onAsk(item.query)}
            title={item.query}
          >
            <span style={{ color: 'var(--text-dim)', fontSize: 10, flexShrink: 0 }}>↺</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11 }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <div style={s.divider} />

      <div style={s.section}>
        <button
          style={{
            ...s.chip(showTree, treeHover),
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
          }}
          onMouseEnter={() => setTreeHover(true)}
          onMouseLeave={() => setTreeHover(false)}
          onClick={() => setShowTree(o => !o)}
        >
          <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>{showTree ? '▾' : '▸'}</span>
          <span>file explorer</span>
        </button>

        {showTree && (
          <div style={{ marginTop: 4 }}>
            {FILE_TREE.map((root, i) => (
              <TreeNode key={i} node={root} depth={0} onAsk={onAsk} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
