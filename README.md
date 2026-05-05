# BankLab Query

AI-powered search interface for the Banking Lab research datasets on the Yen cluster.

## Stack
- React 18
- Lucide icons
- IBM Plex Mono + Libre Baskerville fonts (via Google Fonts)
- No other UI library dependencies

## Setup

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Data source panel + recent convos
│   ├── ChatArea.jsx         # Message thread
│   ├── MessageBubble.jsx    # Individual message with source tags / inline tables
│   ├── InputBar.jsx         # Textarea + send button + suggestion chips
│   ├── ThinkingIndicator.jsx
│   ├── InlineTable.jsx      # Mini CSV preview table inside a message
│   ├── FileExplorer.jsx     # Expandable file tree panel
│   └── TopBar.jsx           # Logo + connection status
├── hooks/
│   ├── useChat.js           # Chat state + send logic
│   └── useBackend.js        # API calls to your backend (stub → replace with real)
├── lib/
│   ├── api.js               # Backend API client (configure BASE_URL here)
│   ├── datasources.js       # Static metadata about your datasets
│   └── utils.js             # Helpers
├── styles/
│   └── globals.css          # CSS variables, resets, base styles
└── App.jsx
```

## Connecting to your backend

Edit `src/lib/api.js` and set `BASE_URL` to wherever your backend is running (e.g. a FastAPI server on Yen with SSH tunnel, or a cloud endpoint):

```js
const BASE_URL = 'http://localhost:8000'  // or your deployed URL
```

The backend is expected to implement:

```
POST /chat          { messages: [...], source_filter: string } → { reply, sources, table? }
GET  /files         { path: string } → { files: [...] }
GET  /sources       → { sources: [...] with row counts }
GET  /health        → { status: 'ok' }
```

See `src/lib/api.js` for the full contract.

## Git

```bash
git init
git add .
git commit -m "feat: initial banklab-query frontend"
git remote add origin https://github.com/YOUR_ORG/banklab-query.git
git push -u origin main
```
