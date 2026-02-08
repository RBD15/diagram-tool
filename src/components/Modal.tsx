import React, { useState } from 'react';

type ModalSelectProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (selectedOption: string) => void;
  options: string[];
};

const ModalComponent: React.FC<ModalSelectProps> = ({ isOpen, onClose, onUpdate, options }) => {
  const [selectedOption, setSelectedOption] = useState<string>(options[0]._id || '');

  const handleUpdate = () => {
    onUpdate(selectedOption);
    onClose(); // Optional: close modal after update
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Selecciona una opción</h2>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          style={styles.select}
        >
          {options.map((option) => (
            <option key={option._id} value={option._id}>
              {option.name}
            </option>
          ))}
        </select>
        <div style={styles.buttons}>
          <button onClick={handleUpdate}>Actualizar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>

  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '300px',
  },
  select: {
    width: '100%',
    marginBottom: '15px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

export default ModalComponent;