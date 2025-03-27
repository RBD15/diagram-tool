import { memo } from 'react';
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';

import { type MyNode } from './initialElements';
 
function PrintNode({ id, data }: NodeProps<Node<{ code: string }>>) {

  const { updateNodeData } = useReactFlow();

  const connections = useHandleConnections({
    type: 'target',
  });

  const nodesData = useNodesData<MyNode>(
    connections.map((connection) => connection.source),
  );
  
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <h6>Print</h6>
      <input
          onChange={(evt) => updateNodeData(id, { code: evt.target.value })}
          value={data.code} 
          style={{ display: 'inline' }}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
 
export default memo(PrintNode);