import React, { memo, useState } from 'react';
import { Position, Handle, useReactFlow, type NodeProps, Node } from '@xyflow/react';
import CaseModal from '../components/CaseModal';

function CaseNode({ id, data }: NodeProps<Node<{ caseValues?: string[]; inputVar?: string }>>) {
  const { updateNodeData } = useReactFlow();
  const [open, setOpen] = useState(false);

  const handleSave = (d: any) => {
    updateNodeData(id, d);
  };

  const caseValues = data?.caseValues ?? [];
  const inputVar = data?.inputVar ?? '';

  return (
    <div style={{ padding: 8, minWidth: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontWeight: 'bold' }}>Case</div>
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>cases: {caseValues.length} · input: {inputVar || '-'}</div>
      <Handle type="target" position={Position.Left} />
      {/* Single central output handle for DEFAULT and case values */}
      <Handle id={`out-${id}`} type="source" position={Position.Right} style={{ top: 28 }} isConnectable />
      <div style={{ marginTop: 6 }}>
        <button onClick={() => setOpen(true)}>Edit Cases</button>
      </div>
      <CaseModal isOpen={open} onClose={() => setOpen(false)} initial={{ caseValues, inputVar }} onSave={handleSave} />
    </div>
  );
}

export default memo(CaseNode);
