# CHRONOS-DVR
### Multi-Vendor DVR/NVR Forensic Analysis & Video Integrity Platform
**Smart India Hackathon (SIH 2026) Prototype**

---

## 🛡️ Overview

**CHRONOS-DVR** is an automated digital video forensic workstation engineered to ingest, verify, analyze, sequence, and risk-score surveillance footage across multiple CCTV DVR/NVR vendors (including **Hikvision**, **Dahua**, and generic video containers).

The platform enforces strict chain-of-custody protocols through bit-level preservation, cryptographic SHA-256 integrity validation, deterministic risk fusion, interactive relational evidence graphs, and a tamper-evident audit ledger with hash chaining.

---

## ⚡ Forensic Pipeline Architecture

```
Evidence Ingestion (Read-Only Preservation)
      ↓
Case Isolation & Registration
      ↓
Cryptographic Integrity Hashing (SHA-256)
      ↓
Vendor Signature & Stream Identification (Hikvision / Dahua / Generic)
      ↓
Video Container & Codec Extraction (OpenCV / Media Probing)
      ↓
Frame Sampling & Visual Keyframe Triage
      ↓
Timestamp & OCR Discontinuity Verification
      ↓
Forensic Event & Recording Gap Detection
      ↓
Chronological Timeline Sequencing
      ↓
Deterministic Risk Fusion Engine (LOW / MEDIUM / HIGH / CRITICAL)
      ↓
Relational Evidence Graph Generation (Case → Evidence → Camera → Timeline → Frame → Risk)
      ↓
Tamper-Evident Audit Ledger (Cryptographic SHA-256 Chaining)
      ↓
Official PDF Forensic Investigation Report Export (ReportLab)
```

---

## 🚀 Quickstart Guide (Windows Local Prototype)

### Option 1: 1-Click Launch (Backend + Frontend)
Double-click `START_ALL.bat` or run in terminal:
```cmd
START_ALL.bat
```
This automatically starts the FastAPI backend server on `http://127.0.0.1:8000` and launches the React frontend on `http://localhost:5173`.

---

### Option 2: Manual Start

#### 1. Backend (FastAPI + SQLite + OpenCV)
```powershell
# Activate Python virtual environment
.venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r backend\requirements.txt

# Start FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be accessible at `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend (Vite + React + TypeScript + Tailwind CSS)
```powershell
cd frontend
npm install
npm run dev
```
Workstation UI will be accessible at `http://localhost:5173`.

---

## 🔍 Key Capabilities & Modules

| Module | Description |
|---|---|
| **Dashboard** | Real-time workstation overview: active investigations, stream metrics, high-risk anomalies, and ledger validation. |
| **Case Directory** | Isolated investigation workspaces with investigator assignments and status tracking. |
| **Evidence Ingestion** | Drag-and-drop video upload, SHA-256 hash computation, vendor signature matching, and keyframe thumbnail strip. |
| **Forensic Timeline** | Multi-camera event sequencing, recording gap flags, clock jumps, and event inspector. |
| **Evidence Graph** | Interactive SVG node-link network visualizing the hierarchical structure from Case down to Risk factors. |
| **Risk Fusion** | Transparent, rule-based risk evaluation explaining *why* a risk score was assigned (e.g. recording gaps + clock anomalies). |
| **Audit Ledger** | Tamper-evident ledger using SHA-256 hash chaining (`current_hash = SHA256(prev_hash + data)`). |
| **Forensic Reports** | 1-Click official PDF forensic report generation using ReportLab engine with attestation signing blocks. |
| **Demo Mode** | Built-in **1-Click "Load Demo Investigation"** button that populates Case `CHR-DEMO-001` with synthetic CCTV video, recording gaps, and timestamp anomalies. |

---

## 🧪 Testing

Run backend tests using pytest:
```powershell
.venv\Scripts\python -m pytest backend\tests\test_api.py -v
```

---

## 🔒 Forensic Honesty & Disclaimer
- **Demonstration Data:** All synthetic videos and sample incident scenarios are explicitly labeled as `[DEMONSTRATION DATA]`.
- **Vendor Heuristics:** Stream analyses reflect detected container tags, OSD overlays, and timing heuristics. Full proprietary raw filesystem recovery is modularized for integration with specialized low-level hardware parsers.
- **Tamper-Evident Ledger:** Implements local SHA-256 sequential cryptographic hash chaining for auditable record integrity.
