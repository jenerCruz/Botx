import React, { useState, useEffect } from 'react';

const ConfigPanel = () => {
  const [config, setConfig] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash',
    sessionName: 'bot_session',
    autoRead: true,
    presence: 'available'
  });

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const save = () => {
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).then(() => alert('Config saved!'));
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '0 auto' }}>
      <h2>Botx Configuration</h2>
      
      <div style={{ marginBottom: 15 }}>
        <label>Gemini API Key:</label>
        <input
          type="text"
          name="geminiApiKey"
          value={config.geminiApiKey}
          onChange={handleChange}
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Gemini Model:</label>
        <select
          name="geminiModel"
          value={config.geminiModel}
          onChange={handleChange}
          style={{ width: '100%', padding: 8 }}
        >
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
        </select>
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Session Name:</label>
        <input
          type="text"
          name="sessionName"
          value={config.sessionName}
          onChange={handleChange}
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Auto Read:</label>
        <input
          type="checkbox"
          name="autoRead"
          checked={config.autoRead}
          onChange={handleChange}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <label>Presence:</label>
        <select
          name="presence"
          value={config.presence}
          onChange={handleChange}
          style={{ width: '100%', padding: 8 }}
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="composing">Composing</option>
        </select>
      </div>

      <button onClick={save} style={{ padding: 10, width: '100%' }}>
        Save Configuration
      </button>
    </div>
  );
};

export default ConfigPanel;