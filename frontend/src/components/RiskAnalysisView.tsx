import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Case, RiskAssessment, RiskFactor } from '../types';

interface RiskAnalysisViewProps {
  activeCase: Case | null;
  riskData: RiskAssessment | null;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  activeCase,
  riskData,
}) => {
  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">Select an investigation case to view risk assessment diagnostics.</p>
      </div>
    );
  }

  const overallRisk = riskData?.overall_risk || 'LOW';
  const score = riskData?.risk_score || 0;
  const factors = riskData?.factors || [];
  const reasons = riskData?.reasons || [];
  const anomalies = riskData?.timeline_anomalies || [];

  const getRiskColors = (r: string) => {
    switch (r) {
      case 'CRITICAL':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-950/80',
          border: 'border-rose-800',
          glow: 'risk-critical-glow',
          bar: 'bg-rose-500',
        };
      case 'HIGH':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-950/80',
          border: 'border-amber-800',
          glow: 'risk-high-glow',
          bar: 'bg-amber-500',
        };
      case 'MEDIUM':
        return {
          text: 'text-yellow-400',
          bg: 'bg-yellow-950/80',
          border: 'border-yellow-800',
          glow: 'risk-high-glow',
          bar: 'bg-yellow-500',
        };
      case 'LOW':
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-800',
          glow: 'risk-low-glow',
          bar: 'bg-emerald-500',
        };
    }
  };

  const colors = getRiskColors(overallRisk);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Explainable Forensic Risk Fusion</h1>
          <p className="text-xs text-slate-400">
            Deterministic rule-based risk quantification correlating container integrity, frame discontinuities, and clock jumps.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-forensic-850 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>CASE:</span>
          <span className="text-cyan-400 font-bold">{activeCase.case_number}</span>
        </div>
      </div>

      {/* Main Risk Gauge Banner */}
      <div className={`p-6 rounded-xl bg-forensic-850 border ${colors.border} ${colors.glow} space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              AGGREGATED FORENSIC RISK LEVEL
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-extrabold font-mono tracking-tight ${colors.text}`}>
                {overallRisk}
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded bg-forensic-900 border border-slate-700 text-slate-300">
                Score: {score.toFixed(1)} / 100
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>INTEGRITY: {riskData?.integrity_status || 'VERIFIED'}</span>
              </span>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Risk Metric Index</span>
              <span className={colors.text}>{score.toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full bg-forensic-900 rounded-full overflow-hidden border border-slate-800">
              <div className={`h-full ${colors.bar} transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed pt-2 border-t border-slate-800/80">
          {riskData?.summary_text || 'Forensic risk assessed according to deterministic criteria.'}
        </p>
      </div>

      {/* Why Was This Risk Assigned? (Transparent Explanation) */}
      <div className="p-6 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100 font-mono uppercase flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Causal Forensic Rationale (Why Was This Score Assigned?)</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Deterministic & Fully Explainable</span>
        </div>

        {reasons.length === 0 ? (
          <div className="p-4 rounded-lg bg-forensic-900 text-slate-400 text-xs font-mono">
            No risk elevation triggers detected. Continuous video stream verified.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reasons.map((reason, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-forensic-900 border border-slate-800 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  {overallRisk === 'HIGH' || overallRisk === 'CRITICAL' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans">
                  <strong>Factor #{idx + 1}:</strong> {reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Breakdown Factors & Contributing Signals Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factors List (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
            Evaluated Risk Factors ({factors.length})
          </h3>

          <div className="space-y-2">
            {factors.map((f, idx) => {
              const isSevere = f.severity === 'HIGH' || f.severity === 'CRITICAL';
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-forensic-900 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-cyan-300">{f.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">WEIGHT: +{f.weight}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                          isSevere
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 font-sans text-xs">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Discontinuities & Anomalies (1 col) */}
        <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
            Timeline Discontinuities ({anomalies.length})
          </h3>

          {anomalies.length === 0 ? (
            <p className="text-slate-400 text-xs italic">No timing gaps or clock anomalies identified.</p>
          ) : (
            <div className="space-y-2">
              {anomalies.map((a, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-forensic-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-amber-400 font-bold">{a.type}</span>
                    <span className="text-slate-400">{a.timestamp_str || `${a.timestamp}s`}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
