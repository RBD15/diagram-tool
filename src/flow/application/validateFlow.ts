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

  const caseNodesOk = currentNodes
    .filter((node) => node.type === 'case')
    .every((node) => {
      const outs = outgoing.get(node.id) ?? [];
      return outs.some((edge) => edge.label === 'DEFAULT' || edge.type === 'DEFAULT');
    });

  const apiNodesOk = currentNodes
    .filter((node) => node.type === 'api')
    .every((node) => {
      const d = node.data as { method?: string; url?: string; responseVar?: string; body?: string };
      const method = (d.method ?? '').toUpperCase();
      const hasMethod = typeof d.method === 'string' && d.method.trim().length > 0;
      const hasUrl = typeof d.url === 'string' && d.url.trim().length > 0;
      const hasResp = typeof d.responseVar === 'string' && d.responseVar.trim().length > 0;
      if (!hasMethod || !hasUrl || !hasResp) return false;
      if (['POST', 'PUT', 'UPDATE'].includes(method)) {
        return typeof d.body === 'string' && d.body.trim().length > 0;
      }
      return true;
    });

  const menuNodesOk = currentNodes
    .filter((node) => node.type === 'menu')
    .every((node) => {
      const data = node.data as { audioFile?: string | null };
      const hasAudio = typeof data.audioFile === 'string' && data.audioFile.trim().length > 0;
      const hasInput = (incoming.get(node.id)?.length ?? 0) > 0;
      const hasOutput = (outgoing.get(node.id)?.length ?? 0) > 0;
      return hasAudio && hasInput && hasOutput;
    });

  const transcribeNodesOk = currentNodes
    .filter((node) => node.type === 'transcribe')
    .every((node) => {
      const data = node.data as { outputVariable?: string | null; maxTimeListening?: number | null };
      const hasOutputVariable =
        typeof data.outputVariable === 'string' && data.outputVariable.trim().length > 0;
      const hasMaxTimeListening =
        typeof data.maxTimeListening === 'number' && Number.isFinite(data.maxTimeListening) && data.maxTimeListening > 0;
      return hasOutputVariable && hasMaxTimeListening;
    });

  const talkNodesOk = currentNodes
    .filter((node) => node.type === 'talk')
    .every((node) => {
      const data = node.data as { text?: string | null; voiceModel?: string | null };
      const hasText = typeof data.text === 'string' && data.text.trim().length > 0;
      const hasVoiceModel =
        typeof data.voiceModel === 'string' && data.voiceModel.trim().length > 0;
      return hasText && hasVoiceModel;
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
    {
      id: 'api-node',
      label: 'ApiNode debe tener method, url y variable de respuesta (body si aplica)',
      passed: apiNodesOk,
    },
    {
      id: 'case-node',
      label: 'CaseNode debe tener la conexión por defecto (DEFAULT)',
      passed: caseNodesOk,
    },
    {
      id: 'menu-node',
      label: 'MenuNode debe tener audio seleccionado y al menos una entrada/salida conectada',
      passed: menuNodesOk,
    },
    {
      id: 'transcribe-node',
      label: 'TranscribeNode debe tener output variable y maxTimeListening configurados',
      passed: transcribeNodesOk,
    },
    {
      id: 'talk-node',
      label: 'TalkNode debe tener texto y voice model configurados',
      passed: talkNodesOk,
    },
  ];

  return {
    isValid: items.every((item) => item.passed),
    items,
  };
};
