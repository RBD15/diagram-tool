import { describe, expect, it } from 'vitest';
import { type Edge } from '@xyflow/react';
import { validateFlow } from '../../../../src/flow/application/validateFlow';
import { type MyNode } from '../../../../src/nodes/initialElements';

const initNode = (id: string): MyNode => ({
  id,
  type: 'init',
  data: { setting: {} },
  position: { x: 0, y: 0 },
});

const endNode = (id: string): MyNode => ({
  id,
  type: 'end',
  data: { lastSteps: {} },
  position: { x: 0, y: 0 },
});

const conditionNode = (id: string): MyNode => ({
  id,
  type: 'condition',
  data: {
    name: 'cond',
    condition: '>',
    value: '1',
    thenConnection: false,
    elseConnection: false,
  },
  position: { x: 0, y: 0 },
});

const variableNode = (id: string): MyNode => ({
  id,
  type: 'variable',
  data: { name: 'var', value: '1' },
  position: { x: 0, y: 0 },
});

const queueNode = (id: string, queueID?: string): MyNode => ({
  id,
  type: 'queue',
  data: { queueID: queueID ?? '' },
  position: { x: 0, y: 0 },
});

const edge = (id: string, source: string, target: string, label?: string, type?: string): Edge => ({
  id,
  source,
  target,
  label,
  type,
});

describe('validateFlow', () => {
  it('fails when there is no InitNode', () => {
    const nodes: MyNode[] = [endNode('end-1')];
    const edges: Edge[] = [];

    const result = validateFlow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.items.find((item) => item.id === 'init-node')?.passed).toBe(false);
  });

  it('fails when any path from InitNode does not reach EndNode', () => {
    const nodes: MyNode[] = [initNode('init-1'), variableNode('var-1')];
    const edges: Edge[] = [edge('e1', 'init-1', 'var-1')];

    const result = validateFlow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.items.find((item) => item.id === 'end-node-paths')?.passed).toBe(false);
  });

  it('fails when there are unconnected nodes', () => {
    const nodes: MyNode[] = [initNode('init-1'), endNode('end-1'), variableNode('var-1')];
    const edges: Edge[] = [edge('e1', 'init-1', 'end-1')];

    const result = validateFlow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.items.find((item) => item.id === 'connected-nodes')?.passed).toBe(false);
  });

  it('fails when a ConditionNode does not have THEN and ELSE connections', () => {
    const nodes: MyNode[] = [
      initNode('init-1'),
      conditionNode('cond-1'),
      endNode('end-1'),
    ];
    const edges: Edge[] = [
      edge('e1', 'init-1', 'cond-1'),
      edge('e2', 'cond-1', 'end-1', 'THEN', 'THEN'),
    ];

    const result = validateFlow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.items.find((item) => item.id === 'condition-branches')?.passed).toBe(false);
  });

  it('fails when a QueueNode does not have a queueID', () => {
    const nodes: MyNode[] = [initNode('init-1'), queueNode('queue-1'), endNode('end-1')];
    const edges: Edge[] = [
      edge('e1', 'init-1', 'queue-1'),
      edge('e2', 'queue-1', 'end-1'),
    ];

    const result = validateFlow(nodes, edges);

    expect(result.isValid).toBe(false);
    expect(result.items.find((item) => item.id === 'queue-node')?.passed).toBe(false);
  });

  it('passes when the flow satisfies all rules', () => {
    const nodes: MyNode[] = [
      initNode('init-1'),
      conditionNode('cond-1'),
      queueNode('queue-1', 'queue-id-1'),
      endNode('end-1'),
      endNode('end-2'),
    ];
    const edges: Edge[] = [
      edge('e1', 'init-1', 'cond-1'),
      edge('e2', 'cond-1', 'queue-1', 'THEN', 'THEN'),
      edge('e3', 'queue-1', 'end-1'),
      edge('e4', 'cond-1', 'end-2', 'ELSE', 'ELSE'),
    ];

    const result = validateFlow(nodes, edges);

    expect(result.isValid).toBe(true);
    expect(result.items.every((item) => item.passed)).toBe(true);
  });
});
