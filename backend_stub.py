"""
backend_stub.py
===============
Minimal FastAPI skeleton showing the exact API contract this frontend expects.
Run this locally (or on Yen) and point REACT_APP_API_URL at it.

Install:  pip install fastapi uvicorn pandas
Run:      uvicorn backend_stub:app --reload --port 8000

Once you have this working, replace the stub handlers with real logic:
  - /chat   → call an LLM (Claude API / OpenAI) with your CSV data as context
  - /files  → SSH to Yen and run `ls` or `find`
  - /sources → read row counts from your CSVs
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import subprocess, os

app = FastAPI(title="BankLab Query Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add your deployed frontend URL too
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str   # 'user' | 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    source_filter: Optional[str] = None

class TableData(BaseModel):
    title: str
    source: str
    columns: List[str]
    rows: List[List[str]]

class ChatReply(BaseModel):
    content: str
    sources: List[str] = []
    table: Optional[TableData] = None

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "cluster": "yen3.stanford.edu"}


@app.post("/chat", response_model=ChatReply)
def chat(req: ChatRequest):
    """
    TODO: implement real LLM + data retrieval here.
    
    Suggested approach:
      1. Parse user message to figure out which CSV/file they're asking about
      2. Load a sample of the relevant CSV (e.g. first 200 rows + column info)
      3. Send to Claude API with the data as context
      4. Parse Claude's response to extract table data if present
      5. Return { content, sources, table }
    """
    last = req.messages[-1].content if req.messages else ""
    return ChatReply(
        content=f"[stub] You asked: {last!r}. Connect real logic in backend_stub.py",
        sources=["backend_stub.py"],
        table=None,
    )


@app.get("/files")
def list_files(path: str = Query(..., description="Absolute path on Yen cluster")):
    """
    TODO: SSH to Yen and run ls/find.
    
    Use paramiko or subprocess + SSH config for the actual connection.
    """
    # Stub: return a fake listing
    return {
        "entries": [
            {"name": "product_pages.csv", "type": "file", "size": 53477376, "modified": "2026-04-20"},
            {"name": "homepage_snapshots.csv", "type": "file", "size": 14680064, "modified": "2026-04-10"},
            {"name": "intermediate_files", "type": "dir"},
            {"name": "html", "type": "dir"},
        ]
    }


@app.get("/sources")
def sources():
    """
    TODO: return live row counts by reading the actual CSV files on Yen.
    """
    return {
        "sources": [
            {"id": "call_reports",        "rowCount": 176000},
            {"id": "fintech_timelines",   "rowCount": 66704},
            {"id": "homepage_snapshots",  "rowCount": 31330},
            {"id": "product_urls",        "rowCount": 24435},
            {"id": "qc_outputs",          "rowCount": None},
        ]
    }
