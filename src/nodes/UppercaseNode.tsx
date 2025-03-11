import { memo, useEffect } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
 
import { isVariableNode, type MyNode } from './initialElements';
 
function UppercaseNode({ id }: NodeProps) {
  const { updateNodeData } = useReactFlow();
  
  const connections = useHandleConnections({
    type: 'target',
  });
  
  const nodesData = useNodesData<MyNode>(connections[0]?.source);
  const variableNode = isVariableNode(nodesData) ? nodesData : null;
 
  useEffect(() => {
    updateNodeData(id, { value: variableNode?.data.value.toUpperCase() });
  }, [variableNode]);
 
  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={connections.length === 0}
      />
      <div>uppercase transform</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
 
export default memo(UppercaseNode);