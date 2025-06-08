
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Start Node' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 300, y: 200 },
    data: { label: 'Process Node' },
  },
  {
    id: '3',
    position: { x: 500, y: 100 },
    data: { label: 'End Node' },
    type: 'output',
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
  },
];

export default function FlowchartEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  console.log('FlowchartEditor rendering with nodes:', nodes.length, 'edges:', edges.length);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}
