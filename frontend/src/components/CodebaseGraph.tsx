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
  <div
    style={{
      padding: '10px 16px',
      borderRadius: '8px',
      background: '#1e293b',
      border: '1px solid #334155',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
      minWidth: '120px',
      textAlign: 'center',
    }}
  >
    <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: '#60a5fa' }} />
    <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{data.label as string}</div>
    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Module</div>
    <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: '#60a5fa' }} />
  </div>
);

const BugNode = ({ data }: { data: Record<string, unknown> }) => (
  <div
    style={{
      padding: '10px 16px',
      borderRadius: '8px',
      background: '#7f1d1d',
      border: '2px solid #ef4444',
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
      minWidth: '120px',
      textAlign: 'center',
      animation: 'pulse 2s ease-in-out infinite',
    }}
  >
    <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: '#f87171' }} />
    <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <span style={{ color: '#fca5a5' }}>⚠</span> {data.label as string}
    </div>
    <div style={{ fontSize: 10, color: '#fecaca', fontWeight: 700, marginTop: 2 }}>BUG DETECTED</div>
    <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: '#f87171' }} />
  </div>
);

const nodeTypes = {
  file: NormalNode,
  bug: BugNode,
};

// --- Layouting with Dagre ---
const nodeWidth = 160;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- Main Component ---
interface CodebaseGraphProps {
  graphData: {
    nodes: { id: string; label: string; type: string }[];
    edges: { id?: string; source: string; target: string }[];
    reasoning_path: string[];
  } | null;
  onNodeClick?: (nodeId: string) => void;
}

export const CodebaseGraph: React.FC<CodebaseGraphProps> = ({ graphData, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    // Use real data or fallback
    const data = graphData && graphData.nodes && graphData.nodes.length > 0
      ? graphData
      : {
          nodes: [
            { id: 'repository', label: 'Repository', type: 'file' },
            { id: 'src', label: 'src/', type: 'file' },
          ],
          edges: [{ id: 'e-root', source: 'repository', target: 'src' }],
          reasoning_path: [] as string[],
        };

    console.log('[CodebaseGraph] Rendering with:', data.nodes.length, 'nodes,', data.edges.length, 'edges');
    console.log('[CodebaseGraph] Nodes:', JSON.stringify(data.nodes));
    console.log('[CodebaseGraph] Reasoning path:', data.reasoning_path);

    // 1. Cap to top 30 files
    const limitedNodes = data.nodes.slice(0, 30);
    const validNodeIds = new Set(limitedNodes.map((n) => n.id));

    // 2. Format Nodes - ensure required properties
    const initialNodes: Node[] = limitedNodes.map((n, idx) => ({
      id: n.id,
      type: n.type === 'bug' ? 'bug' : 'file',
      data: { label: n.label, fullPath: n.id },
      position: { x: idx * 200, y: idx * 100 }, // fallback positions before layout
    }));

    // 3. Format Edges - build reasoning set
    const reasoningSet = new Set<string>();
    const rp = data.reasoning_path || [];
    for (let i = 0; i < rp.length - 1; i++) {
      reasoningSet.add(`${rp[i]}->${rp[i + 1]}`);
    }

    const initialEdges: Edge[] = (data.edges || [])
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

    // 4. Add virtual reasoning edges
    for (let i = 0; i < rp.length - 1; i++) {
      const source = rp[i];
      const target = rp[i + 1];
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

    // 5. Apply Dagre layout
    try {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    } catch (err) {
      console.error('[CodebaseGraph] Layout error, using manual positions', err);
      setNodes([...initialNodes]);
      setEdges([...initialEdges]);
    }
  }, [graphData, setNodes, setEdges]);

  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      {/* Legend overlay */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.9)',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #334155',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Investigation Path
        </h3>
        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, background: '#1e293b', border: '1px solid #334155', borderRadius: 3 }} />
            <span>Code Module</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: 3 }} />
            <span style={{ color: '#fca5a5' }}>Vulnerable Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 3, background: '#a855f7', borderRadius: 4 }} />
            <span style={{ color: '#c084fc' }}>AI Traced Flow</span>
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
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
        style={{ background: '#0a0f18' }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
        />
      </ReactFlow>

      {/* Pulse animation for bug nodes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};
