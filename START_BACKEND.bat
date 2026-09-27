@echo off
title CHRONOS-DVR Forensic Platform - Backend
echo ======================================================================
echo    CHRONOS-DVR: Multi-Vendor DVR/NVR Forensic Analysis Platform
echo    Smart India Hackathon 2026 Prototype Engine
echo ======================================================================
echo.

cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in .venv. Creating one...
    python -m venv .venv
    .venv\Scripts\pip install -r backend\requirements.txt
)

echo [INFO] Starting FastAPI Uvicorn Server on http://127.0.0.1:8000 ...
.venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
