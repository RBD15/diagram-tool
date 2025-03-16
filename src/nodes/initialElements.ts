import { type Node } from '@xyflow/react';

export type InitNode = Node<{ setting: any }, 'init'>;
export type EndNode = Node<{ lastSteps: any }, 'end'>;
export type VariableNode = Node<{ name: string ,value: string }, 'variable'>;
export type ConditionNode = Node<{ name:string, condition: string ,value: string, thenConnection: boolean, elseConnection: boolean }, 'condition'>;
export type ResultNode = Node<{input: string}, 'result'>;
export type UppercaseNode = Node<{ text: string }, 'uppercase'>;
export type MyNode = InitNode | EndNode | VariableNode | ResultNode | UppercaseNode | ConditionNode;

export function isVariableNode(
  node: any,
): node is VariableNode | UppercaseNode | undefined {
  return !node ? false : node.type === 'variable' || node.type === 'uppercase';
}

