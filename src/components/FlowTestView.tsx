import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Edge } from '@xyflow/react';
import type { MyNode } from '../nodes/initialElements';
import {
  createLogEntry,
  type LogEntry,
} from '../flow/domain/flowLog';
import {
  runFlowTest,
  stopFlowExecution,
  type FlowTestStatus,
} from '../flow/application/flowTestRunner';

type FlowTestViewProps = {
  nodes: MyNode[];
  edges: Edge[];
  isValid: boolean;
};

export const FlowTestView: React.FC<FlowTestViewProps> = ({ nodes, edges, isValid }) => {
  const [status, setStatus] = useState<FlowTestStatus>('idle');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const writeInterfaceRef = useRef<any | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const lastLoggedNodeIdRef = useRef<string | null>(null);
  const lastLoggedNodeNameRef = useRef<string>('Sistema');

  const addLog = useCallback((type: LogEntry['type'], message: string, nodeName?: string) => {
    const entry = createLogEntry(type, message, nodeName);
    setLogs((prev) => [...prev, entry]);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const stopRunningFlow = useCallback(() => {
    stopFlowExecution(abortControllerRef, writeInterfaceRef);
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

    const result = await runFlowTest({
      nodes,
      edges,
      signal,
      addLog,
      setPrompt,
      writeInterfaceRef,
      lastLoggedNodeIdRef,
      lastLoggedNodeNameRef,
    });

    if (result.aborted) return;

    if (result.error) {
      setStatus('error');
      return;
    }

    setStatus('ended');
  }, [addLog, edges, isValid, nodes, status, stopRunningFlow]);

  const handleStop = useCallback(() => {
    stopRunningFlow();
    setStatus('idle');
    setPrompt(null);
    addLog('system', '🛑 Test detenido por el usuario', 'Sistema');
  }, [addLog, stopRunningFlow]);

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
