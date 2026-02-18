import React, { memo, useState } from 'react';
import { Position, Handle, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import TalkModal from '../components/TalkModal';

type TalkNodeData = {
  text?: string;
  voiceModel?: string;
};

function TalkNode({ id, data }: NodeProps<Node<TalkNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [open, setOpen] = useState(false);

  const handleSave = (newData: TalkNodeData) => {
    updateNodeData(id, {
      text: newData.text ?? '',
      voiceModel: newData.voiceModel ?? 'default',
    });
  };

  return (
    <div style={{ padding: 8, minWidth: 210 }}>
      <div style={{ fontWeight: 'bold' }}>Talk</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>
        text: {data?.text && data.text.trim().length > 0 ? data.text.slice(0, 24) : '-'}
      </div>
      <div style={{ fontSize: 12 }}>voice: {data?.voiceModel ?? 'default'}</div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div style={{ marginTop: 6 }}>
        <button onClick={() => setOpen(true)}>Edit Talk</button>
      </div>

      <TalkModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initial={{ text: data?.text, voiceModel: data?.voiceModel ?? 'default' }}
        onSave={handleSave}
      />
    </div>
  );
}

export default memo(TalkNode);
