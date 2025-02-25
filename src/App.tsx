import React, { useCallback, useEffect } from 'react';

import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import '@reactflow/core/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1', icon: 'https://alo-project-front.s3.us-east-1.amazonaws.com/init.png' },  sourcePosition: 'right', targetPosition: 'left', connectable: true },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2', icon: 'https://example.com/icon2.png' },  sourcePosition: 'right', targetPosition: 'left', connectable: true },
  { id: '3', position: { x: 0, y: 150 }, data: { label: '3', icon: 'https://alo-project-front.s3.us-east-1.amazonaws.com/end.png' },  sourcePosition: 'right', targetPosition: 'left', connectable: true },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge({ ...connection, id: `${connection.source}-${connection.target}` }, eds));
    },
    [setEdges]
  );

  useEffect(() => {
    //lógica para crear conexiones automáticas
    const newEdges = [];
    nodes.forEach((node) => {
      if (node.data.label % 2 === 0) { // Conectar nodos pares
        newEdges.push({
          id: `${node.id}-next`,
          source: node.id,
          target: String(parseInt(node.id) + 1)
        });
      }
    });
    setEdges((eds) => [...newEdges, ...eds]);
  }, [nodes]); // Asegúrate de que el efecto se ejecute cuando cambian los nodos

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView // Para ajustar la vista automáticamente
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}