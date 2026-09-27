import React from 'react';
import {
  LayoutDashboard,
  FolderLock,
  Film,
  CheckCircle2,
  Clock,
  Network,
  AlertTriangle,
  History,
  FileText,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'cases'
  | 'evidence'
  | 'results'
  | 'timeline'
  | 'graph'
  | 'risk'
  | 'audit'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  evidenceCount?: number;
  highRiskCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  evidenceCount = 0,
  highRiskCount = 0,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: FolderLock },
    { id: 'evidence', label: 'Evidence Ingestion', icon: Film, badge: evidenceCount },
    { id: 'results', label: 'Analysis Results', icon: CheckCircle2 },
    { id: 'timeline', label: 'Forensic Timeline', icon: Clock },
    { id: 'graph', label: 'Evidence Graph', icon: Network },
    {
      id: 'risk',
      label: 'Risk Fusion',
      icon: AlertTriangle,
      badge: highRiskCount > 0 ? highRiskCount : undefined,
      badgeColor: 'bg-rose-950 text-rose-400 border-rose-700',
    },
    { id: 'audit', label: 'Audit Ledger', icon: History },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-forensic-850 flex flex-col justify-between p-3 shrink-0 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Forensic Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Forensic System Watermark / Attestation Box */}
      <div className="p-3 rounded-lg bg-forensic-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>CHAIN-INTEGRITY</span>
          <span className="text-emerald-400">VERIFIED</span>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-full" />
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          SHA-256 Ledger Chaining Active. Zero Non-Recorded Mutations.
        </p>
      </div>
    </aside>
  );
};
