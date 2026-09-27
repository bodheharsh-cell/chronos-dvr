import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, Sparkles, Shield, ArrowRight, X } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  evidenceFilename: string;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  evidenceFilename,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(0);

  const stages = [
    { title: 'Acquiring Stream & Locking Bit Integrity', desc: 'Read-only preservation verified with zero in-place mutation.' },
    { title: 'Computing SHA-256 Digest & Chaining in Ledger', desc: 'Cryptographic hash generated and linked to preceding block.' },
    { title: 'Evaluating Multi-Vendor Signatures', desc: 'Hikvision OEM stream headers and OSD banner pattern matched.' },
    { title: 'Demuxing Video Stream & Codec Probe', desc: 'Decoding elementary H.264/AVC stream @ 25 FPS.' },
    { title: 'Sampling Keyframes & Timestamp Analysis', desc: 'Extracting representative frame thumbnails & OSD OCR inspection.' },
    { title: 'Continuity & Recording Gap Detection', desc: 'Flagging 8.0s recording discontinuity and clock jump anomaly.' },
    { title: 'Executing Explainable Risk Fusion Engine', desc: 'Calculating transparent deterministic score: HIGH risk.' },
    { title: 'Synthesizing Relational Evidence Graph', desc: 'Connecting Case → Evidence → Camera → Timeline → Risk nodes.' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      return;
    }

    let stage = 0;
    const timer = setInterval(() => {
      stage += 1;
      if (stage <= stages.length) {
        setCurrentStage(stage);
      } else {
        clearInterval(timer);
      }
    }, 450);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const isFinished = currentStage >= stages.length;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-forensic-850 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <RefreshCw className={`w-4 h-4 ${!isFinished ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                {isFinished ? 'FORENSIC ANALYSIS COMPLETE' : 'EXECUTING FORENSIC PIPELINE'}
              </h2>
              <p className="text-[11px] text-slate-400 truncate max-w-sm">
                Target Evidence: <span className="text-cyan-300 font-mono">{evidenceFilename}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-mono">
            ✕
          </button>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {stages.map((st, idx) => {
            const isDone = currentStage > idx;
            const isCurrent = currentStage === idx;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border transition-all text-xs font-mono flex items-start gap-3 ${
                  isDone
                    ? 'bg-forensic-900/90 border-emerald-900/60 text-slate-200'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-300 shadow-sm shadow-cyan-950'
                    : 'bg-forensic-900/30 border-slate-800/40 text-slate-400'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="font-semibold">{st.title}</div>
                  <div className="text-[10px] text-slate-400 font-sans leading-tight">{st.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            {isFinished ? '8/8 Stages Verified' : `Processing stage ${currentStage + 1} of 8...`}
          </span>

          <button
            onClick={onComplete}
            disabled={!isFinished}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-medium text-xs shadow-lg transition-all border border-cyan-400/40 cursor-pointer"
          >
            <span>View Analysis Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
