import React, { useState, useEffect } from 'react';

type CaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: { caseValues?: string[]; inputVar?: string };
  onSave: (data: { caseValues: string[]; inputVar?: string }) => void;
};

const CaseModal: React.FC<CaseModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [values, setValues] = useState<string[]>(initial?.caseValues ?? ['']);
  const [inputVar, setInputVar] = useState<string>(initial?.inputVar ?? '');

  useEffect(() => {
    if (isOpen) {
      setValues(initial?.caseValues ?? ['']);
      setInputVar(initial?.inputVar ?? '');
    }
    // Intentionally only run when modal opens/closes to avoid resetting while user types.
    // Do NOT add `initial` to deps (it may be a newly created object on each parent render).
  }, [isOpen]);

  if (!isOpen) return null;

  const updateValue = (idx: number, v: string) => {
    const copy = [...values];
    copy[idx] = v;
    setValues(copy);
  };

  const addValue = () => setValues((s) => [...s, '']);
  const removeValue = (idx: number) => setValues((s) => s.filter((_, i) => i !== idx));

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Case Node</h3>
        {values.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input value={v} onChange={(e) => updateValue(i, e.target.value)} style={{ flex: 1 }} />
            <button onClick={() => removeValue(i)}>Remove</button>
          </div>
        ))}
        <div style={{ marginTop: 8 }}>
          <button onClick={addValue}>Add Case</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Input variable (to compare):</label>
          <input value={inputVar} onChange={(e) => setInputVar(e.target.value)} style={{ width: '100%' }} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => { onSave({ caseValues: values.filter((v) => v && v.trim()), inputVar: inputVar }); onClose(); }}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle: React.CSSProperties = { background: '#fff', padding: 16, borderRadius: 6, width: 480 };

export default CaseModal;
