import { memo, useState } from 'react';
import { Position, Handle, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import TranscribeModal from '../components/TranscribeModal';

type TranscribeNodeData = {
  outputVariable?: string;
  maxTimeListening?: number;
};

function TranscribeNode({ id, data }: NodeProps<Node<TranscribeNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [open, setOpen] = useState(false);

  const handleSave = (newData: TranscribeNodeData) => {
    updateNodeData(id, {
      ...newData,
      maxTimeListening:
        typeof newData.maxTimeListening === 'number' && newData.maxTimeListening > 0
          ? newData.maxTimeListening
          : 0,
    });
  };

  return (
    <div style={{ padding: 8, minWidth: 210 }}>
      <div style={{ fontWeight: 'bold' }}>Transcribe</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>output: {data?.outputVariable || '-'}</div>
      <div style={{ fontSize: 12 }}>max listening: {data?.maxTimeListening ?? 0}s</div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div style={{ marginTop: 6 }}>
        <button onClick={() => setOpen(true)}>Edit Transcribe</button>
      </div>

      <TranscribeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initial={{
          outputVariable: data?.outputVariable,
          maxTimeListening: data?.maxTimeListening ?? 5,
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export default memo(TranscribeNode);
