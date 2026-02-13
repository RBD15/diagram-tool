export type LogEntry = {
  id: string;
  type: 'system' | 'prompt' | 'input' | 'error';
  message: string;
  timestamp: string;
  nodeName?: string;
};

type Ref<T> = { current: T };

type NodeInfo = {
  nodeId: string;
  node: any;
};

export const truncateMessage = (message: string, limit = 500) => {
  if (message.length <= limit) return message;
  return `${message.slice(0, limit)}... [truncated]`;
};

export const createLogEntry = (
  type: LogEntry['type'],
  message: string,
  nodeName?: string,
  limit = 800
): LogEntry => {
  const safeMessage = truncateMessage(message, limit);
  return {
    id: Math.random().toString(36).substring(7),
    type,
    message: safeMessage,
    timestamp: new Date().toLocaleTimeString(),
    nodeName: nodeName ?? 'Sistema',
  };
};

export const getNodeLabel = (node: any) => {
  if (!node) return 'desconocido';
  const name = node?.data?.name || node?.data?.label;
  return name ? `${name}` : `${node.type}`;
};

export const logExecutedNode = (
  nodeInfo: NodeInfo | null,
  lastLoggedNodeIdRef: Ref<string | null>,
  lastLoggedNodeNameRef: Ref<string>,
  addLog: (type: LogEntry['type'], message: string, nodeName?: string) => void
) => {
  if (!nodeInfo?.nodeId || nodeInfo.nodeId === lastLoggedNodeIdRef.current) return;
  const nodeName = getNodeLabel(nodeInfo.node);
  lastLoggedNodeIdRef.current = nodeInfo.nodeId;
  lastLoggedNodeNameRef.current = nodeName;
  addLog('system', `Nodo ejecutado (${nodeInfo.nodeId})`, nodeName);
};
