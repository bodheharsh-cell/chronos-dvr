import React, { useState, useEffect } from 'react';
import {
  Network,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  Film,
  Camera,
  Clock,
  Image as ImageIcon,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Case, EvidenceGraphResponse, GraphNode, GraphEdge } from '../types';

interface EvidenceGraphViewProps {
  activeCase: Case | null;
  graphData: EvidenceGraphResponse | null;
  onRefreshGraph: () => void;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({
  activeCase,
  graphData,
  onRefreshGraph,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);

  useEffect(() => {
    if (graphData && graphData.nodes.length > 0 && !selectedNode) {
      // Default select the root Case node
      const root = graphData.nodes.find((n) => n.type === 'CASE') || graphData.nodes[0];
      setSelectedNode(root);
    }
  }, [graphData]);

  if (!activeCase) {
    return (
      <div className="p-12 text-center rounded-xl bg-forensic-850 border border-slate-800 space-y-3">
        <Network className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-base font-bold text-white">No Active Case Selected</h2>
        <p className="text-xs text-slate-400">Select a case to view its multi-tiered evidence relationship graph.</p>
      </div>
    );
  }

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Categorized layout coordinates for responsive hierarchy display
  // Tiers: CASE (top) -> EVIDENCE & RISK (tier 2) -> CAMERA & ANALYSIS (tier 3) -> TIMELINE_EVENT (tier 4) -> FRAME (tier 5)
  const getNodeCoordinates = (node: GraphNode, index: number, totalInGroup: number) => {
    const spacingX = 220;
    const offsetX = (index - (totalInGroup - 1) / 2) * spacingX;
    const centerX = 480;

    switch (node.type) {
      case 'CASE':
        return { x: centerX, y: 70 };
      case 'RISK':
        return { x: centerX + 260, y: 180 };
      case 'EVIDENCE':
        return { x: centerX - 180 + offsetX * 0.8, y: 180 };
      case 'CAMERA':
        return { x: centerX - 260 + offsetX * 0.7, y: 290 };
      case 'ANALYSIS':
        return { x: centerX + 80 + offsetX * 0.7, y: 290 };
      case 'TIMELINE_EVENT':
        return { x: centerX - 160 + offsetX * 0.9, y: 400 };
      case 'FRAME':
        return { x: centerX - 160 + offsetX * 0.9, y: 510 };
      default:
        return { x: centerX + (index * 60), y: 300 };
    }
  };

  // Group nodes by type for layout indexing
  const nodesByType: Record<string, GraphNode[]> = {};
  nodes.forEach((n) => {
    if (!nodesByType[n.type]) nodesByType[n.type] = [];
    nodesByType[n.type].push(n);
  });

  const nodePositions: Record<string, { x: number; y: number }> = {};
  Object.keys(nodesByType).forEach((type) => {
    const group = nodesByType[type];
    group.forEach((node, idx) => {
      nodePositions[node.id] = getNodeCoordinates(node, idx, group.length);
    });
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'CASE':
        return Shield;
      case 'EVIDENCE':
        return Film;
      case 'CAMERA':
        return Camera;
      case 'TIMELINE_EVENT':
        return Clock;
      case 'FRAME':
        return ImageIcon;
      case 'ANALYSIS':
        return Activity;
      case 'RISK':
        return AlertTriangle;
      default:
        return Network;
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (node.type === 'CASE') return 'stroke-cyan-400 fill-cyan-950/80 text-cyan-300';
    if (node.type === 'RISK') {
      if (node.status === 'HIGH' || node.status === 'CRITICAL')
        return 'stroke-rose-500 fill-rose-950/80 text-rose-300';
      return 'stroke-emerald-500 fill-emerald-950/80 text-emerald-300';
    }
    if (node.type === 'EVIDENCE') return 'stroke-blue-400 fill-blue-950/80 text-blue-300';
    if (node.type === 'CAMERA') return 'stroke-indigo-400 fill-indigo-950/80 text-indigo-300';
    if (node.type === 'ANALYSIS') return 'stroke-teal-400 fill-teal-950/80 text-teal-300';
    if (node.type === 'TIMELINE_EVENT') {
      if (node.status === 'HIGH' || node.status === 'CRITICAL')
        return 'stroke-rose-400 fill-rose-950/60 text-rose-300';
      return 'stroke-amber-400 fill-amber-950/80 text-amber-300';
    }
    if (node.type === 'FRAME') return 'stroke-purple-400 fill-purple-950/80 text-purple-300';
    return 'stroke-slate-500 fill-slate-900 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Forensic Evidence Graph</h1>
          <p className="text-xs text-slate-400">
            Interactive relational schema linking Cases, Evidence Streams, Cameras, Keyframes, Events, and Risk Fusion.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-forensic-850 p-2 rounded-lg border border-slate-800">
          <span>NODES: <strong className="text-cyan-400">{nodes.length}</strong></span>
          <span>•</span>
          <span>RELATIONSHIPS: <strong className="text-blue-400">{edges.length}</strong></span>
        </div>
      </div>

      {/* Graph Visual Canvas & Node Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph Canvas (3 cols) */}
        <div className="lg:col-span-3 rounded-xl bg-forensic-900 border border-slate-800 relative overflow-hidden flex flex-col min-h-[580px]">
          {/* Zoom & Canvas Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-forensic-850/90 border border-slate-700 p-1 rounded-lg backdrop-blur-md">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              className="p-1.5 hover:bg-slate-700 text-slate-300 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="p-1.5 hover:bg-slate-700 text-slate-300 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="p-1.5 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs px-2"
              title="Reset"
            >
              {(zoom * 100).toFixed(0)}%
            </button>
          </div>

          {/* Graph Legend */}
          <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 max-w-sm justify-end">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">CASE</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">EVIDENCE</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">CAMERA</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">EVENT</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">FRAME</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">RISK</span>
          </div>

          {/* Render Interactive SVG Graph */}
          <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-6 forensic-grid">
            <svg
              width={960 * zoom}
              height={600 * zoom}
              viewBox="0 0 960 600"
              className="transition-transform duration-200 select-none"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
                </marker>
              </defs>

              {/* Render Edges */}
              {edges.map((edge) => {
                const sPos = nodePositions[edge.source];
                const tPos = nodePositions[edge.target];
                if (!sPos || !tPos) return null;

                // Bezier curve path
                const dx = tPos.x - sPos.x;
                const dy = tPos.y - sPos.y;
                const pathD = `M ${sPos.x} ${sPos.y} Q ${sPos.x + dx * 0.1} ${sPos.y + dy * 0.8} ${tPos.x} ${tPos.y}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1.5"
                      strokeDasharray={edge.relationship === 'INDICATES' ? '4 3' : 'none'}
                      markerEnd="url(#arrow)"
                    />
                    <text
                      x={(sPos.x + tPos.x) / 2}
                      y={(sPos.y + tPos.y) / 2 - 4}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                      className="font-mono"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {nodes.map((node) => {
                const pos = nodePositions[node.id] || { x: 480, y: 300 };
                const isSelected = selectedNode?.id === node.id;
                const Icon = getNodeIcon(node.type);
                const colorClasses = getNodeColor(node);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Glowing outer ring when selected */}
                    {isSelected && (
                      <circle
                        r="32"
                        className="stroke-cyan-400 fill-transparent animate-pulse"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}

                    {/* Node Body Circle */}
                    <circle
                      r="24"
                      className={`stroke-2 transition-all ${colorClasses} ${
                        isSelected ? 'filter drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : ''
                      }`}
                    />

                    {/* Node Icon */}
                    <foreignObject x="-10" y="-10" width="20" height="20" className="pointer-events-none">
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </foreignObject>

                    {/* Node Label */}
                    <text
                      y="38"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="font-mono pointer-events-none drop-shadow-md"
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Node Inspector Side Panel (1 col) */}
        <div className="p-5 rounded-xl bg-forensic-850 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Node Inspector</span>
            </h3>
            {selectedNode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {selectedNode.type}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">NODE IDENTIFIER</span>
                <span className="text-white font-bold text-sm break-all">{selectedNode.label}</span>
              </div>

              <div className="p-3 rounded-lg bg-forensic-900 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 block font-semibold">ATTRIBUTES & PROPERTIES</span>
                {Object.keys(selectedNode.properties).length === 0 ? (
                  <span className="text-slate-400 italic text-[11px]">No properties attached.</span>
                ) : (
                  <div className="space-y-2 text-[11px]">
                    {Object.entries(selectedNode.properties).map(([k, v]) => (
                      <div key={k} className="border-b border-slate-800/60 pb-1.5 last:border-0">
                        <span className="text-slate-400 text-[10px] block uppercase">{k.replace('_', ' ')}:</span>
                        <span className="text-cyan-200 font-medium break-all">
                          {Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-forensic-900/60 border border-slate-800 text-[11px] text-slate-400 font-sans space-y-1">
                <span className="font-mono text-[10px] text-slate-400 uppercase block font-semibold">
                  Relational Graph Integrity
                </span>
                <p>
                  Node is cryptographically anchored to Case {activeCase.case_number}. All transitions preserve chain-of-custody lineage.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <p>Click any node in the evidence network to inspect forensic metadata and connected relationships.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
