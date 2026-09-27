import React, { useState } from 'react';
import { FolderLock, Plus, ArrowRight, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Case } from '../types';

interface CasesViewProps {
  cases: Case[];
  activeCase: Case | null;
  onSelectCase: (c: Case) => void;
  onCreateCase: (data: {
    case_number: string;
    title: string;
    description: string;
    investigator: string;
  }) => Promise<void>;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  activeCase,
  onSelectCase,
  onCreateCase,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [investigator, setInvestigator] = useState('Forensic Analyst 01');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber || !title || !investigator) {
      setError('Case Number, Title, and Investigator are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await onCreateCase({
        case_number: caseNumber,
        title,
        description,
        investigator,
      });
      setShowModal(false);
      setCaseNumber('');
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Case Management Directory</h1>
          <p className="text-xs text-slate-400">
            Create, isolate, and inspect digital forensics cases with strict chain-of-custody boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation Case</span>
        </button>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => {
          const isActive = activeCase?.id === c.id;
          return (
            <div
              key={c.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-forensic-850 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                  : 'bg-forensic-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded">
                    {c.case_number}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-100 line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                    {c.description || 'No description recorded.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.investigator}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">
                    {c.evidence_count || 0} Evidence Item(s)
                  </span>
                  <button
                    onClick={() => onSelectCase(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-forensic-750 hover:bg-forensic-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{isActive ? 'Active Case' : 'Open Case'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-forensic-850 border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Create New Forensic Case</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium font-mono">Case Identifier *</label>
                <input
                  type="text"
                  placeholder="e.g. CHR-2026-0042"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-forensic-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Case Title / Incident Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CCTV Security Breach Investigation - Gate 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-forensic-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Lead Forensic Investigator *</label>
                <input
                  type="text"
                  value={investigator}
                  onChange={(e) => setInvestigator(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-forensic-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Incident Summary / Scope</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the DVR recovery scope, camera locations, and seizure notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-forensic-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-forensic-800 hover:bg-forensic-750 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating Case...' : 'Initialize Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
