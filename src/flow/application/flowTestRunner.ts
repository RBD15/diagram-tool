import type { Edge } from '@xyflow/react';
import type { MyNode } from '../../nodes/initialElements';
import flowHandlerPkg from 'rd-flow-handler';
import {
  getNodeLabel,
  logExecutedNode,
  truncateMessage,
  type LogEntry,
} from '../domain/flowLog';

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

type Ref<T> = { current: T };

export type FlowTestStatus = 'idle' | 'running' | 'ended' | 'error';

type RunFlowTestParams = {
  nodes: MyNode[];
  edges: Edge[];
  signal: AbortSignal;
  addLog: (type: LogEntry['type'], message: string, nodeName?: string) => void;
  setPrompt: (prompt: string | null) => void;
  writeInterfaceRef: Ref<any | null>;
  lastLoggedNodeIdRef: Ref<string | null>;
  lastLoggedNodeNameRef: Ref<string>;
};

const getCurrentNodeFromState = (flowHandler: any) => {
  try {
    const state = flowHandler?.getFlowState?.();
    const nodeId = state?.currentNodeId;
    if (!nodeId) return null;
    const node = state?.nodes?.find((n: any) => n.id === nodeId);
    return { nodeId, node };
  } catch {
    return null;
  }
};

export const stopFlowExecution = (
  abortControllerRef: Ref<AbortController | null>,
  writeInterfaceRef: Ref<any | null>
) => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  if (writeInterfaceRef.current) {
    try {
      writeInterfaceRef.current.provideInput('__STOP__');
    } catch {
      // ignore
    }
  }
};

export const runFlowTest = async ({
  nodes,
  edges,
  signal,
  addLog,
  setPrompt,
  writeInterfaceRef,
  lastLoggedNodeIdRef,
  lastLoggedNodeNameRef,
}: RunFlowTestParams): Promise<{ aborted: boolean; error?: Error }> => {
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

    if (signal.aborted) return { aborted: true };

    const firstNodeInfo = getCurrentNodeFromState(flowHandler);
    if (firstNodeInfo?.node) {
      lastLoggedNodeNameRef.current = getNodeLabel(firstNodeInfo.node);
    }

    await flowHandler.exec();
    logExecutedNode(firstNodeInfo, lastLoggedNodeIdRef, lastLoggedNodeNameRef, addLog);

    let ended = false;
    while (!ended && !signal.aborted) {
      flowHandler.setFlow(flowCode);
      const nodeInfo = getCurrentNodeFromState(flowHandler);

      if (nodeInfo?.node) {
        lastLoggedNodeNameRef.current = getNodeLabel(nodeInfo.node);
      }

      await flowHandler.exec();
      logExecutedNode(nodeInfo, lastLoggedNodeIdRef, lastLoggedNodeNameRef, addLog);

      if (signal.aborted) break;
      ended = flowHandler.isFlowEnded();
    }

    if (signal.aborted) {
      return { aborted: true };
    }

    setPrompt(null);
    addLog('system', 'Flujo finalizado correctamente ✅', 'Sistema');
    return { aborted: false };
  } catch (error) {
    if (signal.aborted) return { aborted: true };
    const err = error as Error;
    addLog('error', `Error: ${err.message ?? 'Error'}`, 'Sistema');
    return { aborted: false, error: err };
  }
};
