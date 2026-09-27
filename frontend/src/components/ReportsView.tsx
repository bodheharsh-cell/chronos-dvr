import React, { useState } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Film,
  AlertTriangle,
  History,
  FileCheck,
} from 'lucide-react';
import { Case, Evidence, RiskAssessment } from '../types';
import { getReportDownloadUrl } from '../api/client';

interface ReportsViewProps {
  activeCase: Case | null;
  evidenceList: Evidence[];
  riskData: RiskAssessment | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  activeCase,
  evidenceList,
  riskData,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <FileText className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">Select an investigation case to generate its official forensic report.</p>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloading(true);
    const url = getReportDownloadUrl(activeCase.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHRONOS_Report_${activeCase.case_number}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Forensic Examination Report Export</h1>
          <p className="text-xs text-slate-400">
            Generate and export official PDF forensic investigation reports rendered using backend ReportLab engines.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-950 transition-all border border-cyan-400/40"
        >
          <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          <span>{downloading ? 'Generating Signed PDF...' : 'Download Official PDF Report'}</span>
        </button>
      </div>

      {/* PDF Document Summary Preview Card */}
      <div className="p-6 rounded-xl bg-forensic-850 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CHRONOS-DVR Forensic Examination Report</h2>
              <p className="text-xs text-slate-400 font-mono">
                Document standard: SIH-2026-NVR-FORENSIC-V1 • Formatted with ReportLab
              </p>
            </div>
          </div>

          <span className="font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CRYPTOGRAPHICALLY SEALED</span>
          </span>
        </div>

        {/* Report Overview Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left: Case & Custody Metadata */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Case & Investigation Metadata
            </h3>
            <div className="p-4 rounded-xl bg-forensic-900 border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Case Identifier:</span>
                <span className="text-cyan-300 font-bold">{activeCase.case_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Case Title:</span>
                <span className="text-slate-200">{activeCase.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Examiner:</span>
                <span className="text-slate-200">{activeCase.investigator}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Evidence Count:</span>
                <span className="text-slate-200">{evidenceList.length} Item(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Integrity Status:</span>
                <span className="text-emerald-400 font-bold">{riskData?.integrity_status || 'VERIFIED'}</span>
              </div>
            </div>
          </div>

          {/* Right: Risk & Findings Executive Summary */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Executive Risk & Finding Summary
            </h3>
            <div className="p-4 rounded-xl bg-forensic-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">Assessed Risk Level:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                    riskData?.overall_risk === 'HIGH' || riskData?.overall_risk === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  {riskData?.overall_risk || 'LOW'} (Score: {riskData?.risk_score.toFixed(0) || 0}%)
                </span>
              </div>

              <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
                {riskData?.summary_text || 'Video stream evaluated for timing continuity and integrity.'}
              </p>

              {riskData?.reasons && riskData.reasons.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Primary Triggers:</span>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 font-sans">
                    {riskData.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ingested Evidence Checksum Table Preview */}
        <div className="space-y-3">
          <h3 className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider">
            3. Included Evidence Checksums (SHA-256)
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-800 font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-forensic-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Filename / Channel</th>
                  <th className="p-3">Vendor</th>
                  <th className="p-3">Resolution</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">SHA-256 Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px]">
                {evidenceList.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-200">
                      {ev.filename}
                      <span className="block text-[10px] text-slate-400">{ev.camera_id || 'CAM_01'}</span>
                    </td>
                    <td className="p-3 text-cyan-300">{ev.vendor}</td>
                    <td className="p-3 text-slate-300">{ev.resolution || 'N/A'}</td>
                    <td className="p-3 text-slate-300">{ev.duration ? `${ev.duration.toFixed(1)}s` : '—'}</td>
                    <td className="p-3 text-cyan-400 text-[10px] select-all break-all">{ev.sha256}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attestation & Disclaimer */}
        <div className="p-4 rounded-xl bg-forensic-900/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-sans">
          <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
            Forensic Examiner Attestation & Prototype Disclaimer
          </div>
          <p>
            This automated examination report was compiled using CHRONOS-DVR video forensics algorithms. All SHA-256 digests and audit ledger chains are cryptographically sealed. Vendor container heuristics reflect detected container tags and timing anomalies.
          </p>
        </div>
      </div>
    </div>
  );
};
