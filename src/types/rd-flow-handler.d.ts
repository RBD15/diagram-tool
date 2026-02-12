declare module 'rd-flow-handler' {
  type HandlerPkg = {
    FlowHandler: typeof FlowHandler;
    FlowCode: typeof FlowCode;
    NodePrototype: typeof NodePrototype;
    WriteInterface: typeof WriteInterface;
    UiWriteInterface: typeof UiWriteInterface;
    ApiNode: typeof ApiNode;
    CaseNode: typeof CaseNode;
    ConditionNode: typeof ConditionNode;
    EndNode: typeof EndNode;
    InitNode: typeof InitNode;
    PrintNode: typeof PrintNode;
    QueueNode: typeof QueueNode;
    VariableNode: typeof VariableNode;
  };

  const pkg: HandlerPkg;
  export default pkg;

  export class FlowHandler {
    constructor(flow: any);
    setFlow(flow: any): void;
    getCurrentInput(): void;
    setInput(input: any): void;
    getFlowState(): any;
    isFlowEnded(): boolean;
    exec(): Promise<void>;
  }

  export class FlowCode {
    constructor(nodes: any[], edges: any[], settings: any, nodePrototype: any);
  }

  export class NodePrototype {
    constructor(writeInterface: any, debug?: boolean, nodeClasses?: any[]);
  }

  export class WriteInterface {
    ask(msg: string): Promise<string>;
  }

  export class UiWriteInterface extends WriteInterface {
    constructor(onPrompt?: (msg: string) => void);
    setPromptHandler(onPrompt: (msg: string) => void): void;
    provideInput(input: string): void;
  }

  export class ApiNode {}
  export class CaseNode {}
  export class ConditionNode {}
  export class EndNode {}
  export class InitNode {}
  export class PrintNode {}
  export class QueueNode {}
  export class VariableNode {}
}
