import React, { useRef, useCallback, useEffect, useState } from 'react';
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
import ConditionNode from './nodes/ConditionNode';
import QueueNode from './nodes/QueueNode';
import { RequestClient } from './db/RequestClient';
import { AxiosResponse } from 'axios';
import { getQueues } from './hooks/queues/getQueue';
import ModalComponent from './components/Modal';
import { validateFlow } from './flow/application/validateFlow';

const nodeTypes = {
  variable: VariableNode,
  print: PrintNode,
  uppercase: UppercaseNode,
  init: InitNode,
  end: EndNode,
  condition: ConditionNode,
  queue: QueueNode
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

let id = 1;
const getId = () => `${id++}`;

const Flow = () => {

  type FlowForm = {
    name: string;
    type: string;
  };

  const edgeReconnectSuccessful = useRef(true);
  const reactFlowWrapper = useRef(null);
  const baseURL:string = "http://localhost:8080/"
  const [queues,setQueues] = useState([])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [flowForm, setFlowForm] = useState<FlowForm>({
    name: '',
    type: ''
  });
  const flowCodeRef = useRef(1999);
  const getNextFlowCode = useCallback(() => {
    flowCodeRef.current += 1;
    return `${flowCodeRef.current}`;
  }, []);
  const [validation, setValidation] = useState(() => validateFlow(nodes, edges));
  const hasQueueNode = nodes.some((node) => node.type === 'queue');
  const pendingValidationItems = validation.items.filter((item) => {
    if (item.passed) return false;
    if (item.id === 'queue-node' && !hasQueueNode) return false;
    return true;
  });

  useEffect(()=>{
    const fetchQueues = async (baseURL:string) => {
      try {
        const queueList:any = await getQueues(baseURL)
        console.log("Hook",queueList.data)
        setQueues(queueList.data)
      } catch (error) {
        console.log("Error getting queues",error);
        alert("Error getting queues")
      }
    }
    fetchQueues(baseURL)
  },[])

  useEffect(() => {
    setValidation(validateFlow(nodes, edges));
  }, [nodes, edges]);

  const handleFlowForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFlowForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onConnect = useCallback(
    (params) => { 
    const nodeIndex = nodes.findIndex((node) => node.id === params.source)
    const sourceNode = nodes[nodeIndex]

      setEdges((eds) => {        

        const newEdges = addEdge(params, eds)
        if(sourceNode.type === "condition"){
          
          const index = newEdges.length -1
          if(!sourceNode.data.thenConnection){
            newEdges[index].label = "THEN"
            newEdges[index].type = "THEN"
            sourceNode.data.thenConnection = true
          }else{
            newEdges[index].label = "ELSE"
            newEdges[index].type = "ELSE"
            sourceNode.data.elseConnection = true
          }
          nodes[nodeIndex] = sourceNode
        }
        return newEdges
      }
    )
  },[nodes]
  )
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log("Dragging event",event);
  }, []);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  
  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);
  
  // Delete edge
  const onReconnectEnd = useCallback((_, edge) => {
    
    if (!edgeReconnectSuccessful.current) {
      const nodeIndex = nodes.findIndex((node) => node.id === edge.source)
      const sourceNode = nodes[nodeIndex]

      // setEdges((eds) => eds.filter((e) => {
      //   const edgesResult = e.id !== edge.id
      // }));

      if(sourceNode.type === "condition"){
        if(edge.label == 'THEN'){
          sourceNode.data.thenConnection = false          
        }
        
        if(edge.label == 'ELSE'){
          sourceNode.data.elseConnection = false
        }
      }
      setEdges((eds) => eds.filter((e) => e.id !== edge.id ));

    }
  
    edgeReconnectSuccessful.current = true;
  }, [nodes]);
  
  const onDrop = useCallback(  
    (event) => {
      event.preventDefault()
      console.log("Moving",event)
      
      if (!type) {
        return;
      }
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      let newNode

      if(type === "condition"){
        newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node`, thenConnection: false , elseConnection: false, condition: '>' },
        }
      }else if(type === "queue"){
        newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node`, queueID: undefined },
        }
      }else{
        newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        }
      }
      
      if(newNode.type === "init"){
        setNodes((nds) => [newNode, ...nds]);
      }else{
        setNodes((nds) => nds.concat(newNode));
      }
    },
    [screenToFlowPosition, type,queues]
  );

  const generateArtifact = async () => {
    const validationResult = validateFlow(nodes, edges);
    setValidation(validationResult);
    if (!validationResult.isValid) {
      alert('El flujo no cumple las validaciones. Corrige los errores para desplegar.');
      return;
    }
    let data = {
      nodes,
      edges
    }
    // console.log({data});
    
    try {
      //Code must generate automatically
      const flowVO = {
        name:flowForm.name,
        code:getNextFlowCode(),
        type:flowForm.type,
        data
      }
      
      const baseURL = 'http://localhost:8080/api/'
      const requestClient: RequestClient = new RequestClient(baseURL)
      const result: AxiosResponse = await requestClient.post('flows',flowVO)

      if(!result){
        alert("Error storing flow")
        return
      }

      alert("Flow was storing successfully")

      // const jsonData = JSON.stringify(data);
      // const blob = new Blob([jsonData], { type: 'application/json' });
      // const url = URL.createObjectURL(blob);
              
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'data.json';
      // a.click();
              
      // URL.revokeObjectURL(url);

    } catch (error) {
      alert("Error uploading flow")
      console.log("RequestClient error",error);
    }
  }

  // Detecta el nodo seleccionado
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeIds([node.id])
  }, []);

  // Elimina nodo al presionar "Delete"
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Delete' && selectedNodeIds.length > 0) {
        setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
        setEdges((eds) =>
          eds.filter(
            (edge) =>
              !selectedNodeIds.includes(edge.source) &&
              !selectedNodeIds.includes(edge.target)
          )
        );
        setSelectedNodeIds([]);
      }
    },
    [selectedNodeIds, setNodes, setEdges]
  );

  const [isModalOpen, setModalOpen] = useState(false);
  const [queueSelected, setQueueSelected] = useState<string>('Ninguna');

  const handleQueueUpdate = (option: string) => {    
    setQueueSelected(option);
      setNodes(
        (prevNode) => prevNode.map((node) =>
          selectedNodeIds.includes(node.id) ? { ...node, data: { ...node.data, queueID: option } } : node
        )
      );
  };

  const handleNodeDoubleClick = async(event: React.MouseEvent,currentNode: MyNode) => 
  {
    if(currentNode.type === 'queue'){
      if(queues.length == 0){
        const fetchQueues = async (baseURL:string) => {
          try {
            const queueList:any = await getQueues(baseURL)
            console.log("Hook",queueList.data)
            setQueues(queueList.data)
            await fetchQueues(baseURL)
            setModalOpen(true)
          } catch (error) {
            console.log("Error getting queues",error);
            alert("Error getting queues")
          }
        }
      }else{
        setModalOpen(true)
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ width: '100vw', height: '100vh' }} tabIndex={0} >
      <div className="dndflow">
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <div className="reactflow-canvas">
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
              onNodeClick={onNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              nodeTypes={nodeTypes}
              fitView
              style={{ backgroundColor: "#F7F9FB" }}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
            <div>
            <label>Name:</label>
              <input
                type="text"
                name="name"
                value={flowForm.name}
                onChange={handleFlowForm}
              />
            </div>
            <div>
              <label>Type:</label>
              <input
                type="text"
                name="type"
                value={flowForm.type}
                onChange={handleFlowForm}
              />
            </div>

            <button onClick={generateArtifact}>Deploy</button>

            <div className="validation-panel">
              <div className="validation-header">
                <strong>Validación del flujo</strong>
                <span className={validation.isValid ? 'status-ok' : 'status-error'}>
                  {validation.isValid ? 'Listo para desplegar' : 'Pendiente'}
                </span>
              </div>
              <ul>
                {pendingValidationItems.length === 0 ? (
                  <li className="status-ok">✅ Sin validaciones pendientes</li>
                ) : (
                  pendingValidationItems.map((item) => (
                    <li key={item.id} className="status-error">
                      ❌ {item.label}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {queues.length>0 && <div style={{ padding: '20px' }}>
              {/* <h1>Opción seleccionada: {queueSelected}</h1>
              <button onClick={() => setModalOpen(true)}>Abrir Modal</button> */}
              <ModalComponent
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onUpdate={handleQueueUpdate}
                options={queues}
              />
            </div>}

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
