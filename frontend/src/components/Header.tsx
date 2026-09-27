import React from 'react';
import { Shield, Sparkles, Activity, FolderLock } from 'lucide-react';
import { Case } from '../types';

interface HeaderProps {
  activeCase: Case | null;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  onLoadDemo: () => void;
  loadingDemo: boolean;
  healthOk: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeCase,
  cases,
  onSelectCase,
  onLoadDemo,
  loadingDemo,
  healthOk,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-forensic-850/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 radar-glow">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-base text-white">CHRONOS-DVR</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              SIH 2026 PROTOTYPE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight">
            Multi-Vendor DVR/NVR Forensic Analysis & Video Integrity Platform
          </p>
        </div>
      </div>

      {/* Active Case Selector & Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2 bg-forensic-800 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
          <FolderLock className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Active Case:</span>
          {cases.length > 0 ? (
            <select
              value={activeCase?.id || ''}
              onChange={(e) => {
                const found = cases.find((c) => c.id === Number(e.target.value));
                if (found) onSelectCase(found);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-forensic-850 text-white">
                  {c.case_number} - {c.title.slice(0, 28)}...
                </option>
              ))}
            </select>
          ) : (
            <span className="text-amber-400 italic">No Case Selected</span>
          )}
        </div>

        {/* 1-Click Demo Load Action */}
        <button
          onClick={onLoadDemo}
          disabled={loadingDemo}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-900/30 transition-all border border-cyan-400/30 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${loadingDemo ? 'animate-spin' : 'text-cyan-200'}`} />
          <span>{loadingDemo ? 'Loading Demo...' : 'Load Demo Investigation'}</span>
        </button>

        {/* System Health Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forensic-900 border border-slate-800 text-[11px] font-mono">
          <span className={`w-2 h-2 rounded-full ${healthOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className={healthOk ? 'text-emerald-400' : 'text-rose-400'}>
            {healthOk ? 'CORE ONLINE' : 'API DISCONNECTED'}
          </span>
        </div>
      </div>
    </header>
  );
};
