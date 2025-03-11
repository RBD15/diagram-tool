import { memo, useState } from 'react';
import {
  Handle,
  Position,
  useHandleConnections,
  useNodesData,
} from '@xyflow/react';

import { isVariableNode, type MyNode } from './initialElements';
 
function ResultNode({id: string}) {

  const connections = useHandleConnections({
    type: 'target',
  });

  const nodesData = useNodesData<MyNode>(
    connections.map((connection) => connection.source),
  );
  
  const variableNodes = nodesData.filter(isVariableNode);

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      {/* <input
          onChange={(evt) => updateNodeData(id, { input: evt.target.value })}
          value={data.text} 
          style={{ display: 'inline' }}
      /> */}
      <div>
        incoming texts:{' '}
        {variableNodes.map(({ data }, i) => <div key={i}>{data.value}</div>) ||
          'none'}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
 
export default memo(ResultNode);