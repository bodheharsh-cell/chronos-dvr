import React from 'react';
import {
  FolderLock,
  Film,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  PlusCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { Case, Evidence, RiskAssessment } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  cases: Case[];
  activeCase: Case | null;
  evidenceList: Evidence[];
  riskData: RiskAssessment | null;
  onNavigate: (tab: NavTab) => void;
  onSelectCase: (c: Case) => void;
  onLoadDemo: () => void;
  loadingDemo: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  activeCase,
  evidenceList,
  riskData,
  onNavigate,
  onSelectCase,
  onLoadDemo,
  loadingDemo,
}) => {
  const analyzedCount = evidenceList.filter((e) => e.analysis_status === 'COMPLETED').length;
  const highRiskEvents = riskData?.factors.filter((f) => f.severity === 'HIGH' || f.severity === 'CRITICAL').length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-forensic-850 via-forensic-800 to-forensic-850 border border-slate-800 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>FORENSIC EXAMINATION WORKSTATION ACTIVE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            DVR/NVR Forensic Multi-Vendor Reconstructor
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl">
            Autonomous acquisition, vendor stream parsing (Hikvision / Dahua / Generic), timestamp discontinuity detection, risk fusion, and tamper-evident audit ledger verification.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onLoadDemo}
            disabled={loadingDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-950 transition-all border border-cyan-400/40"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{loadingDemo ? 'Initializing Demo...' : 'Load Demo Investigation'}</span>
          </button>
          <button
            onClick={() => onNavigate('cases')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-forensic-750 hover:bg-forensic-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-400" />
            <span>New Case</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-950/20 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1: Active Cases */}
        <div className="p-4 rounded-xl bg-forensic-850 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Cases</span>
            <FolderLock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{cases.length}</div>
          <div className="text-[10px] text-slate-400">Registered in SQLite</div>
        </div>

        {/* Metric 2: Evidence Files */}
        <div className="p-4 rounded-xl bg-forensic-850 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Evidence Files</span>
            <Film className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{evidenceList.length}</div>
          <div className="text-[10px] text-slate-400">Preserved read-only</div>
        </div>

        {/* Metric 3: Analyzed Streams */}
        <div className="p-4 rounded-xl bg-forensic-850 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Analyzed Streams</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{analyzedCount}</div>
          <div className="text-[10px] text-slate-400">Frames & metadata parsed</div>
        </div>

        {/* Metric 4: High Risk Events */}
        <div className="p-4 rounded-xl bg-forensic-850 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">High Risk Events</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{highRiskEvents}</div>
          <div className="text-[10px] text-slate-400">Gaps & timestamp jumps</div>
        </div>

        {/* Metric 5: Integrity Ledger */}
        <div className="p-4 rounded-xl bg-forensic-850 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Integrity Ledger</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono tracking-wide">VERIFIED</div>
          <div className="text-[10px] text-slate-400">SHA-256 Chained Hash</div>
        </div>
      </div>

      {/* Main Grid: Active Investigation Overview & Quick Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Case Detail & Direct Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="font-semibold text-white text-sm">Active Case Workspace</h2>
              </div>
              {activeCase && (
                <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                  {activeCase.case_number}
                </span>
              )}
            </div>

            {activeCase ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-slate-100">{activeCase.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{activeCase.description || 'No description provided.'}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-forensic-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">INVESTIGATOR</span>
                    <span className="text-slate-200 font-medium">{activeCase.investigator}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-forensic-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">STATUS</span>
                    <span className="text-emerald-400 font-medium">{activeCase.status}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-forensic-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">OVERALL RISK</span>
                    <span className={`font-bold ${riskData?.overall_risk === 'HIGH' || riskData?.overall_risk === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {riskData?.overall_risk || 'CALCULATING...'}
                    </span>
                  </div>
                </div>

                {/* Workflow Navigation Quick Buttons */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => onNavigate('evidence')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-200 text-xs border border-slate-700"
                  >
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload & Analyze Evidence</span>
                    <ArrowRight className="w-3 h-3 ml-1 text-slate-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('timeline')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-200 text-xs border border-slate-700"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>Forensic Timeline</span>
                  </button>
                  <button
                    onClick={() => onNavigate('graph')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-200 text-xs border border-slate-700"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Evidence Graph</span>
                  </button>
                  <button
                    onClick={() => onNavigate('reports')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-200 text-xs border border-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export PDF Report</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 space-y-3">
                <p className="text-xs">No active case selected yet.</p>
                <button
                  onClick={onLoadDemo}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded-lg inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Demo Case (CHR-DEMO-001)</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Evidence Preview Strip */}
          {evidenceList.length > 0 && (
            <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Ingested Evidence Items ({evidenceList.length})
                </h3>
                <button
                  onClick={() => onNavigate('evidence')}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg bg-forensic-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-100 truncate">{ev.filename}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                        {ev.vendor}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      SHA-256: <span className="text-slate-300">{ev.sha256.slice(0, 16)}...</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{ev.resolution || 'Probed'} • {ev.codec || 'H.264'}</span>
                      <span className={ev.analysis_status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}>
                        {ev.analysis_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Recent Investigations & Forensic Pipeline Stages */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
              Recent Investigations
            </h3>
            <div className="space-y-2">
              {cases.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                    activeCase?.id === c.id
                      ? 'bg-cyan-950/40 border-cyan-600 text-white'
                      : 'bg-forensic-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-cyan-400">{c.case_number}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-slate-200 truncate mt-1">{c.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Forensic Pipeline Visual Walkthrough */}
          <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-2 text-xs">
            <h3 className="font-semibold text-slate-200 font-mono text-xs uppercase">
              Forensic Workflow Protocol
            </h3>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">01.</span>
                <span>Evidence Ingestion & SHA-256 Hash</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">02.</span>
                <span>Vendor Signature & Stream Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">03.</span>
                <span>Frame Sampling & Timestamp OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">04.</span>
                <span>Event Detection & Continuity Gap Check</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">05.</span>
                <span>Risk Fusion & Evidence Graphing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">06.</span>
                <span>Tamper-Evident Ledger Chaining & Report</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
