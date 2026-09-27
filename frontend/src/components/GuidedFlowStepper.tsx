import React from 'react';
import {
  LayoutDashboard,
  FolderLock,
  Film,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Network,
  History,
  FileText,
  ArrowRight,
  ArrowLeft,
  Activity,
} from 'lucide-react';

export type FlowStep =
  | 'dashboard'
  | 'cases'
  | 'evidence'
  | 'results'
  | 'timeline'
  | 'risk'
  | 'graph'
  | 'audit'
  | 'reports';

interface GuidedFlowStepperProps {
  currentTab: FlowStep;
  onSelectTab: (tab: FlowStep) => void;
  onTriggerAnalyze?: () => void;
  hasAnalyzedEvidence: boolean;
}

export const GuidedFlowStepper: React.FC<GuidedFlowStepperProps> = ({
  currentTab,
  onSelectTab,
  onTriggerAnalyze,
  hasAnalyzedEvidence,
}) => {
  const steps: Array<{
    id: FlowStep;
    label: string;
    num: string;
    icon: React.ElementType;
  }> = [
    { id: 'dashboard', label: 'Dashboard', num: '01', icon: LayoutDashboard },
    { id: 'cases', label: 'Case', num: '02', icon: FolderLock },
    { id: 'evidence', label: 'Evidence', num: '03', icon: Film },
    { id: 'results', label: 'Analysis Results', num: '04', icon: CheckCircle2 },
    { id: 'timeline', label: 'Timeline', num: '05', icon: Clock },
    { id: 'risk', label: 'Risk Fusion', num: '06', icon: AlertTriangle },
    { id: 'graph', label: 'Evidence Graph', num: '07', icon: Network },
    { id: 'audit', label: 'Audit Trail', num: '08', icon: History },
    { id: 'reports', label: 'Report', num: '09', icon: FileText },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentTab);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  return (
    <div className="bg-forensic-850/95 border-b border-slate-800 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      {/* Step Sequence Breadcrumb */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none">
        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>DEMO WORKFLOW:</span>
        </span>

        {steps.map((step, idx) => {
          const isActive = currentTab === step.id;
          const isPassed = currentIndex > idx;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onSelectTab(step.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-mono shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-sm shadow-cyan-950 font-bold'
                    : isPassed
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-cyan-400' : isPassed ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isPassed ? '✓' : step.num}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-[11px] font-sans">{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <span className="text-slate-700 text-xs shrink-0 select-none">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Quick Step Navigation Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {prevStep && (
          <button
            onClick={() => onSelectTab(prevStep.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-forensic-800 hover:bg-forensic-750 text-slate-300 text-xs border border-slate-700"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Prev</span>
          </button>
        )}

        {nextStep && (
          <button
            onClick={() => onSelectTab(nextStep.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow transition-all border border-cyan-400/40"
          >
            <span>Next: {nextStep.label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
