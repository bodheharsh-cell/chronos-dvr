from __future__ import annotations

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.database import init_db, BASE_DIR
from backend.app.routers import (
    health,
    cases,
    evidence,
    timeline,
    risk,
    audit,
    graph,
    report,
    demo,
)

# Initialize database tables
init_db()

# Ensure directories exist
UPLOADS_DIR = BASE_DIR / "uploads"
FRAMES_DIR = BASE_DIR / "frames"
REPORTS_DIR = BASE_DIR / "reports"
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
FRAMES_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="CHRONOS-DVR Forensic Platform",
    description="Multi-Vendor DVR/NVR Forensic Analysis & Video Integrity Platform - SIH 2026 Prototype",
    version="1.0.0",
)

# CORS Configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static storage for evidence files and frame thumbnails
app.mount("/static/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.mount("/static/frames", StaticFiles(directory=str(FRAMES_DIR)), name="frames")
app.mount("/static/reports", StaticFiles(directory=str(REPORTS_DIR)), name="reports")

# Include Routers
app.include_router(health.router)
app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(timeline.router)
app.include_router(risk.router)
app.include_router(audit.router)
app.include_router(graph.router)
app.include_router(report.router)
app.include_router(demo.router)

# Mount frontend distribution assets if built
if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes and static paths through
        if full_path.startswith("api/") or full_path.startswith("static/"):
            return None
        file_target = FRONTEND_DIST / full_path
        if file_target.exists() and file_target.is_file():
            return FileResponse(file_target)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "platform": "CHRONOS-DVR",
            "subtitle": "Multi-Vendor DVR/NVR Forensic Analysis Platform",
            "status": "ONLINE",
            "docs_url": "/docs",
            "api_health": "/api/health",
        }
