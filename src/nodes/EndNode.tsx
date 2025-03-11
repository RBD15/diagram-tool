import { memo, useEffect } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  useNodesData,
  Node,
  type NodeProps,
} from '@xyflow/react';
 
// import { type MyNode } from './initialElements';
 
function EndNode({ id, lastSteps }: NodeProps<Node<{lastSteps: any}>>) {
  const { updateNodeData } = useReactFlow();
  
  // useEffect(() => {
  //   updateNodeData(id, { setting });
  // }, [variableNode]);
  const icon = "https://alo-project-front.s3.us-east-1.amazonaws.com/end.png"

  return (
    <div>
      <img src={icon} alt="" width={25} height={25} />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={true}
      />
      {/* <Handle type="source" position={Position.Right} /> */}
    </div>
  );
}
 
export default memo(EndNode);