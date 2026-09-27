export interface Case {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  investigator: string;
  created_at: string;
  status: string;
  evidence_count?: number;
  high_risk_count?: number;
}

export interface Evidence {
  id: number;
  case_id: number;
  filename: string;
  path: string;
  file_size: number;
  sha256: string;
  mime_type: string;
  vendor: string;
  codec?: string;
  resolution?: string;
  duration?: number;
  fps?: number;
  frame_count?: number;
  bitrate?: number;
  camera_id?: string;
  created_at: string;
  analysis_status: string;
  metadata_json?: string;
  thumbnails?: string[];
}

export interface ForensicEvent {
  id: number;
  evidence_id: number;
  timestamp: number;
  timestamp_str?: string;
  event_type: string;
  confidence: number;
  description: string;
  risk_level: string;
  frame_index?: number;
  thumbnail_path?: string;
}

export interface TimelineEvent {
  id: number;
  case_id: number;
  evidence_id?: number;
  timestamp: number;
  timestamp_str?: string;
  source: string;
  event_type: string;
  description: string;
  confidence: number;
  risk_level: string;
}

export interface AuditLogEntry {
  id: number;
  case_id?: number;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
  previous_hash: string;
  current_hash: string;
  is_valid_chain?: boolean;
}

export interface AuditLedgerResponse {
  case_id?: number;
  is_tamper_evident: boolean;
  chain_integrity_valid: boolean;
  status: string;
  total_entries: number;
  audit_ledger: AuditLogEntry[];
}

export interface RiskFactor {
  category: string;
  severity: string;
  weight: number;
  description: string;
  evidence_ref?: string;
  timestamp?: string;
}

export interface RiskAssessment {
  case_id: number;
  overall_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  integrity_status: string;
  total_anomalies: number;
  factors: RiskFactor[];
  summary_text: string;
  reasons: string[];
  timeline_anomalies: Array<{
    type: string;
    timestamp: number;
    timestamp_str?: string;
    description: string;
  }>;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  group: string;
  status?: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationship: string;
}

export interface EvidenceGraphResponse {
  case_id: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: {
    total_nodes: number;
    total_edges: number;
    evidence_nodes: number;
    event_nodes: number;
  };
}
