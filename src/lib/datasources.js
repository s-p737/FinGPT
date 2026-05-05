// Static metadata about your research datasets.
// Row counts here are stubs — the real ones come from GET /sources in your backend.

export const DATA_SOURCES = [
  {
    id: 'all',
    label: 'All sources',
    color: '#22a862',
    rowCount: null,
    path: null,
    description: 'Search across all connected datasets',
  },
  {
    id: 'call_reports',
    label: 'Call reports',
    color: '#2a85e8',
    rowCount: 176000,
    path: '/zfs/data/bankcallreports',
    description: 'FFIEC bank call report panel, 1976–2024',
    files: [
      'raw/current/data/panel_full_all_quarters.csv',
      'raw/current/data/panel_liabilities_all_quarters.csv',
      'derived/rc_assets_panel.csv',
      'derived/rc_assets_recon_summary.csv',
    ],
  },
  {
    id: 'fintech_timelines',
    label: 'Fintech timelines',
    color: '#7a5acc',
    rowCount: 63000,
    path: '/zfs/projects/faculty/nazkoont-baas/fintech_timelines',
    description: 'Wayback-scraped fintech product pages, 2005–2025',
    files: [
      'Data_wayback/product_pages.csv',
      'Data_wayback/homepage_snapshots.csv',
      'Data_wayback/product_urls.csv',
      'Data_cleaned/fintech_timelines_master.csv',
    ],
  },
  {
    id: 'homepage_snapshots',
    label: 'Homepage snapshots',
    color: '#e8a020',
    rowCount: 31330,
    path: '/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_wayback',
    description: 'Company homepage HTML snapshots, semi-annual',
    files: ['homepage_snapshots.csv'],
  },
  {
    id: 'product_urls',
    label: 'Product URLs',
    color: '#d44030',
    rowCount: 24435,
    path: '/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_wayback',
    description: 'Discovered product page URLs per company',
    files: ['product_urls.csv'],
  },
  {
    id: 'qc_outputs',
    label: 'QC outputs',
    color: '#22a862',
    rowCount: null,
    path: '/zfs/data/bankcallreports/raw/current/data/qc_outputs',
    description: 'QC plots, outlier tables, per-quarter histograms',
    files: null,
  },
]

export const SUGGESTED_QUERIES = [
  'How many financial products are in product_pages.csv?',
  'Show the top 10 companies with the most scraping timeouts',
  'What are the 542 missing products and their subcategories?',
  'What is the URL discovery rate trend over time?',
  'Show the liabilities panel QC summary',
  'List all CSV files in the fintech_timelines project',
  'How many rows have text_length = 0 in product_pages.csv?',
  'Which banks had the largest proportional errors in the call report panel?',
]

export const FILE_EXTENSIONS = {
  csv:  { bg: '#0e2418', border: '#1a5c32', text: '#4ade80' },
  py:   { bg: '#0e1c30', border: '#1a4870', text: '#60a5fa' },
  log:  { bg: '#241a08', border: '#6b4608', text: '#fbbf24' },
  html: { bg: '#1a0e2e', border: '#4a2080', text: '#c084fc' },
  sh:   { bg: '#1a1010', border: '#6b2020', text: '#f87171' },
  json: { bg: '#141c10', border: '#3a5018', text: '#86efac' },
  txt:  { bg: '#181818', border: '#404040', text: '#a1a1aa' },
  png:  { bg: '#1c1018', border: '#5a2870', text: '#e879f9' },
  default: { bg: '#181820', border: '#303050', text: '#8b95a8' },
}
