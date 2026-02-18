import React, { useEffect, useMemo, useState } from 'react';

type MenuAudioOption = {
  fileName: string;
  path: string;
  url: string;
};

type MenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: { audioFile?: string; maxRetries?: number };
  onSave: (data: { audioFile: string; maxRetries: number }) => void;
};

const audioModules = import.meta.glob('../audios/*.{gsm,wav}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const AUDIO_OPTIONS: MenuAudioOption[] = Object.entries(audioModules)
  .map(([modulePath, url]) => {
    const fileName = modulePath.split('/').pop() ?? modulePath;
    return {
      fileName,
      path: `src/audios/${fileName}`,
      url,
    };
  })
  .sort((a, b) => a.fileName.localeCompare(b.fileName));

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
  width: 500,
  maxWidth: '95vw',
};

const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [audioFile, setAudioFile] = useState<string>(initial?.audioFile ?? '');
  const [maxRetries, setMaxRetries] = useState<number>(initial?.maxRetries ?? 3);

  useEffect(() => {
    if (!isOpen) return;
    setAudioFile(initial?.audioFile ?? '');
    setMaxRetries(initial?.maxRetries ?? 3);
  }, [isOpen]);

  const selectedAudioSrc = useMemo(() => {
    if (!audioFile) return '';
    const match = AUDIO_OPTIONS.find((audio) => audio.path === audioFile);
    return match?.url ?? audioFile;
  }, [audioFile]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>Menu Node</h3>

        <div style={{ marginBottom: 12 }}>
          <label>Audio:</label>
          <select
            value={audioFile}
            onChange={(e) => setAudioFile(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
          >
            <option value="">-- Select audio --</option>
            {AUDIO_OPTIONS.map((audio) => (
              <option key={audio.path} value={audio.path}>
                {audio.fileName}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, marginTop: 4, color: '#6b7280' }}>
            Audios loaded from src/audios ({AUDIO_OPTIONS.length} found)
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Max retries:</label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxRetries}
            onChange={(e) => setMaxRetries(Number(e.target.value || 3))}
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Audio preview:</label>
          <div style={{ marginTop: 6 }}>
            <audio controls src={selectedAudioSrc} style={{ width: '100%' }}>
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={() => {
              onSave({
                audioFile,
                maxRetries: Number.isFinite(maxRetries) && maxRetries > 0 ? maxRetries : 3,
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

export default MenuModal;
