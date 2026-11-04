import React from 'react';
import { Plus, Zap, FolderOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import ThemeToggle from '../../shared/theme/ThemeToggle.jsx';
import StreamlitWordmark from '../../shared/components/StreamlitWordmark.jsx';
import useTranslation from '../../shared/translation/useTranslation.js';

const Sidebar = ({ categories, selectedCategory, onSelectCategory, activeCount, totalCount, onAddClick, onProjectsClick }) => {
  const { t } = useTranslation();

  const getIconComponent = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={16} /> : null;
  };

  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <div className="sidebar-icon">
          <Zap size={32} />
        </div>
        <StreamlitWordmark />
        <div className="status-badge">
          <span className="status-text">{t('extensions.count', { active: activeCount, total: totalCount })}</span>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="categories-section">
          <h3 className="categories-title">{t('extensions.categories')}</h3>
          <div className="categories-list">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`category-button ${selectedCategory === cat.id ? 'active' : 'inactive'}`}
              >
                {getIconComponent(cat.icon)}
                <span>{t(`extensions.${cat.id === 'chart' ? 'charts' : cat.id === 'map' ? 'maps' : cat.id}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-secondary add-button" onClick={onAddClick}>
          <Plus size={18} />
          <span>{t('extensions.add')}</span>
        </button>

        <button className="logout-button" onClick={onProjectsClick}>
          <FolderOpen size={18} />
          <span>{t('extensions.toProjects')}</span>
        </button>
        <div className="sidebar-controls">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;