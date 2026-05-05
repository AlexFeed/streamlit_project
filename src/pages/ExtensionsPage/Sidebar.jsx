import React from 'react';
import { Plus, Zap, LogOut } from 'lucide-react';
import * as Icons from 'lucide-react';

const Sidebar = ({ categories, selectedCategory, onSelectCategory, activeCount, totalCount, onAddClick, onLogout }) => {
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
        <h1 className="sidebar-title">
          Stream<span>lit</span>
        </h1>
        <div className="status-badge">
          <span className="status-text">{activeCount} / {totalCount} активны</span>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="categories-section">
          <h3 className="categories-title">Категории</h3>
          <div className="categories-list">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`category-button ${selectedCategory === cat.id ? 'active' : 'inactive'}`}
              >
                {getIconComponent(cat.icon)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="add-button" onClick={onAddClick}>
          <Plus size={18} />
          <span>Добавить расширение</span>
        </button>

        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;