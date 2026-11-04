import React, { useState } from 'react';
import { X } from 'lucide-react';
import useTranslation from '../../shared/translation/useTranslation.js';

const AddExtensionModal = ({ onClose, onAdd }) => {
  const { t } = useTranslation();
  const [newExtension, setNewExtension] = useState({
    name: '',
    description: '',
    version: '',
    category: 'chart',
    icon: '🔌'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newExtension.name.trim()) return;
    onAdd(newExtension);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">{t('extensions.addTitle')}</h3>
          <button onClick={onClose} className="modal-close" aria-label={t('common.close')}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('extensions.name')}</label>
            <input
              type="text"
              value={newExtension.name}
              onChange={(e) => setNewExtension({...newExtension, name: e.target.value})}
              placeholder="ECharts, Plotly, etc."
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('extensions.description')}</label>
            <textarea
              value={newExtension.description}
              onChange={(e) => setNewExtension({...newExtension, description: e.target.value})}
              placeholder={t('extensions.descriptionPlaceholder')}
              className="form-textarea"
            />
          </div>

          <div className="form-grid">
            <div>
              <label className="form-label">{t('extensions.version')}</label>
              <input
                type="text"
                value={newExtension.version}
                onChange={(e) => setNewExtension({...newExtension, version: e.target.value})}
                placeholder="1.0.0"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">{t('extensions.category')}</label>
              <select
                value={newExtension.category}
                onChange={(e) => setNewExtension({...newExtension, category: e.target.value})}
                className="form-select"
              >
                <option value="chart">{t('extensions.charts')}</option>
                <option value="map">{t('extensions.maps')}</option>
                <option value="custom">{t('extensions.custom')}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('extensions.icon')}</label>
            <input
              type="text"
              value={newExtension.icon}
              onChange={(e) => setNewExtension({...newExtension, icon: e.target.value})}
              placeholder="📊"
              maxLength={2}
              className="form-input form-icon-input"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="button-cancel">
              {t('extensions.cancel')}
            </button>
            <button
              type="submit"
              disabled={!newExtension.name.trim()}
              className="btn btn-primary button-submit"
            >
              {t('extensions.addAction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExtensionModal;