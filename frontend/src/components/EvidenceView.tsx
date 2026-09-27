import React, { useState } from 'react';
import {
  Film,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Eye,
  Camera,
  Cpu,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Case, Evidence } from '../types';

interface EvidenceViewProps {
  activeCase: Case | null;
  evidenceList: Evidence[];
  onUploadEvidence: (file: File, cameraId: string) => Promise<void>;
  onAnalyzeEvidence: (evidenceId: number) => Promise<void>;
  analyzingId: number | null;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  activeCase,
  evidenceList,
  onUploadEvidence,
  onAnalyzeEvidence,
  analyzingId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraId, setCameraId] = useState('CAM_01_PERIMETER');
  const [uploading, setUploading] = useState(false);
  const [activeFrameModal, setActiveFrameModal] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<Evidence | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activeCase) return;
    try {
      setUploading(true);
      await onUploadEvidence(selectedFile, cameraId);
      setSelectedFile(null);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <Film className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">
          Please select or create an investigation case to ingest and analyze evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Evidence Ingestion & Stream Analysis</h1>
          <p className="text-xs text-slate-400">
            Bit-level original preservation, cryptographic hash generation, automated vendor detection, and frame stream decoding.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-forensic-850 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>CASE:</span>
          <span className="text-cyan-400 font-bold">{activeCase.case_number}</span>
        </div>
      </div>

      {/* Upload Zone & Form */}
      <div className="p-6 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase flex items-center gap-2">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Ingest New Video / DVR Stream</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 rounded-xl p-6 text-center transition-all bg-forensic-900/50 cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept="video/*,.dav,.dhav,.264,.h264,.265,.h265,.mp4,.avi,.mkv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
            />
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop DVR / CCTV footage'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Supports .mp4, .avi, .dav (Dahua), .h264 (Hikvision), .mkv, raw CCTV exports
                </p>
              </div>
              {selectedFile && (
                <div className="inline-block font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Ingestion
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5 shrink-0">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Camera Channel:</span>
              </label>
              <input
                type="text"
                value={cameraId}
                onChange={(e) => setCameraId(e.target.value)}
                placeholder="e.g. CAM_01_GATE"
                className="px-3 py-1.5 rounded-lg bg-forensic-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className={`w-3.5 h-3.5 ${uploading ? 'animate-bounce' : ''}`} />
              <span>{uploading ? 'Calculating SHA-256 & Ingesting...' : 'Ingest Evidence File'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Ingested Evidence List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
            Ingested Evidence Repository ({evidenceList.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Read-Only Preserved • Cryptographic Chain Intact
          </span>
        </div>

        {evidenceList.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-forensic-850 border border-slate-800 text-slate-400 text-xs">
            No evidence files ingested for this case yet. Upload footage above or click "Load Demo Investigation".
          </div>
        ) : (
          <div className="space-y-4">
            {evidenceList.map((ev) => {
              const isAnalyzing = analyzingId === ev.id;
              let parsedMeta: any = {};
              try {
                if (ev.metadata_json) parsedMeta = JSON.parse(ev.metadata_json);
              } catch {}
              const sampledFrames = parsedMeta.sampled_frames || [];

              return (
                <div
                  key={ev.id}
                  className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-4 hover:border-slate-750 transition-all"
                >
                  {/* Top Bar: Filename, Vendor Badge, Status, Action */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
                        <Film className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{ev.filename}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-semibold">
                            {ev.vendor}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {ev.camera_id || 'CAM_01'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ingested on {new Date(ev.created_at).toLocaleString()} • Size: {(ev.file_size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-slate-400 text-[10px]">STATUS:</span>
                        <span
                          className={`font-semibold ${
                            ev.analysis_status === 'COMPLETED'
                              ? 'text-emerald-400'
                              : ev.analysis_status === 'ANALYZING'
                              ? 'text-cyan-400 animate-pulse'
                              : 'text-amber-400'
                          }`}
                        >
                          {ev.analysis_status}
                        </span>
                      </div>

                      <button
                        onClick={() => onAnalyzeEvidence(ev.id)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all border border-cyan-400/40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span>{isAnalyzing ? 'Analyzing Stream...' : 'Analyze Evidence'}</span>
                      </button>
                    </div>
                  </div>

                  {/* SHA-256 Prominent Forensic Hash Banner */}
                  <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-mono text-[11px] font-semibold text-slate-300">SHA-256 INTEGRITY HASH:</span>
                    </div>
                    <div className="font-mono text-xs text-cyan-300 bg-forensic-950 px-3 py-1 rounded border border-cyan-950 select-all tracking-wider break-all">
                      {ev.sha256}
                    </div>
                  </div>

                  {/* Probed Video Properties Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-forensic-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">CONTAINER/CODEC</span>
                      <span className="text-slate-200 font-semibold">{ev.codec || 'Probing...'}</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">RESOLUTION</span>
                      <span className="text-slate-200 font-semibold">{ev.resolution || 'Probing...'}</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">STREAM DURATION</span>
                      <span className="text-slate-200 font-semibold">
                        {ev.duration ? `${ev.duration.toFixed(1)}s` : 'Probing...'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">FRAME RATE</span>
                      <span className="text-slate-200 font-semibold">{ev.fps ? `${ev.fps} FPS` : 'Probing...'}</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">TOTAL FRAMES</span>
                      <span className="text-slate-200 font-semibold">{ev.frame_count || 'Probing...'}</span>
                    </div>
                    <div className="p-2 rounded bg-forensic-900/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">APPROX BITRATE</span>
                      <span className="text-slate-200 font-semibold">
                        {ev.bitrate ? `${(ev.bitrate / 1000).toFixed(0)} kbps` : 'Probing...'}
                      </span>
                    </div>
                  </div>

                  {/* Sampled Keyframes Gallery / Contact Sheet */}
                  {sampledFrames.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Sampled Forensic Keyframes ({sampledFrames.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Sample interval: 2.0s • OSD Timestamp OCR Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {sampledFrames.map((frame: any, idx: number) => {
                          const thumbUrl = `/static/frames/ev_${ev.id}/${frame.thumbnail_file}`;
                          const ocr = frame.ocr_analysis?.detected_timestamp || 'OCR fallback';

                          return (
                            <div
                              key={idx}
                              onClick={() => setActiveFrameModal(thumbUrl)}
                              className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-cyan-500/80 transition-all bg-black cursor-pointer aspect-video"
                            >
                              <img
                                src={thumbUrl}
                                alt={`Frame ${frame.frame_index}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  // Fallback placeholder if image path fails
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-90 group-hover:opacity-100 p-1.5 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300">
                                  <span>#{frame.frame_index}</span>
                                  <span>{frame.timestamp_str}</span>
                                </div>
                                <div className="text-[8px] font-mono text-slate-300 truncate bg-black/60 px-1 py-0.5 rounded">
                                  {ocr}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Frame Preview Modal */}
      {activeFrameModal && (
        <div
          onClick={() => setActiveFrameModal(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="max-w-3xl w-full bg-forensic-900 border border-slate-700 rounded-xl overflow-hidden p-2 space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-300">
              <span>FORENSIC KEYFRAME HIGH-RES INSPECTION</span>
              <span className="text-cyan-400">Click anywhere to close</span>
            </div>
            <img src={activeFrameModal} alt="Keyframe Full" className="w-full h-auto rounded-lg border border-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
};
