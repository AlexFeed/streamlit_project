import React, { useState } from 'react';
import { X } from 'lucide-react';
import useTranslation from '../../shared/translation/useTranslation.js';

const ConfigModal = ({ extension, onClose, onSave }) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState(extension.config || {});

  const renderConfigFields = () => {
    if (extension.name === 'ECharts') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">{t('extensions.config.theme')}</label>
            <select
              value={config.theme || 'dark'}
              onChange={(e) => setConfig({...config, theme: e.target.value})}
              className="form-select"
            >
              <option value="dark">{t('extensions.config.dark')}</option>
              <option value="light">{t('extensions.config.light')}</option>
              <option value="vintage">{t('extensions.config.vintage')}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t('extensions.config.renderer')}</label>
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
              <span className="checkbox-text">{t('extensions.config.responsive')}</span>
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
              <span className="checkbox-text">{t('extensions.config.hideToolbar')}</span>
            </label>
          </div>
        </>
      );
    }

    if (extension.name === 'Leaflet') {
      return (
        <>
          <div className="form-group">
            <label className="form-label">{t('extensions.config.zoom')}</label>
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
        {t('extensions.config.none')}
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            {t('extensions.config.title', { name: extension.name })}
          </h3>
          <button onClick={onClose} className="modal-close" aria-label={t('common.close')}>
            <X />
          </button>
        </div>

        {renderConfigFields()}

        <div className="form-actions">
          <button
            onClick={onClose}
            className="btn-cancel"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onSave(config)}
            className="btn-submit"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;