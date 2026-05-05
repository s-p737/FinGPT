#!/bin/bash
pkill -f "python backend.py" || true
pkill -f "ngrok http" || true
rm -f .pids
echo "✓ stopped"
