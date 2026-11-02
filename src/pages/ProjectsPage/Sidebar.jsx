import React from 'react';
import { BookOpen, Folder, Settings, Zap, Cpu, LogOut, Puzzle } from 'lucide-react';
import ThemeToggle from '../../shared/ThemeToggle.jsx';
import StreamlitWordmark from '../../shared/StreamlitWordmark.jsx';
import useTranslation from '../../shared/i18n/useTranslation.js';

const Sidebar = ({
  projectsCount = 0,
  activeTab,
  onSelectTab,
  onLogout,
  onExtensionsClick,
  onSettingsClick,
}) => {
  const { t } = useTranslation();
  const handleTabKeyDown = (event) => {
    const tabs = ['documentation', 'projects'];
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    onSelectTab(nextTab);
    document.getElementById(
      nextTab === 'projects' ? 'projects-list-tab' : 'projects-documentation-tab'
    )?.focus();
  };

  return (
    <aside className="sp-projects-sidebar">
      <div className="sp-sidebar-logo">
        <div className="sp-logo-icon">
          <Zap size={32} style={{ color: 'white' }} />
        </div>
        <StreamlitWordmark />
        <div className="sp-badge">
          <Cpu size={12} className="sp-badge-text" style={{ color: '#f97316' }} />
          <span className="sp-badge-text">no-code builder</span>
        </div>
      </div>
      <div className="sp-sidebar-menu sp-custom-scrollbar">
        <div className="sp-menu-section">
          <div className="sp-menu-section-title">{t('projects.menu')}</div>
          <div className="sp-project-tabs" role="tablist" aria-label={t('projects.menu')}>
            <button
              id="projects-documentation-tab"
              type="button"
              role="tab"
              aria-controls="projects-tabpanel"
              aria-selected={activeTab === 'documentation'}
              tabIndex={activeTab === 'documentation' ? 0 : -1}
              className={`sp-menu-button${activeTab === 'documentation' ? ' sp-active' : ''}`}
              onClick={() => onSelectTab('documentation')}
              onKeyDown={handleTabKeyDown}
            >
              <div className="sp-menu-left">
                <div className="sp-menu-icon">
                  <BookOpen size={20} />
                </div>
                <span className="sp-menu-label">{t('projects.documentation')}</span>
              </div>
            </button>
            <button
              id="projects-list-tab"
              type="button"
              role="tab"
              aria-controls="projects-tabpanel"
              aria-selected={activeTab === 'projects'}
              tabIndex={activeTab === 'projects' ? 0 : -1}
              className={`sp-menu-button${activeTab === 'projects' ? ' sp-active' : ''}`}
              onClick={() => onSelectTab('projects')}
              onKeyDown={handleTabKeyDown}
            >
              <div className="sp-menu-left">
                <div className="sp-menu-icon">
                  <Folder size={20} />
                </div>
                <span className="sp-menu-label">{t('projects.title')}</span>
              </div>
              <span className="sp-menu-badge">{projectsCount}</span>
            </button>
          </div>
          {/* Extensions shortcut */}
          <button type="button" className="sp-menu-button" onClick={onExtensionsClick}>
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <Puzzle size={20} />
              </div>
              <span className="sp-menu-label">{t('projects.extensions')}</span>
            </div>
            <div className="sp-menu-dot" />
          </button>
        </div>
        <div className="sp-menu-section">
          <div className="sp-menu-section-title">{t('projects.tools')}</div>
          <div className="sp-tools-grid">
            <button className="sp-tool-button" onClick={onSettingsClick}>
              <Settings size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">{t('projects.settings')}</span>
            </button>
          </div>
        </div>
        <div className="sp-menu-section">
          <button onClick={onLogout} className="sp-logout-button">
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <LogOut size={20} />
              </div>
              <span className="sp-menu-label">{t('projects.logout')}</span>
            </div>
          </button>
        </div>
      </div>
      <div className="sp-sidebar-footer">
        <div className="sidebar-controls">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;