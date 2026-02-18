import React from 'react';
import { useDnD } from './DnDContext';

const NODE_OPTIONS = [
  { type: 'init', label: 'Init Node', flowType: 'all', className: 'input' },
  { type: 'variable', label: 'Variable Node', flowType: 'all', className: '' },
  { type: 'print', label: 'Print Node', flowType: 'chat', className: 'output' },
  { type: 'condition', label: 'Condition Node', flowType: 'all', className: 'output' },
  { type: 'queue', label: 'Queue Node', flowType: 'all', className: 'output' },
  { type: 'api', label: 'API Node', flowType: 'all', className: 'output' },
  { type: 'case', label: 'Case Node', flowType: 'all', className: 'output' },
  { type: 'menu', label: 'Menu Node', flowType: 'voice', className: 'output' },
  { type: 'transcribe', label: 'Transcribe Node', flowType: 'voice', className: 'output' },
  { type: 'talk', label: 'Talk Node', flowType: 'voice', className: 'output' },
  { type: 'end', label: 'End Node', flowType: 'all', className: 'end' },
];

const isNodeAllowedForFlow = (nodeFlowType, activeFlowType) => {
  if (!activeFlowType) return true;
  return nodeFlowType === 'all' || nodeFlowType === activeFlowType;
};

export default ({ activeFlowType }) => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    console.log("Drag Start",event);
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const visibleNodes = NODE_OPTIONS.filter((node) =>
    isNodeAllowedForFlow(node.flowType, activeFlowType),
  );

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      {activeFlowType && (
        <div className="description" style={{ fontWeight: 'bold' }}>
          Active flow type: {activeFlowType.toUpperCase()}
        </div>
      )}
      {visibleNodes.map((node) => {
        const className = node.className ? `dndnode ${node.className}` : 'dndnode';
        return (
          <div
            key={node.type}
            className={className}
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            {node.label}
          </div>
        );
      })}
    </aside>
  );
};
