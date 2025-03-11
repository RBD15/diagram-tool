import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  reconnectEdge,
  useReactFlow,
  Background,
  type Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import Sidebar from './components/Sidebar';
import { DnDProvider, useDnD } from './components/DnDContext';

// NODOS
import PrintNode from './nodes/PrintNode';
import UppercaseNode from './nodes/UppercaseNode';
import { type MyNode } from './nodes/initialElements';
import VariableNode from './nodes/VariableNode';
import InitNode from './nodes/InitNode';
import EndNode from './nodes/EndNode';

const nodeTypes = {
  variable: VariableNode,
  result: PrintNode,
  uppercase: UppercaseNode,
  init: InitNode,
  end: EndNode
};

const initialNodes: MyNode[] = []
const initEdges: Edge[] = []

// const initialNodes: MyNode[] = [
//   {
//     id: '5',
//     type: 'variable',
//     data: {
//       value: 'hello',
//       name: ''
//     },
//     position: { x: -100, y: -50 },
//   },
//   {
//     id: '2',
//     type: 'variable',
//     data: {
//       value: 'world',
//       name: ''
//     },
//     position: { x: 0, y: 100 },
//   },
//   {
//     id: '3',
//     type: 'uppercase',
//     data: { text: '' },
//     position: { x: 100, y: -100 },
//   },
//   {
//     id: '4',
//     type: 'result',
//     data: {input:''},
//     position: { x: 300, y: -75 },
//   },
//   {
//     id: '1',
//     type: 'init',
//     data: {
//       setting: {

//       }
//     },
//     position: { x: -80, y: -50 },
//   },
//   {
//     id: '6',
//     type: 'end',
//     data: {
//       lastSteps: {

//       }
//     },
//     position: { x: -60, y: -50 },
//   }
// ];
 
// const initEdges: Edge[] = [
//   {
//     id: 'e1-3',
//     source: '1',
//     target: '3',
//   },
//   {
//     id: 'e3-4',
//     source: '3',
//     target: '4',
//   },
//   {
//     id: 'e2-4',
//     source: '2',
//     target: '4',
//   },
// ];

const generateArtifact = () => {
  let artifacts = {
    nodes: initialNodes,
    edges: initEdges
  }
  console.log({artifacts});
}

//TODO: Global context for variables variables{nombre:value} call in result
//  node like 'Bienvenido {nombre}' donde {} marca la variable y se imprime
//  como `Bienvenido ${context.variables['variableName']}`

let id = 1;
const getId = () => `${id++}`;

const Flow = () => {
  const edgeReconnectSuccessful = useRef(true);
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log("Draggind event",event);
    
  }, []);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  
  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);
  
  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
  
    edgeReconnectSuccessful.current = true;
  }, []);
  
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      console.log("Moving",event);
      
      if (!type) {
        return;
      }
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }} tabIndex={0} >
      <div className="dndflow">
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            snapToGrid
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            nodeTypes={nodeTypes}
            fitView
            style={{ backgroundColor: "#F7F9FB" }}
          >
            <Controls />
            <Background />
          </ReactFlow>
          <button onClick={generateArtifact()}>Deploy</button>
        </div>
        <Sidebar />
      </div>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <Flow />
    </DnDProvider>
  </ReactFlowProvider>
);
