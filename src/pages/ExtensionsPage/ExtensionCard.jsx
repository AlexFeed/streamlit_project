import React from 'react';
import { Power, PowerOff, Settings, Trash2 } from 'lucide-react';
import useTranslation from '../../shared/i18n/useTranslation.js';

const ExtensionCard = ({ extension, onToggle, onDelete, onConfig }) => {
  const { t } = useTranslation();
  const getCategoryColorClass = (category) => {
    switch(category) {
      case 'chart': return 'category-chart';
      case 'map': return 'category-map';
      default: return 'category-custom';
    }
  };

  return (
    <div className={`extension-card ${extension.isActive ? 'active' : 'inactive'}`}>
      <div className="card-header">
        <div className="card-info">
          <div className="card-icon">{extension.icon}</div>
          <div className="card-title-wrapper">
            <h3 className="card-title">{extension.name}</h3>
            <span className={`card-category ${getCategoryColorClass(extension.category)}`}>
              {t(`extensions.${extension.category === 'chart' ? 'charts' : extension.category === 'map' ? 'maps' : extension.category}`)}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button
            onClick={() => onToggle(extension.id)}
            className={`action-button ${extension.isActive ? 'toggle-active' : 'toggle-inactive'}`}
            aria-label={t(extension.isActive ? 'extensions.inactive' : 'extensions.active')}
            title={t(extension.isActive ? 'extensions.inactive' : 'extensions.active')}
          >
            {extension.isActive ? <Power size={16} /> : <PowerOff size={16} />}
          </button>
          <button
            onClick={() => onConfig(extension)}
            className="action-button config-button"
            aria-label={t('extensions.config.title', { name: extension.name })}
            title={t('extensions.config.title', { name: extension.name })}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => onDelete(extension.id)}
            className="action-button delete-button"
            aria-label={t('common.delete')}
            title={t('common.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="card-description">
        {extension.descriptionKey ? t(extension.descriptionKey) : extension.description}
      </p>

      <div className="card-footer">
        <span className="version-text">v{extension.version}</span>
        <span className={`status-badge-card ${extension.isActive ? 'status-active' : 'status-inactive'}`}>
          {t(extension.isActive ? 'extensions.active' : 'extensions.inactive')}
        </span>
      </div>
    </div>
  );
};

export default ExtensionCard;