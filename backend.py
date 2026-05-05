"""
backend.py — BankLab Query Backend
Runs on Yen. Reads CSVs, calls HuggingFace free API.
Start: python backend.py
"""
import os, subprocess
from pathlib import Path
from typing import Optional, List
from datetime import datetime
import pandas as pd
import requests
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN   = os.getenv("HF_TOKEN", "")
HF_MODEL   = "mistralai/Mistral-7B-Instruct-v0.3"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

CSV_FILES = {
    "fintech_timelines":  "/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_wayback/product_pages.csv",
    "call_reports":       "/zfs/data/bankcallreports/raw/current/data/panel_full_all_quarters.csv",
    "homepage_snapshots": "/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_wayback/homepage_snapshots.csv",
    "product_urls":       "/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_wayback/product_urls.csv",
    "master":             "/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_cleaned/fintech_timelines_master.csv",
    "missing_products":   "/zfs/projects/faculty/nazkoont-baas/fintech_timelines/Data_wayback/missing_products.csv",
    "recon_summary":      "/zfs/data/bankcallreports/derived/rc_assets_recon_summary.csv",
}

app = FastAPI(title="BankLab Query", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Message(BaseModel):
    role: str
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

def load_csv_sample(csv_path, max_rows=80):
    try:
        df = pd.read_csv(csv_path, on_bad_lines="skip", nrows=max_rows+1)
        total = len(df)
        df = df.head(max_rows)
        for col in df.columns:
            if df[col].dtype == object:
                df[col] = df[col].astype(str).str[:120]
        return df.to_csv(index=False), total
    except Exception as e:
        return f"[Could not load {csv_path}: {e}]", 0

def pick_relevant_csvs(user_message, source_filter):
    msg = user_message.lower()
    chosen = []
    if source_filter and source_filter != "all":
        path = CSV_FILES.get(source_filter)
        if path:
            chosen.append((source_filter, path))
    kw_map = [
        (["timeout","scrape","pipeline","phase","wayback","snapshot","homepage"],
         [("homepage_snapshots", CSV_FILES["homepage_snapshots"])]),
        (["product","financial","fintech","company","missing","542","url"],
         [("fintech_timelines", CSV_FILES["fintech_timelines"]),("product_urls", CSV_FILES["product_urls"])]),
        (["call report","bank","asset","liabilit","panel","quarter","qc","error","recon"],
         [("call_reports", CSV_FILES["call_reports"]),("recon_summary", CSV_FILES["recon_summary"])]),
        (["master","timeline","category","subcategory","launched"],
         [("master", CSV_FILES["master"])]),
        (["missing","never attempted"],
         [("missing_products", CSV_FILES["missing_products"])]),
    ]
    for keywords, paths in kw_map:
        if any(k in msg for k in keywords):
            for p in paths:
                if p not in chosen:
                    chosen.append(p)
    if not chosen:
        chosen = [("fintech_timelines", CSV_FILES["fintech_timelines"]),("call_reports", CSV_FILES["call_reports"])]
    return chosen[:2]

def build_context(user_message, source_filter):
    relevant = pick_relevant_csvs(user_message, source_filter)
    parts, sources = [], []
    for label, path in relevant:
        fname = Path(path).name
        sources.append(fname)
        csv_str, total = load_csv_sample(path)
        parts.append(f"### Dataset: {label} ({fname})\nTotal rows: {total}\nSample:\n```\n{csv_str}\n```")
    return "\n\n".join(parts), sources

SYSTEM_PROMPT = """You are BankLab Query, an AI research assistant for the Stanford Banking Lab.
You have access to real research datasets: call report panel for US banks (1976-2024),
fintech timelines with scraped product pages from 645+ companies (2005-2025), and more.
Answer accurately using the dataset samples. Be concise and research-focused.
Use markdown bold for key findings. Output markdown tables when showing data."""

def call_huggingface(messages, context):
    last_user = messages[-1].content if messages else ""
    prompt = f"<s>[INST] {SYSTEM_PROMPT}\n\nData from research database:\n{context}\n\nQuestion: {last_user} [/INST]"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": 600, "temperature": 0.2, "return_full_text": False, "do_sample": True}}
    resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    if resp.status_code == 503:
        raise HTTPException(503, "HF model loading — wait 20s and retry")
    if resp.status_code == 429:
        raise HTTPException(429, "HF rate limit — wait a minute")
    if not resp.ok:
        raise HTTPException(500, f"HF error {resp.status_code}: {resp.text[:200]}")
    result = resp.json()
    if isinstance(result, list) and result:
        return result[0].get("generated_text", "").strip()
    if isinstance(result, dict):
        return result.get("generated_text", str(result)).strip()
    return str(result)

def parse_markdown_table(text):
    lines = text.split("\n")
    table_lines = [l.strip() for l in lines if "|" in l]
    if len(table_lines) < 3:
        return None
    try:
        headers = [h.strip() for h in table_lines[0].split("|") if h.strip()]
        rows = []
        for row_line in table_lines[2:]:
            cells = [c.strip() for c in row_line.split("|") if c.strip()]
            if cells and len(cells) == len(headers):
                rows.append(cells)
        if not headers or not rows:
            return None
        return TableData(title="query result", source="live data", columns=headers, rows=rows)
    except:
        return None

def strip_table_from_text(text):
    return "\n".join(l for l in text.split("\n") if "|" not in l).strip()

@app.get("/health")
def health():
    return {"status": "ok", "cluster": "yen.stanford.edu", "timestamp": datetime.now().isoformat(), "hf_configured": bool(HF_TOKEN)}

@app.post("/chat", response_model=ChatReply)
def chat(req: ChatRequest):
    if not HF_TOKEN:
        raise HTTPException(500, "HF_TOKEN not set in .env on Yen")
    user_message = req.messages[-1].content if req.messages else ""
    context, sources = build_context(user_message, req.source_filter)
    raw_answer = call_huggingface(req.messages, context)
    table = parse_markdown_table(raw_answer)
    clean = strip_table_from_text(raw_answer) if table else raw_answer
    return ChatReply(content=clean, sources=sources, table=table)

@app.get("/files")
def list_files(path: str = Query(...)):
    p = Path(path)
    if not p.exists():
        raise HTTPException(404, f"Path not found: {path}")
    entries = []
    for item in sorted(p.iterdir()):
        stat = item.stat()
        entries.append({"name": item.name, "type": "dir" if item.is_dir() else "file",
                        "size": stat.st_size if item.is_file() else None,
                        "modified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d")})
    return {"entries": entries, "path": str(p)}

@app.get("/sources")
def sources():
    counts = []
    for src_id, path in CSV_FILES.items():
        try:
            r = subprocess.run(["wc", "-l", path], capture_output=True, text=True, timeout=5)
            n = int(r.stdout.strip().split()[0]) - 1
            counts.append({"id": src_id, "rowCount": max(0, n)})
        except:
            counts.append({"id": src_id, "rowCount": None})
    return {"sources": counts}

if __name__ == "__main__":
    import uvicorn
    print(f"HF Token: {'set ✓' if HF_TOKEN else 'MISSING'}")
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=False)
