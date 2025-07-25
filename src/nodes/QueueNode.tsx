import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { memo } from 'react';

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
 
function QueueNode({ id, setting }: NodeProps<Node<{setting: any}>>) {
  const { updateNodeData } = useReactFlow();
  
  // useEffect(() => {
  //   updateNodeData(id, { setting });
  // }, [variableNode]);
  return (
    <div>
      <FontAwesomeIcon icon={faUserSecret} />
      <Handle type="target" position={Position.Left}/>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
 
export default memo(QueueNode);