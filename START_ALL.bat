@echo off
title CHRONOS-DVR Forensic Platform Launcher
echo ======================================================================
echo    Launching CHRONOS-DVR Forensic Platform (Backend + Frontend)
echo ======================================================================
echo.

cd /d "%~dp0"

start "CHRONOS-DVR Backend (FastAPI)" cmd /k "%~dp0START_BACKEND.bat"
timeout /t 3 /nobreak >nul
start "CHRONOS-DVR Frontend (React/Vite)" cmd /k "%~dp0START_FRONTEND.bat"

echo.
echo ======================================================================
echo    Both Backend (http://127.0.0.1:8000) and
echo    Frontend (http://localhost:5173) are starting!
echo ======================================================================
timeout /t 5 >nul
start http://localhost:5173
