import React, { useEffect, useState } from 'react';

type TranscribeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: { outputVariable?: string; maxTimeListening?: number };
  onSave: (data: { outputVariable: string; maxTimeListening: number }) => void;
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  padding: 16,
  borderRadius: 6,
  width: 480,
  maxWidth: '95vw',
};

const TranscribeModal: React.FC<TranscribeModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [outputVariable, setOutputVariable] = useState<string>(initial?.outputVariable ?? '');
  const [maxTimeListening, setMaxTimeListening] = useState<number>(initial?.maxTimeListening ?? 5);

  useEffect(() => {
    if (!isOpen) return;
    setOutputVariable(initial?.outputVariable ?? '');
    setMaxTimeListening(initial?.maxTimeListening ?? 5);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Transcribe Node</h3>

        <div style={{ marginBottom: 12 }}>
          <label>Output variable:</label>
          <input
            value={outputVariable}
            onChange={(e) => setOutputVariable(e.target.value)}
            placeholder="transcribe_text"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Max time listening (seconds):</label>
          <input
            type="number"
            min={1}
            value={maxTimeListening}
            onChange={(e) => setMaxTimeListening(Number(e.target.value || 0))}
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={() => {
              onSave({
                outputVariable,
                maxTimeListening: Number.isFinite(maxTimeListening) && maxTimeListening > 0 ? maxTimeListening : 0,
              });
              onClose();
            }}
          >
            Save
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TranscribeModal;
