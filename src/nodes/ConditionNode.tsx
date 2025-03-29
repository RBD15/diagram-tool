import { memo } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  type NodeProps,
  type Node,
} from '@xyflow/react';

function ConditionNode({ id, data }: NodeProps<Node<{ name:string, condition:string, value: string, thenConnection: boolean, elseConnection: boolean }>>) {
  const { updateNodeData } = useReactFlow();
  const title = `node ${id}` 
  const icon = "https://alo-project-front.s3.us-east-1.amazonaws.com/init.png"
    
  const connections = useHandleConnections({
    type: 'target',
  });

  return (
    <div>
      <div>{title}</div>
      <div>Condition</div>
        <Handle
          type="target"
          position={Position.Left}
        />
      <div>
        <img src={icon} alt="" width={25} height={25} />
        <input
          onChange={(evt) => updateNodeData(id, { name: evt.target.value })}
          value={data.name}
          style={{ display: 'inline' }}
      />
        <select id="conditions" name="conditions" value={data.condition} onChange={(evt) => updateNodeData(id, { condition: evt.target.value }) }>
            <option defaultValue=">">&gt; </option>
            <option value="<">&lt; </option>
            <option value=">=">&gt;=</option>
            <option value="<=">&lt;= </option>
            <option value="==">== </option>
            <option value="!=">!= </option>
        </select>
      <input
        onChange={(evt) => updateNodeData(id, { value: evt.target.value })}
        value={data.value}
        style={{ display: 'inline' }}
      />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={connections.length<3} />
    </div>
  );
}
 
export default memo(ConditionNode);