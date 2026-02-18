import React, { memo, useMemo, useState } from 'react';
import { Position, Handle, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import MenuModal from '../components/MenuModal';

type MenuNodeData = {
  audioFile?: string;
  maxRetries?: number;
};

function MenuNode({ id, data }: NodeProps<Node<MenuNodeData>>) {
  const { updateNodeData } = useReactFlow();
  const [open, setOpen] = useState(false);

  const audioName = useMemo(() => {
    if (!data?.audioFile) return 'No audio selected';
    const parts = data.audioFile.split('/');
    return parts[parts.length - 1] || data.audioFile;
  }, [data?.audioFile]);

  const handleSave = (newData: MenuNodeData) => {
    updateNodeData(id, {
      ...newData,
      maxRetries: typeof newData.maxRetries === 'number' ? newData.maxRetries : 3,
    });
  };

  return (
    <div style={{ padding: 8, minWidth: 190 }}>
      <div style={{ fontWeight: 'bold' }}>Menu</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>audio: {audioName}</div>
      <div style={{ fontSize: 12 }}>maxRetries: {data?.maxRetries ?? 3}</div>

      <Handle type="target" position={Position.Left} />
      <Handle id={`out-${id}`} type="source" position={Position.Right} style={{ top: 28 }} isConnectable />

      <div style={{ marginTop: 6 }}>
        <button onClick={() => setOpen(true)}>Edit Menu</button>
      </div>

      <MenuModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initial={{ audioFile: data?.audioFile, maxRetries: data?.maxRetries ?? 3 }}
        onSave={handleSave}
      />
    </div>
  );
}

export default memo(MenuNode);
