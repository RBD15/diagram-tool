import { memo } from 'react';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  type NodeProps,
  type Node,
} from '@xyflow/react';

// type conditionConnections = {

//   connections: 2
//   currentConnection: 0
//   newConnetion: () => {
//     if(this.currentConnection < 2){
//       this.currentConnection++
//     }
//   }
// }
 
function ConditionNode({ id, data }: NodeProps<Node<{ name:string, condition:string, value: string, connectionsNumber: number }>>) {
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
        <select id="conditions" name="conditions" value={data.condition} onChange={(evt) => updateNodeData(id, { condition: evt.target.value })}>
            <option value="greater_than">&gt; </option>
            <option value="less_than">&lt; </option>
            <option value="greater_equal">&gt;=</option>
            <option value="less_equal">&lt;= </option>
            <option value="equal">== </option>
            <option value="not_equal">!= </option>
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