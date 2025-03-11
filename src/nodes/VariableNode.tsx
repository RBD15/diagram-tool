import { memo } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  type NodeProps,
  type Node,
} from '@xyflow/react';
 
function VariableNode({ id, data }: NodeProps<Node<{ name:string, value: string }>>) {
  const { updateNodeData } = useReactFlow();
  const title = `node ${id}` 
  const icon = "https://alo-project-front.s3.us-east-1.amazonaws.com/init.png"
    
  const connections = useHandleConnections({
    type: 'target',
  });

  return (
    <div>
      <div>{title}</div>
        <Handle
          type="target"
          position={Position.Left}
          // isConnectable={connections.length === 0}
        />
      <div>
        <img src={icon} alt="" width={25} height={25} />
        <input
          onChange={(evt) => updateNodeData(id, { name: evt.target.value })}
          value={data.name}
          style={{ display: 'inline' }}
      />
      =
      <input
        onChange={(evt) => updateNodeData(id, { value: evt.target.value })}
        value={data.value}
        style={{ display: 'inline' }}
      />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
 
export default memo(VariableNode);