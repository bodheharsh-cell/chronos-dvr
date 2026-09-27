import React from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowDown,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { Case, AuditLedgerResponse } from '../types';

interface AuditTrailViewProps {
  activeCase: Case | null;
  auditData: AuditLedgerResponse | null;
  onRefreshAudit: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  activeCase,
  auditData,
  onRefreshAudit,
}) => {
  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <History className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">Select an investigation case to view its tamper-evident audit ledger.</p>
      </div>
    );
  }

  const entries = auditData?.audit_ledger || [];
  const isChainValid = auditData?.chain_integrity_valid ?? true;

  return (
    <div className="space-y-6">
      {/* Title & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">TAMPER-EVIDENT AUDIT LEDGER</h1>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isChainValid
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border-rose-800'
              }`}
            >
              {isChainValid ? 'TAMPER-EVIDENT / VERIFIED' : 'INTEGRITY MISMATCH'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Immutable sequential audit trail with cryptographic SHA-256 hash chaining (<code className="text-cyan-300">prev_hash + data = curr_hash</code>).
          </p>
        </div>

        <button
          onClick={onRefreshAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-300 text-xs font-mono border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-verify Ledger Chain</span>
        </button>
      </div>

      {/* Chain Status Card */}
      <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200 uppercase font-mono">
              Ledger Chain Integrity Status
            </div>
            <p className="text-xs text-slate-400">
              {isChainValid
                ? 'All block hashes cryptographically verified from Genesis. Zero unauthorized tampering detected.'
                : 'Warning: Hash chain broken. Potential record tampering detected.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
          <div>
            <span className="text-[10px] text-slate-400 block">TOTAL LOGGED EVENTS</span>
            <span className="text-white font-bold text-base">{entries.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">CHAIN TYPE</span>
            <span className="text-cyan-300 font-semibold">SHA-256 HASH CHAIN</span>
          </div>
        </div>
      </div>

      {/* Ledger Entries Chained Display */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-forensic-850 border border-slate-800 text-slate-400 text-xs">
            No audit records created yet.
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.id} className="space-y-2">
              <div className="p-4 rounded-xl bg-forensic-850 border border-slate-800 hover:border-slate-700 transition-all space-y-3 font-mono">
                {/* Entry Header: Seq #, Action, Actor, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                      #{entry.id}
                    </span>
                    <span className="font-bold text-slate-100">{entry.action}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>Actor: <strong className="text-slate-300">{entry.actor}</strong></span>
                    <span>•</span>
                    <span>{new Date(entry.timestamp).toUTCString()}</span>
                  </div>
                </div>

                {/* Event Details */}
                {entry.details && (
                  <p className="text-xs font-sans text-slate-300 leading-relaxed">
                    {entry.details}
                  </p>
                )}

                {/* Cryptographic Hash Chaining Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded bg-forensic-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block font-semibold">PREVIOUS HASH (LINK):</span>
                    <span className="text-slate-400 break-all select-all font-mono">
                      {entry.previous_hash}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-forensic-900 border border-slate-800 space-y-0.5">
                    <span className="text-emerald-400 block font-semibold flex items-center justify-between">
                      <span>CURRENT CHAINED HASH:</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </span>
                    <span className="text-cyan-300 break-all select-all font-mono">
                      {entry.current_hash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Down Arrow Link for chaining visualization */}
              {idx < entries.length - 1 && (
                <div className="flex justify-center text-slate-700 py-0.5">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
