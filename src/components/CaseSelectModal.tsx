import React, { useState, useEffect } from 'react';

type Props = {
  isOpen: boolean;
  options: string[];
  onClose: () => void;
  onSelect: (index: number) => void;
};

const CaseSelectModal: React.FC<Props> = ({ isOpen, options, onClose, onSelect }) => {
  const [selected, setSelected] = useState<number>(0);

  useEffect(() => {
    if (isOpen) setSelected(0);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Seleccione la salida</h3>
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {options.map((opt, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <label style={{ cursor: 'pointer' }}>
                <input type="radio" name="case-select" checked={selected === i} onChange={() => setSelected(i)} /> {opt}
              </label>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={() => { onSelect(selected); onClose(); }}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

const overlay: React.CSSProperties = { position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' };
const modal: React.CSSProperties = { background:'#fff', padding:16, borderRadius:6, width:360 };

export default CaseSelectModal;
