import React from 'react';
import { Power, PowerOff, Settings, Trash2 } from 'lucide-react';

const ExtensionCard = ({ extension, categories, onToggle, onDelete, onConfig }) => {
  const getCategoryColorClass = (category) => {
    switch(category) {
      case 'chart': return 'category-chart';
      case 'map': return 'category-map';
      default: return 'category-custom';
    }
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className={`extension-card ${extension.isActive ? 'active' : 'inactive'}`}>
      <div className="card-header">
        <div className="card-info">
          <div className="card-icon">{extension.icon}</div>
          <div className="card-title-wrapper">
            <h3 className="card-title">{extension.name}</h3>
            <span className={`card-category ${getCategoryColorClass(extension.category)}`}>
              {getCategoryName(extension.category)}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button
            onClick={() => onToggle(extension.id)}
            className={`action-button ${extension.isActive ? 'toggle-active' : 'toggle-inactive'}`}
          >
            {extension.isActive ? <Power size={16} /> : <PowerOff size={16} />}
          </button>
          <button
            onClick={() => onConfig(extension)}
            className="action-button config-button"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => onDelete(extension.id)}
            className="action-button delete-button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="card-description">{extension.description}</p>

      <div className="card-footer">
        <span className="version-text">v{extension.version}</span>
        <span className={`status-badge-card ${extension.isActive ? 'status-active' : 'status-inactive'}`}>
          {extension.isActive ? 'Активно' : 'Отключено'}
        </span>
      </div>
    </div>
  );
};

export default ExtensionCard;