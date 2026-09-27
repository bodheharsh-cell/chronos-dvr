import {
  Case,
  Evidence,
  ForensicEvent,
  TimelineEvent,
  AuditLedgerResponse,
  RiskAssessment,
  EvidenceGraphResponse,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchCases(): Promise<Case[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function fetchCase(caseId: number): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
  return res.json();
}

export async function createCase(payload: {
  case_number: string;
  title: string;
  description?: string;
  investigator: string;
}): Promise<Case> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Creation failed' }));
    throw new Error(err.detail || 'Failed to create case');
  }
  return res.json();
}

export async function loadDemoInvestigation(): Promise<Case> {
  const res = await fetch(`${API_BASE}/demo/load`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to load demo investigation');
  return res.json();
}

export async function fetchEvidence(caseId: number): Promise<Evidence[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
  if (!res.ok) throw new Error('Failed to fetch evidence');
  return res.json();
}

export async function uploadEvidence(
  caseId: number,
  file: File,
  cameraId = 'CAM_01',
  investigator = 'INVESTIGATOR'
): Promise<Evidence> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('camera_id', cameraId);
  formData.append('investigator', investigator);

  const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload evidence');
  return res.json();
}

export async function analyzeEvidence(evidenceId: number): Promise<Evidence> {
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Analysis request failed');
  return res.json();
}

export async function fetchTimeline(caseId: number): Promise<TimelineEvent[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function fetchEvents(caseId: number): Promise<ForensicEvent[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchRisk(caseId: number): Promise<RiskAssessment> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/risk`);
  if (!res.ok) throw new Error('Failed to fetch risk assessment');
  return res.json();
}

export async function fetchAuditTrail(caseId: number): Promise<AuditLedgerResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/audit`);
  if (!res.ok) throw new Error('Failed to fetch audit ledger');
  return res.json();
}

export async function fetchEvidenceGraph(caseId: number): Promise<EvidenceGraphResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/graph`);
  if (!res.ok) throw new Error('Failed to fetch evidence graph');
  return res.json();
}

export function getReportDownloadUrl(caseId: number): string {
  return `${API_BASE}/cases/${caseId}/report`;
}
