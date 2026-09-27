@echo off
title CHRONOS-DVR Forensic Workstation - Frontend
echo ======================================================================
echo    CHRONOS-DVR: Forensic Workstation UI (Vite + React + Tailwind)
echo ======================================================================
echo.

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    npm install
)

echo [INFO] Launching Frontend Development Server on http://localhost:5173 ...
npm run dev
pause
