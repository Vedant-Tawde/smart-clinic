#!/bin/bash
# SmartClinic - Run backend and frontend
# Usage: ./run.sh

echo "Starting SmartClinic..."

# Start backend in background
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
  echo "Creating venv..."
  python3 -m venv venv
fi
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -q -r requirements.txt
echo "Backend: http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd "$(dirname "$0")/frontend"
npm install --silent 2>/dev/null
echo "Frontend: http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Press Ctrl+C to stop"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
