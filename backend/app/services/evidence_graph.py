from __future__ import annotations

from typing import List, Dict, Any
from backend.app.schemas.graph import GraphNode, GraphEdge, EvidenceGraphResponse
from backend.app.models.case import Case
from backend.app.models.evidence import Evidence
from backend.app.models.event import Event
from backend.app.models.timeline import TimelineEvent
from backend.app.schemas.risk import RiskAssessment


def build_evidence_graph(
    case: Case,
    evidence_list: List[Evidence],
    events_list: List[Event],
    timeline_list: List[TimelineEvent],
    risk: RiskAssessment,
) -> EvidenceGraphResponse:
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

    # 1. Root Case Node
    case_node_id = f"case_{case.id}"
    nodes.append(GraphNode(
        id=case_node_id,
        label=f"Case {case.case_number}",
        type="CASE",
        group="CASE",
        status="ACTIVE",
        properties={
            "title": case.title,
            "investigator": case.investigator,
            "created_at": str(case.created_at),
        },
    ))

    # 2. Risk Node
    risk_node_id = f"risk_{case.id}"
    nodes.append(GraphNode(
        id=risk_node_id,
        label=f"Risk: {risk.overall_risk} ({risk.risk_score:.0f}%)",
        type="RISK",
        group="RISK",
        status=risk.overall_risk,
        properties={
            "overall_risk": risk.overall_risk,
            "risk_score": risk.risk_score,
            "integrity_status": risk.integrity_status,
            "reasons": risk.reasons,
        },
    ))
    edges.append(GraphEdge(
        id=f"edge_{case_node_id}_{risk_node_id}",
        source=case_node_id,
        target=risk_node_id,
        label="EVALUATED_AS",
        relationship="INDICATES",
    ))

    # 3. Evidence and Camera Nodes
    camera_nodes_created = set()

    for ev in evidence_list:
        ev_node_id = f"ev_{ev.id}"
        nodes.append(GraphNode(
            id=ev_node_id,
            label=f"Evidence: {ev.filename}",
            type="EVIDENCE",
            group="EVIDENCE",
            status=ev.analysis_status,
            properties={
                "sha256": ev.sha256,
                "vendor": ev.vendor,
                "duration": ev.duration,
                "resolution": ev.resolution,
                "codec": ev.codec,
                "file_size": ev.file_size,
            },
        ))
        edges.append(GraphEdge(
            id=f"edge_{case_node_id}_{ev_node_id}",
            source=case_node_id,
            target=ev_node_id,
            label="INCLUDES",
            relationship="CONTAINS",
        ))

        # Camera Node
        cam_id = ev.camera_id or "CAM_01"
        cam_node_id = f"cam_{cam_id}"
        if cam_node_id not in camera_nodes_created:
            nodes.append(GraphNode(
                id=cam_node_id,
                label=f"Camera Source: {cam_id}",
                type="CAMERA",
                group="CAMERA",
                status="ACTIVE",
                properties={"camera_id": cam_id, "vendor": ev.vendor},
            ))
            camera_nodes_created.add(cam_node_id)

        edges.append(GraphEdge(
            id=f"edge_{ev_node_id}_{cam_node_id}",
            source=ev_node_id,
            target=cam_node_id,
            label="CAPTURED_BY",
            relationship="CAPTURED_BY",
        ))

        # Analysis Result Node
        analysis_node_id = f"analysis_{ev.id}"
        nodes.append(GraphNode(
            id=analysis_node_id,
            label=f"Analysis: {ev.vendor} ({ev.codec or 'H.264'})",
            type="ANALYSIS",
            group="ANALYSIS",
            status=ev.analysis_status,
            properties={
                "vendor": ev.vendor,
                "fps": ev.fps,
                "frame_count": ev.frame_count,
                "resolution": ev.resolution,
            },
        ))
        edges.append(GraphEdge(
            id=f"edge_{ev_node_id}_{analysis_node_id}",
            source=ev_node_id,
            target=analysis_node_id,
            label="PRODUCES",
            relationship="GENERATED",
        ))
        edges.append(GraphEdge(
            id=f"edge_{analysis_node_id}_{risk_node_id}",
            source=analysis_node_id,
            target=risk_node_id,
            label="CONTRIBUTES_TO",
            relationship="INDICATES",
        ))

    # 4. Events / Timeline Nodes
    for i, event in enumerate(events_list):
        event_node_id = f"event_{event.id}"
        nodes.append(GraphNode(
            id=event_node_id,
            label=f"{event.event_type} @ {event.timestamp_str or f'{event.timestamp}s'}",
            type="TIMELINE_EVENT",
            group="EVENT",
            status=event.risk_level,
            properties={
                "event_type": event.event_type,
                "timestamp": event.timestamp,
                "description": event.description,
                "confidence": event.confidence,
                "risk_level": event.risk_level,
            },
        ))

        ev_node_id = f"ev_{event.evidence_id}"
        edges.append(GraphEdge(
            id=f"edge_{ev_node_id}_{event_node_id}",
            source=ev_node_id,
            target=event_node_id,
            label="DETECTED",
            relationship="GENERATED",
        ))

        # Frame Node if attached
        if event.thumbnail_path or event.frame_index is not None:
            frame_node_id = f"frame_{event.id}"
            nodes.append(GraphNode(
                id=frame_node_id,
                label=f"Frame #{event.frame_index or i}",
                type="FRAME",
                group="FRAME",
                status="SAMPLED",
                properties={
                    "frame_index": event.frame_index,
                    "thumbnail": event.thumbnail_path,
                    "timestamp": event.timestamp,
                },
            ))
            edges.append(GraphEdge(
                id=f"edge_{event_node_id}_{frame_node_id}",
                source=event_node_id,
                target=frame_node_id,
                label="CORROBORATED_BY",
                relationship="ASSOCIATED_WITH",
            ))

    stats = {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "evidence_nodes": len(evidence_list),
        "event_nodes": len(events_list),
    }

    return EvidenceGraphResponse(
        case_id=case.id,
        nodes=nodes,
        edges=edges,
        stats=stats,
    )
