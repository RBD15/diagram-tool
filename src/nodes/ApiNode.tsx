import React, { memo, useState } from 'react';
import { Position, Handle, useReactFlow, type NodeProps, Node } from '@xyflow/react';
import ApiModal from '../components/ApiModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';

function ApiNode({ id, data }: NodeProps<Node<{ method?: string; url?: string; headers?: string; body?: string; responseVar?: string }>>) {
  const { updateNodeData } = useReactFlow();
  const [open, setOpen] = useState(false);

  const handleSave = (d: any) => {
    updateNodeData(id, d);
  };

  return (
    <div style={{ padding: 8, minWidth: 160 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FontAwesomeIcon icon={faNetworkWired} />
        <div style={{ fontWeight: 'bold' }}>API</div>
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>{data?.method ?? 'GET'} {data?.url ?? ''}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div style={{ marginTop: 6 }}>
        <button onClick={() => setOpen(true)}>Edit</button>
      </div>
      <ApiModal isOpen={open} onClose={() => setOpen(false)} initial={data} onSave={handleSave} />
    </div>
  );
}

export default memo(ApiNode);
