#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "=== BankLab Query — Yen Backend ==="
[ ! -f .env ] && echo "ERROR: no .env file. Run: cp .env.example .env" && exit 1
source .env
[ -z "$HF_TOKEN" ] && echo "ERROR: HF_TOKEN not set in .env" && exit 1
echo "✓ HF_TOKEN found"
pip install fastapi uvicorn pandas requests python-dotenv --break-system-packages -q
echo "✓ deps installed"
if ! command -v ngrok &>/dev/null; then
  mkdir -p ~/.local/bin
  wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz -O /tmp/ngrok.tgz
  tar -xzf /tmp/ngrok.tgz -C ~/.local/bin
  export PATH="$HOME/.local/bin:$PATH"
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi
[ -n "$NGROK_TOKEN" ] && ngrok config add-authtoken "$NGROK_TOKEN" >/dev/null 2>&1
nohup python backend.py > backend.log 2>&1 &
echo $! > .pids
sleep 3
nohup ngrok http 8000 --log=stdout > ngrok.log 2>&1 &
echo "$! $(cat .pids)" > .pids
sleep 4
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
for t in d.get('tunnels',[]):
  if t.get('proto')=='https': print(t['public_url']); break
" 2>/dev/null)
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║           ✓ BACKEND IS LIVE                     ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  URL: $NGROK_URL"
echo "║  → Paste into Vercel as REACT_APP_API_URL       ║"
echo "╚══════════════════════════════════════════════════╝"
