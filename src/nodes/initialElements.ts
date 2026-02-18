import { type Node } from '@xyflow/react';

export type FlowType = 'voice' | 'chat' | 'all';

export type InitNode = Node<{ setting: any }, 'init'>;
export type EndNode = Node<{ lastSteps: any }, 'end'>;
export type VariableNode = Node<{ name: string ,value: string }, 'variable'>;
export type ConditionNode = Node<{ name:string, condition: string ,value: string, thenConnection: boolean, elseConnection: boolean }, 'condition'>;
export type PrintNode = Node<{code: string}, 'print'>;
export type QueueNode = Node<{queueID: string}, 'queue'>;
export type UppercaseNode = Node<{ text: string }, 'uppercase'>;
export type ApiNode = Node<{ method?: string; url?: string; headers?: string; body?: string; responseVar?: string }, 'api'>;
export type CaseNode = Node<{ caseValues?: string[] }, 'case'>;
export type MenuNode = Node<{ audioFile?: string; maxRetries?: number }, 'menu'>;
export type TranscribeNode = Node<{ outputVariable?: string; maxTimeListening?: number }, 'transcribe'>;
export type TalkNode = Node<{ text?: string; voiceModel?: string }, 'talk'>;
export type MyNode = InitNode | EndNode | VariableNode | PrintNode | UppercaseNode | ConditionNode | QueueNode | ApiNode | CaseNode | MenuNode | TranscribeNode | TalkNode;

export function isVariableNode(
  node: any,
): node is VariableNode | undefined {
  return !node ? false : node.type === 'variable';
}

