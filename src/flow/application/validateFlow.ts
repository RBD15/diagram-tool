import { type Edge } from '@xyflow/react';
import { type MyNode } from '../../nodes/initialElements';

export type ValidationItem = {
  id: string;
  label: string;
  passed: boolean;
};

export type FlowValidationResult = {
  isValid: boolean;
  items: ValidationItem[];
};

export const validateFlow = (
  currentNodes: MyNode[],
  currentEdges: Edge[]
): FlowValidationResult => {
  const nodeById = new Map(currentNodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, Edge[]>();
  const incoming = new Map<string, Edge[]>();

  currentEdges.forEach((edge) => {
    if (!outgoing.has(edge.source)) outgoing.set(edge.source, []);
    outgoing.get(edge.source)?.push(edge);
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    incoming.get(edge.target)?.push(edge);
  });

  const hasInitNode = currentNodes.some((node) => node.type === 'init');

  const allNodesConnected = currentNodes.every((node) => {
    const outCount = outgoing.get(node.id)?.length ?? 0;
    const inCount = incoming.get(node.id)?.length ?? 0;
    return outCount + inCount > 0;
  });

  const conditionNodesOk = currentNodes
    .filter((node) => node.type === 'condition')
    .every((node) => {
      const outs = outgoing.get(node.id) ?? [];
      const hasThen = outs.some(
        (edge) =>
          (edge.label === 'THEN' || edge.type === 'THEN') &&
          edge.target &&
          edge.target !== node.id
      );
      const hasElse = outs.some(
        (edge) =>
          (edge.label === 'ELSE' || edge.type === 'ELSE') &&
          edge.target &&
          edge.target !== node.id
      );
      return hasThen && hasElse;
    });

  const queueNodesOk = currentNodes
    .filter((node) => node.type === 'queue')
    .every((node) => {
      const queueId = (node.data as { queueID?: string | null }).queueID;
      return typeof queueId === 'string' && queueId.trim().length > 0;
    });

  const dfs = (nodeId: string, visiting: Set<string>): boolean => {
    const node = nodeById.get(nodeId);
    if (!node) return false;
    if (node.type === 'end') return true;
    if (visiting.has(nodeId)) return false;

    const outs = outgoing.get(nodeId) ?? [];
    if (outs.length === 0) return false;

    visiting.add(nodeId);
    for (const edge of outs) {
      if (!edge.target) {
        visiting.delete(nodeId);
        return false;
      }
      if (!dfs(edge.target, visiting)) {
        visiting.delete(nodeId);
        return false;
      }
    }
    visiting.delete(nodeId);
    return true;
  };

  const initNodes = currentNodes.filter((node) => node.type === 'init');
  const allPathsHaveEndNode =
    initNodes.length > 0 && initNodes.every((node) => dfs(node.id, new Set()));

  const items: ValidationItem[] = [
    {
      id: 'init-node',
      label: 'Validar al menos un InitNode',
      passed: hasInitNode,
    },
    {
      id: 'end-node-paths',
      label: 'Cada ruta debe terminar en un EndNode',
      passed: allPathsHaveEndNode,
    },
    {
      id: 'connected-nodes',
      label: 'Todos los nodos deben estar conectados',
      passed: allNodesConnected,
    },
    {
      id: 'condition-branches',
      label: 'ConditionNode debe tener THEN y ELSE conectados',
      passed: conditionNodesOk,
    },
    {
      id: 'queue-node',
      label: 'QueueNode debe tener queueID',
      passed: queueNodesOk,
    },
  ];

  return {
    isValid: items.every((item) => item.passed),
    items,
  };
};
