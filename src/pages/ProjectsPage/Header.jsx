import React from 'react';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, viewMode, setViewMode, onCreateProject }) => {
  return (
    <header className="sp-projects-header">
      <div className="sp-search-wrapper">
        <Search className="sp-search-icon" size={18} />
        <input
          type="text"
          placeholder="Поиск проектов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sp-search-input"
        />
      </div>
      <div className="sp-header-actions">
        <div className="sp-view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`sp-view-btn ${viewMode === 'grid' ? 'sp-active' : ''}`}
            title="Сетка"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`sp-view-btn ${viewMode === 'list' ? 'sp-active' : ''}`}
            title="Список"
          >
            <List size={18} />
          </button>
        </div>
        <button onClick={onCreateProject} className="sp-create-btn">
          <Plus size={18} />
          <span>Новый проект</span>
        </button>
      </div>
    </header>
  );
};

export default Header;