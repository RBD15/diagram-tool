import React from 'react';
import { useDnD } from './DnDContext';

export default () => {
  const [_, setType] = useDnD();

  const onDragStart = (event, nodeType) => {
    console.log("Drag Start",event);
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'init')} draggable>
        Init Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'variable')} draggable>
        Variable Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'result')} draggable>
        Print Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'condition')} draggable>
        Condition Node
      </div>
      <div className="dndnode end" onDragStart={(event) => onDragStart(event, 'end')} draggable>
        End Node
      </div>
    </aside>
  );
};
