@echo off
REM SmartClinic - Run backend and frontend (Windows)
echo Starting SmartClinic...

cd /d "%~dp0"

REM Start backend
cd backend
if not exist venv (
  echo Creating venv...
  python -m venv venv
)
call venv\Scripts\activate.bat
pip install -q -r requirements.txt
echo Backend: http://localhost:8000
start /b uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM Start frontend
cd ..\frontend
call npm install
echo Frontend: http://localhost:5173
call npm run dev
