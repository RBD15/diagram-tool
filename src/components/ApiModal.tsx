import React, { useState, useEffect } from 'react';

type ApiModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial?: {
    method?: string;
    url?: string;
    headers?: string;
    body?: string;
    responseVar?: string;
  };
  onSave: (data: { method: string; url: string; headers?: string; body?: string; responseVar?: string }) => void;
};

const ApiModal: React.FC<ApiModalProps> = ({ isOpen, onClose, initial, onSave }) => {
  const [method, setMethod] = useState(initial?.method ?? 'GET');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [headers, setHeaders] = useState(initial?.headers ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [responseVar, setResponseVar] = useState(initial?.responseVar ?? 'api_response_code');

  useEffect(() => {
    if (isOpen) {
      setMethod(initial?.method ?? 'GET');
      setUrl(initial?.url ?? '');
      setHeaders(initial?.headers ?? '');
      setBody(initial?.body ?? '');
      setResponseVar(initial?.responseVar ?? 'api_response_code');
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>API Node</h3>
        <div>
          <label>Method:</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>UPDATE</option>
            <option>DELETE</option>
          </select>
        </div>
        <div>
          <label>URL:</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div>
          <label>Headers (raw):</label>
          <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={3} />
        </div>
        <div>
          <label>Body:</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
        </div>
        <div>
          <label>Response variable name:</label>
          <input value={responseVar} onChange={(e) => setResponseVar(e.target.value)} />
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => { onSave({ method, url, headers, body, responseVar }); onClose(); }}>Save</button>
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

export default ApiModal;
