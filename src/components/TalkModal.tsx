import React, { useEffect, useState } from 'react';

type TalkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: { text?: string; voiceModel?: string };
  onSave: (data: { text: string; voiceModel: string }) => void;
};

const VOICE_MODELS = ['default'];

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

const TalkModal: React.FC<TalkModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [text, setText] = useState<string>(initial?.text ?? '');
  const [voiceModel, setVoiceModel] = useState<string>(initial?.voiceModel ?? 'default');

  useEffect(() => {
    if (!isOpen) return;
    setText(initial?.text ?? '');
    setVoiceModel(initial?.voiceModel ?? 'default');
  }, [isOpen, initial]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Talk Node</h3>

        <div style={{ marginBottom: 12 }}>
          <label>Text:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Write the text that will be spoken"
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Voice model:</label>
          <select value={voiceModel} onChange={(e) => setVoiceModel(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
            {VOICE_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={() => {
              onSave({ text, voiceModel });
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

export default TalkModal;
