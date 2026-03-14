import React, { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// @ts-ignore
import dagre from 'dagre';

// --- Custom Node Components ---
const NormalNode = ({ data }: { data: Record<string, unknown> }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-[#1e293b] border border-[#334155]" style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-400" />
    <div className="flex flex-col">
      <div className="text-xs font-bold text-gray-200">{data.label as string}</div>
      <div className="text-[10px] text-gray-400">File</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-400" />
  </div>
);

const BugNode = ({ data }: { data: Record<string, unknown> }) => (
  <div className="px-4 py-2 shadow-lg rounded-md bg-[#7f1d1d] border-2 border-red-500 animate-pulse" style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }}>
    <Handle type="target" position={Position.Top} className="w-2 h-2 bg-red-400" />
    <div className="flex flex-col">
      <div className="text-xs font-bold text-white flex items-center gap-1">
        <span className="text-red-300">⚠</span> {data.label as string}
      </div>
      <div className="text-[10px] text-red-200 font-bold">BUG DETECTED</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-red-400" />
  </div>
);

const nodeTypes = {
  file: NormalNode,
  bug: BugNode,
};

// --- Layouting with Dagre ---
const nodeWidth = 150;
const nodeHeight = 50;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  nodes.forEach((node) => {
    const nodeWithPosition = g.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

// --- Main Component ---
interface CodebaseGraphProps {
  graphData: {
    nodes: { id: string; label: string; type: string }[];
    edges: { id?: string; source: string; target: string }[];
    reasoning_path: string[];
  };
  onNodeClick?: (nodeId: string) => void;
}

export const CodebaseGraph: React.FC<CodebaseGraphProps> = ({ graphData, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    // 1. Cap to top ~30 important files
    const limitedNodes = graphData.nodes.slice(0, 30);
    const validNodeIds = new Set(limitedNodes.map((n) => n.id));

    // 2. Format Nodes
    const initialNodes: Node[] = limitedNodes.map((n) => ({
      id: n.id,
      type: n.type,
      data: { label: n.label, fullPath: n.id },
      position: { x: 0, y: 0 },
    }));

    // 3. Format Edges
    const reasoningSet = new Set<string>();
    const { reasoning_path } = graphData;
    for (let i = 0; i < reasoning_path.length - 1; i++) {
      reasoningSet.add(`${reasoning_path[i]}->${reasoning_path[i + 1]}`);
    }

    const initialEdges: Edge[] = (graphData.edges || [])
      .filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
      .map((e) => {
        const isReasoning = reasoningSet.has(`${e.source}->${e.target}`);
        return {
          id: e.id || `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          animated: true,
          style: {
            stroke: isReasoning ? '#a855f7' : '#475569',
            strokeWidth: isReasoning ? 3 : 1,
            opacity: isReasoning ? 1 : 0.4,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isReasoning ? '#a855f7' : '#475569',
          },
        };
      });

    // 4. Add "virtual" reasoning edges if they don't explicitly exist
    for (let i = 0; i < reasoning_path.length - 1; i++) {
      const source = reasoning_path[i];
      const target = reasoning_path[i + 1];
      if (validNodeIds.has(source) && validNodeIds.has(target)) {
        const exists = initialEdges.some((e) => e.source === source && e.target === target);
        if (!exists) {
          initialEdges.push({
            id: `reasoning-${source}-${target}`,
            source,
            target,
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 3, opacity: 1 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
          });
        }
      }
    }

    // Apply Layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [graphData, setNodes, setEdges]);

  return (
    <div className="w-full h-full min-h-[500px] border border-gray-700 rounded-lg overflow-hidden bg-[#0f172a] relative">
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 p-3 rounded-lg border border-gray-700 backdrop-blur-sm shadow-xl">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Investigation Path
        </h3>
        <div className="mt-2 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1e293b] border border-[#334155] rounded-sm"></div>
            <span>Code Module</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#7f1d1d] border border-red-500 rounded-sm shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
            <span className="text-red-300">Vulnerable Node</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-1 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-purple-300">AI Traced Flow</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node.id)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="bg-gray-800 fill-white text-white border-gray-700" />
      </ReactFlow>
    </div>
  );
};
