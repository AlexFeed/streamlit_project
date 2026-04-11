import React, { useState } from 'react';
import { X } from 'lucide-react';

const ConfigModal = ({ extension, onClose, onSave }) => {
  const [config, setConfig] = useState(extension.config || {});

  const renderConfigFields = () => {
    if (extension.name === 'ECharts') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">Тема</label>
            <select
              value={config.theme || 'dark'}
              onChange={(e) => setConfig({...config, theme: e.target.value})}
              className="form-select"
            >
              <option value="dark">Темная</option>
              <option value="light">Светлая</option>
              <option value="vintage">Винтаж</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Рендерер</label>
            <select
              value={config.renderer || 'canvas'}
              onChange={(e) => setConfig({...config, renderer: e.target.value})}
              className="form-select"
            >
              <option value="canvas">Canvas</option>
              <option value="svg">SVG</option>
            </select>
          </div>
        </>
      );
    }

    if (extension.name === 'Plotly') {
      return (
        <>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.responsive || false}
                onChange={(e) => setConfig({...config, responsive: e.target.checked})}
                className="checkbox-input"
              />
              <span className="checkbox-text">Адаптивный размер</span>
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.displayModeBar === false}
                onChange={(e) => setConfig({...config, displayModeBar: !e.target.checked})}
                className="checkbox-input"
              />
              <span className="checkbox-text">Скрыть панель управления</span>
            </label>
          </div>
        </>
      );
    }

    if (extension.name === 'Leaflet') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">Начальный зум</label>
            <input
              type="number"
              value={config.zoom || 10}
              onChange={(e) => setConfig({...config, zoom: parseInt(e.target.value)})}
              className="form-input"
              min={1}
              max={18}
            />
          </div>
        </>
      );
    }

    return (
      <div className="config-placeholder">
        Нет доступных настроек для этого расширения
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            Настройки: {extension.name}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X />
          </button>
        </div>

        {renderConfigFields()}

        <div className="form-actions">
          <button
            onClick={onClose}
            className="btn-cancel"
          >
            Отмена
          </button>
          <button
            onClick={() => onSave(config)}
            className="btn-submit"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;