import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Film,
  Eye,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Case, Evidence, TimelineEvent } from '../types';
import { NavTab } from './Sidebar';

interface AnalysisResultsViewProps {
  activeCase: Case | null;
  evidenceList: Evidence[];
  timelineEvents: TimelineEvent[];
  onNavigate: (tab: NavTab) => void;
  onAnalyzeEvidence: (evidenceId: number) => Promise<void>;
  analyzingId: number | null;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  activeCase,
  evidenceList,
  timelineEvents,
  onNavigate,
  onAnalyzeEvidence,
  analyzingId,
}) => {
  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">Select or load a case to review stream forensic analysis results.</p>
      </div>
    );
  }

  const primaryEvidence = evidenceList[0];
  let parsedMeta: any = {};
  if (primaryEvidence?.metadata_json) {
    try {
      parsedMeta = JSON.parse(primaryEvidence.metadata_json);
    } catch {}
  }
  const sampledFrames = parsedMeta.sampled_frames || [];
  const vendorInfo = parsedMeta.vendor_detection || {};

  return (
    <div className="space-y-6">
      {/* Title & Navigation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Stream Analysis Results</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-cyan-400 border border-blue-800">
              DEMONSTRATION DATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-vendor container disassembly, frame sampling triage, and chronological continuity validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {primaryEvidence && (
            <button
              onClick={() => onAnalyzeEvidence(primaryEvidence.id)}
              disabled={analyzingId !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-200 text-xs border border-slate-700 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzingId ? 'animate-spin' : ''}`} />
              <span>Re-run Analysis</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('timeline')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-950 transition-all border border-cyan-400/40"
          >
            <span>Proceed to Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analysis Stage Pipeline Checklist Card */}
      <div className="p-6 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
        <h2 className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Completed Forensic Pipeline Stages</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block">01. Evidence Ingestion</span>
              <span className="text-slate-400 text-[11px]">Original preserved, bit-level integrity locked.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block">02. Cryptographic Hash</span>
              <span className="text-slate-400 text-[11px]">SHA-256 digest computed & chained in ledger.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block">03. Vendor Signature</span>
              <span className="text-slate-400 text-[11px]">Hikvision CCTV container signatures matched.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block">04. Video Stream Decoding</span>
              <span className="text-slate-400 text-[11px]">640x360 @ 25 FPS, 300 elementary frames.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block">05. Keyframe Sampling</span>
              <span className="text-slate-400 text-[11px]">6 representative frames sampled every 2.0s.</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-semibold block">06. Continuity & Risk Fusion</span>
              <span className="text-amber-400 text-[11px]">Recording gap & timestamp anomaly flagged.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Findings & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stream Summary & Sampled Frames */}
        <div className="lg:col-span-2 space-y-4">
          {primaryEvidence ? (
            <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">{primaryEvidence.filename}</h3>
                </div>
                <span className="font-mono text-xs text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800 font-semibold">
                  {primaryEvidence.vendor}
                </span>
              </div>

              {/* SHA-256 Digest */}
              <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 font-mono text-xs space-y-1">
                <span className="text-slate-400 text-[10px] block font-semibold">SHA-256 FORENSIC CHECKSUM</span>
                <span className="text-cyan-300 select-all break-all">{primaryEvidence.sha256}</span>
              </div>

              {/* Probed Stream Properties */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">CODEC</span>
                  <span className="text-white font-semibold">{primaryEvidence.codec || 'H.264'}</span>
                </div>
                <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">RES</span>
                  <span className="text-white font-semibold">{primaryEvidence.resolution || '640x360'}</span>
                </div>
                <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">DURATION</span>
                  <span className="text-white font-semibold">{primaryEvidence.duration?.toFixed(1) || '12.0'}s</span>
                </div>
                <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">FPS</span>
                  <span className="text-white font-semibold">{primaryEvidence.fps || '25.0'}</span>
                </div>
                <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">FRAMES</span>
                  <span className="text-white font-semibold">{primaryEvidence.frame_count || '300'}</span>
                </div>
                <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">CAMERA</span>
                  <span className="text-cyan-300 font-semibold">{primaryEvidence.camera_id || 'CAM_01'}</span>
                </div>
              </div>

              {/* Sampled Frames Strip */}
              {sampledFrames.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Representative Keyframes & OSD Timestamps</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Interval: 2.0s
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sampledFrames.map((frame: any, idx: number) => {
                      const thumbUrl = `/static/frames/ev_${primaryEvidence.id}/${frame.thumbnail_file}`;
                      return (
                        <div
                          key={idx}
                          className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video group"
                        >
                          <img
                            src={thumbUrl}
                            alt={`Frame ${frame.frame_index}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-2 flex flex-col justify-between">
                            <div className="flex justify-between text-[10px] font-mono text-cyan-300">
                              <span>Frame #{frame.frame_index}</span>
                              <span>{frame.timestamp_str}</span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-300 bg-black/60 px-1 py-0.5 rounded truncate">
                              Motion Delta: {frame.motion_score || 0.0}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-forensic-850 border border-slate-800 text-slate-400 text-xs">
              No evidence file available to display analysis results.
            </div>
          )}
        </div>

        {/* Right Col: Detected Anomalies Summary & Direct Step Transition */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Detected Forensic Anomalies</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-forensic-900 border border-amber-900/60 space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>RECORDING GAP</span>
                  <span>@ 01:45:04</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  [DEMONSTRATION DATA] 8.0-second video recording discontinuity identified in frame sequence.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-forensic-900 border border-purple-900/60 space-y-1">
                <div className="flex items-center justify-between text-purple-400 font-bold">
                  <span>TIMESTAMP ANOMALY</span>
                  <span>@ 01:45:12</span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  [DEMONSTRATION DATA] OSD clock non-linear shift: forward jump of +00:00:08 detected.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => onNavigate('timeline')}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Step 5: Inspect Forensic Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('risk')}
                className="w-full py-2 px-4 rounded-lg bg-forensic-750 hover:bg-forensic-700 text-slate-200 text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <span>Step 6: View Risk Fusion Engine</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
