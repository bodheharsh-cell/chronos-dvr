import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Activity,
  Film,
  Filter,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { Case, TimelineEvent } from '../types';

interface TimelineViewProps {
  activeCase: Case | null;
  timelineEvents: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  activeCase,
  timelineEvents,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <Clock className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">Select a case to inspect its chronological forensic timeline.</p>
      </div>
    );
  }

  const filteredEvents = timelineEvents.filter((ev) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'HIGH_RISK') return ev.risk_level === 'HIGH' || ev.risk_level === 'CRITICAL';
    if (filterType === 'GAP') return ev.event_type.includes('GAP');
    if (filterType === 'TIMESTAMP') return ev.event_type.includes('TIMESTAMP');
    if (filterType === 'MOTION') return ev.event_type.includes('MOTION');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Forensic Chronological Timeline</h1>
          <p className="text-xs text-slate-400">
            Multi-camera event sequencing, frame continuity verification, and detected stream anomalies.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 bg-forensic-850 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded transition-all ${
              filterType === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL ({timelineEvents.length})
          </button>
          <button
            onClick={() => setFilterType('HIGH_RISK')}
            className={`px-2.5 py-1 rounded transition-all ${
              filterType === 'HIGH_RISK' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HIGH RISK
          </button>
          <button
            onClick={() => setFilterType('GAP')}
            className={`px-2.5 py-1 rounded transition-all ${
              filterType === 'GAP' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GAPS
          </button>
          <button
            onClick={() => setFilterType('TIMESTAMP')}
            className={`px-2.5 py-1 rounded transition-all ${
              filterType === 'TIMESTAMP' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TIMESTAMP JUMPS
          </button>
        </div>
      </div>

      {/* Timeline Layout */}
      {timelineEvents.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 text-slate-400 text-xs">
          No timeline events generated yet. Ingest video evidence and click "Analyze Evidence" or load demo case.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timeline Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative border-l-2 border-slate-700 ml-4 pl-6 space-y-6">
              {filteredEvents.map((item, idx) => {
                const isSelected = selectedEvent?.id === item.id;
                const isHighRisk = item.risk_level === 'HIGH' || item.risk_level === 'CRITICAL';
                const isGap = item.event_type.includes('GAP');
                const isTsAnomaly = item.event_type.includes('TIMESTAMP');

                let badgeBg = 'bg-cyan-500';
                if (isHighRisk) badgeBg = 'bg-rose-500';
                else if (isGap) badgeBg = 'bg-amber-500';
                else if (isTsAnomaly) badgeBg = 'bg-purple-500';

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedEvent(item)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-forensic-800 border-cyan-500 shadow-lg shadow-cyan-950/60'
                        : isHighRisk
                        ? 'bg-forensic-850/90 border-rose-900/60 hover:border-rose-700'
                        : 'bg-forensic-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Node Dot on Timeline Spine */}
                    <div
                      className={`absolute -left-[31px] top-5 w-3.5 h-3.5 rounded-full ${badgeBg} ring-4 ring-forensic-900`}
                    />

                    {/* Header: Timecode, Event Type, Source, Risk Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                          {item.timestamp_str || `${item.timestamp.toFixed(1)}s`}
                        </span>
                        <span className="text-xs font-bold text-slate-100">{item.event_type}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.source}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border font-semibold ${
                            isHighRisk
                              ? 'bg-rose-950 text-rose-400 border-rose-800'
                              : item.risk_level === 'MEDIUM'
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          }`}
                        >
                          {item.risk_level}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800/40">
                      <span>CONFIDENCE: {(item.confidence * 100).toFixed(0)}%</span>
                      <span className="text-cyan-400 hover:underline">Inspect Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Inspector Side Panel */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Timeline Event Inspector</span>
                </h3>
                {selectedEvent && (
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    ID #{selectedEvent.id}
                  </span>
                )}
              </div>

              {selectedEvent ? (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">EVENT TYPE</span>
                    <span className="text-slate-100 font-bold text-sm">{selectedEvent.event_type}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block">FINDING DESCRIPTION</span>
                    <p className="text-slate-200 text-xs font-sans leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">TIMECODE</span>
                      <span className="text-cyan-300 font-semibold">{selectedEvent.timestamp_str || `${selectedEvent.timestamp}s`}</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">SOURCE STREAM</span>
                      <span className="text-slate-200 font-semibold">{selectedEvent.source}</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">CONFIDENCE</span>
                      <span className="text-emerald-400 font-semibold">{(selectedEvent.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">RISK LEVEL</span>
                      <span className={`font-bold ${selectedEvent.risk_level === 'HIGH' || selectedEvent.risk_level === 'CRITICAL' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedEvent.risk_level}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-forensic-900/60 border border-slate-800 text-[11px] text-slate-400 font-sans space-y-1">
                    <span className="font-mono text-[10px] text-slate-400 uppercase block font-semibold">Forensic Corroboration</span>
                    <p>
                      Event correlated with frame discontinuity algorithm and cross-referenced with tamper-evident audit ledger sequence.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                  <p>Click any event in the timeline on the left to inspect its detailed parameters and forensic impact.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
