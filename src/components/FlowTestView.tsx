import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge } from '@xyflow/react';
import type { MyNode } from '../nodes/initialElements';
import flowHandlerPkg from 'rd-flow-handler';

const {
  FlowHandler,
  FlowCode,
  NodePrototype,
  UiWriteInterface,
  ApiNode,
  CaseNode,
  ConditionNode,
  EndNode,
  InitNode,
  PrintNode,
  QueueNode,
  VariableNode,
} = flowHandlerPkg as any;

const nodeClasses = [
  ApiNode,
  CaseNode,
  ConditionNode,
  EndNode,
  InitNode,
  PrintNode,
  QueueNode,
  VariableNode,
];

type FlowTestViewProps = {
  nodes: MyNode[];
  edges: Edge[];
  isValid: boolean;
};

type LogEntry = {
  id: string;
  type: 'system' | 'prompt' | 'input' | 'error';
  message: string;
  timestamp: string;
  nodeName?: string;
};

export const FlowTestView: React.FC<FlowTestViewProps> = ({ nodes, edges, isValid }) => {
  const [status, setStatus] = useState<'idle' | 'running' | 'ended' | 'error'>('idle');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const writeInterfaceRef = useRef<UiWriteInterface | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const lastLoggedNodeIdRef = useRef<string | null>(null);
  const lastLoggedNodeNameRef = useRef<string>('Sistema');

  const truncateMessage = (message: string, limit = 500) => {
    if (message.length <= limit) return message;
    return `${message.slice(0, limit)}... [truncated]`;
  };

  const addLog = (type: LogEntry['type'], message: string, nodeName?: string) => {
    const safeMessage = truncateMessage(message, 800);
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7),
      type,
      message: safeMessage,
      timestamp: new Date().toLocaleTimeString(),
      nodeName: nodeName ?? 'Sistema',
    };
    setLogs((prev) => [...prev, entry]);
  };

  const getNodeLabel = (node: any) => {
    if (!node) return 'desconocido';
    const name = node?.data?.name || node?.data?.label;
    return name ? `${name}` : `${node.type}`;
  };

  const getCurrentNodeFromState = (flowHandler: any) => {
    try {
      const state = flowHandler?.getFlowState?.();
      const nodeId = state?.currentNodeId;
      if (!nodeId) return null;
      const node = state?.nodes?.find((n: any) => n.id === nodeId);
      return { nodeId, node };
    } catch (e) {
      return null;
    }
  };

  const logExecutedNode = (nodeInfo: { nodeId: string; node: any } | null) => {
    if (!nodeInfo?.nodeId || nodeInfo.nodeId === lastLoggedNodeIdRef.current) return;
    const nodeName = getNodeLabel(nodeInfo.node);
    lastLoggedNodeIdRef.current = nodeInfo.nodeId;
    lastLoggedNodeNameRef.current = nodeName;
    addLog('system', `Nodo ejecutado (${nodeInfo.nodeId})`, nodeName);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const stopRunningFlow = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // If waiting for input, break it
    if (writeInterfaceRef.current) {
      try {
        writeInterfaceRef.current.provideInput('__STOP__');
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (!isValid) return;

    if (status === 'running') {
      stopRunningFlow();
      // Allow some time for cleanup if needed, or just proceed
    }
    
    // Reset state
    setStatus('running');
    setPrompt(null);
    setInput('');
    setLogs([]);
    addLog('system', 'Iniciando test de flujo...', 'Sistema');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    try {
      const uiWrite = new UiWriteInterface((msg: string) => {
        if (signal.aborted) return;
        const safePrompt = truncateMessage(msg, 800);
        setPrompt(safePrompt);
        addLog('prompt', safePrompt, lastLoggedNodeNameRef.current);
      });
      writeInterfaceRef.current = uiWrite;

      const nodePrototype = new NodePrototype(uiWrite, true, nodeClasses);
      const flowCode = new FlowCode(nodes, edges, {}, nodePrototype);
      if (typeof flowCode.setOnNodeVisit === 'function') {
        flowCode.setOnNodeVisit((node: any) => {
          if (signal.aborted) return;
          const nodeName = getNodeLabel(node);
          lastLoggedNodeNameRef.current = nodeName;
          if (node?.id) {
            lastLoggedNodeIdRef.current = node.id;
          }
          addLog('system', `Nodo ejecutado (${node?.id ?? 'N/A'})`, nodeName);
        });
      }
      const flowHandler = new FlowHandler(flowCode);

      lastLoggedNodeIdRef.current = null;

      // Execute first step
      if (signal.aborted) return;
      const firstNodeInfo = getCurrentNodeFromState(flowHandler);
      if (firstNodeInfo?.node) {
        lastLoggedNodeNameRef.current = getNodeLabel(firstNodeInfo.node);
      }
      await flowHandler.exec();
      logExecutedNode(firstNodeInfo);

      let ended = false;
      while (!ended && !signal.aborted) {
        // If aborted during previous exec, break
        if (signal.aborted) break;

        flowHandler.setFlow(flowCode);
        const nodeInfo = getCurrentNodeFromState(flowHandler);
        if (nodeInfo?.node) {
          lastLoggedNodeNameRef.current = getNodeLabel(nodeInfo.node);
        }
        await flowHandler.exec();
        logExecutedNode(nodeInfo);
        
        if (signal.aborted) break;
        ended = flowHandler.isFlowEnded();
      }

      if (!signal.aborted) {
        setStatus('ended');
        setPrompt(null);
        addLog('system', 'Flujo finalizado correctamente ✅', 'Sistema');
      }
    } catch (err) {
      if (signal.aborted) return;
      setStatus('error');
      const msg = (err as Error).message ?? 'Error';
      addLog('error', `Error: ${msg}`, 'Sistema');
    }
  }, [edges, isValid, nodes, status, stopRunningFlow]);

  const handleStop = useCallback(() => {
    stopRunningFlow();
    setStatus('idle');
    setPrompt(null);
    addLog('system', '🛑 Test detenido por el usuario', 'Sistema');
  }, [stopRunningFlow]);

  const handleRestart = useCallback(() => {
    handleStop();
    // Use timeout to ensure state settles or just invoke start
    setTimeout(() => {
      handleStart();
    }, 100);
  }, [handleStop, handleStart]);

  const handleSendInput = useCallback(() => {
    if (!writeInterfaceRef.current) return;
    try {
      addLog('input', input, 'Usuario');
      writeInterfaceRef.current.provideInput(input);
      setInput('');
      setPrompt(null); // Clear prompt while waiting next
    } catch (err) {
      // ignore
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleSendInput();
    }
  };

  if (!isValid) return null;

  return (
    <div className="flow-test-panel">
      <div className="flow-test-header">
        <strong>Test del flujo</strong>
        <div className="flow-test-controls">
           {status === 'running' ? (
             <button onClick={handleStop} className="btn-stop">Detener</button>
           ) : (
             <button onClick={handleStart} className="btn-start">
               {status === 'idle' ? 'Iniciar Test' : 'Reiniciar Test'}
             </button>
           )}
           {status === 'running' && (
             <button onClick={handleRestart} className="btn-restart">Reiniciar</button>
           )}
        </div>
      </div>
      
      <div className="flow-test-status-bar">
        Status: <span className={`status-${status}`}>{status}</span>
      </div>

      <div className="flow-test-logs">
        {logs.map((log) => (
          <div key={log.id} className={`log-entry log-${log.type}`}>
            <span className="log-time">[{log.timestamp}][{log.nodeName ?? 'Sistema'}]</span>
            <span className="log-msg"> {log.message}</span>
          </div>
        ))}
        {prompt && (
             <div className="log-entry log-prompt-active">
               <span className="log-time">[{new Date().toLocaleTimeString()}][{lastLoggedNodeNameRef.current}]</span>
               <span className="log-msg"> {prompt} (Esperando input...)</span>
             </div>
        )}
        <div ref={logsEndRef} />
      </div>

      {status === 'running' && prompt && (
        <div className="flow-test-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu respuesta..."
            autoFocus
          />
          <button onClick={handleSendInput} disabled={!input.trim()}>
            Enviar
          </button>
        </div>
      )}
    </div>
  );
};
