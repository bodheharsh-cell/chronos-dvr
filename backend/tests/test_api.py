import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"


def test_demo_load_and_flow():
    # 1. Load Demo Investigation
    res = client.post("/api/demo/load")
    assert res.status_code == 200
    case_data = res.json()
    assert case_data["case_number"] == "CHR-DEMO-001"
    case_id = case_data["id"]

    # 2. Get Case Info
    res = client.get(f"/api/cases/{case_id}")
    assert res.status_code == 200
    assert res.json()["case_number"] == "CHR-DEMO-001"

    # 3. Get Evidence
    res = client.get(f"/api/cases/{case_id}/evidence")
    assert res.status_code == 200
    ev_list = res.json()
    assert len(ev_list) >= 1
    assert "camera_01.mp4" in ev_list[0]["filename"]
    assert len(ev_list[0]["sha256"]) == 64

    # 4. Get Timeline
    res = client.get(f"/api/cases/{case_id}/timeline")
    assert res.status_code == 200
    timeline = res.json()
    assert len(timeline) >= 1

    # 5. Get Risk Assessment
    res = client.get(f"/api/cases/{case_id}/risk")
    assert res.status_code == 200
    risk = res.json()
    assert risk["overall_risk"] in ["HIGH", "CRITICAL", "MEDIUM", "LOW"]
    assert len(risk["reasons"]) >= 1

    # 6. Get Audit Ledger
    res = client.get(f"/api/cases/{case_id}/audit")
    assert res.status_code == 200
    audit = res.json()
    assert audit["is_tamper_evident"] is True
    assert audit["chain_integrity_valid"] is True

    # 7. Get Evidence Graph
    res = client.get(f"/api/cases/{case_id}/graph")
    assert res.status_code == 200
    graph = res.json()
    assert len(graph["nodes"]) >= 4
    assert len(graph["edges"]) >= 3

    # 8. Download PDF Report
    res = client.get(f"/api/cases/{case_id}/report")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 1000
