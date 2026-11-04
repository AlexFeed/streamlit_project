import React from 'react';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import useTranslation from '../../shared/translation/useTranslation.js';

const Header = ({ searchQuery, setSearchQuery, viewMode, setViewMode, onCreateProject }) => {
  const { t } = useTranslation();

  return (
    <header className="sp-projects-header">
      <div className="sp-header-container">
        <div className="sp-search-wrapper">
          <Search className="sp-search-icon" size={18} />
          <input
            type="text"
            placeholder={t('projects.search')}
            aria-label={t('projects.search')}
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
              title={t('projects.grid')}
              aria-label={t('projects.grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`sp-view-btn ${viewMode === 'list' ? 'sp-active' : ''}`}
              title={t('projects.list')}
              aria-label={t('projects.list')}
            >
              <List size={18} />
            </button>
          </div>
          <button onClick={onCreateProject} className="btn btn-primary sp-create-btn">
            <Plus size={18} />
            <span>{t('projects.new')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;