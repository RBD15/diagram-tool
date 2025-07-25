import { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import {
  Position,
  Handle,
  useReactFlow,
  useHandleConnections,
  useNodesData,
  Node,
  type NodeProps,
} from '@xyflow/react';


function EndNode({ id, lastSteps }: NodeProps<Node<{lastSteps: any}>>) {
  const { updateNodeData } = useReactFlow();
  
  // useEffect(() => {
  //   updateNodeData(id, { setting });
  // }, [variableNode]);

  return (
    <div>
      <FontAwesomeIcon icon={faCircle} />
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