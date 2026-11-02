import React from 'react';
import { BookOpen, Folder, Settings, User, Zap, Cpu, LogOut, Puzzle } from 'lucide-react';
import ThemeToggle from '../../shared/ThemeToggle.jsx';
import LanguageToggle from '../../shared/LanguageToggle.jsx';
import useTranslation from '../../shared/i18n/useTranslation.js';

const Sidebar = ({ projectsCount = 0, onLogout, onExtensionsClick }) => {
  const { t } = useTranslation();

  return (
    <aside className="sp-projects-sidebar">
      <div className="sp-sidebar-logo">
        <div className="sp-logo-icon">
          <Zap size={32} style={{ color: 'white' }} />
        </div>
        <h1 className="sp-logo-title">
          Stream<span>Lit</span>
        </h1>
        <div className="sp-badge">
          <Cpu size={12} className="sp-badge-text" style={{ color: '#f97316' }} />
          <span className="sp-badge-text">no-code builder</span>
        </div>
      </div>
      <div className="sp-sidebar-menu sp-custom-scrollbar">
        <div className="sp-menu-section">
          <div className="sp-menu-section-title">{t('projects.menu')}</div>
          <button className="sp-menu-button">
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <BookOpen size={20} />
              </div>
              <span className="sp-menu-label">{t('projects.documentation')}</span>
            </div>
            <div className="sp-menu-dot" />
          </button>
          <button className="sp-menu-button">
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <Folder size={20} />
              </div>
              <span className="sp-menu-label">{t('projects.title')}</span>
            </div>
            <span className="sp-menu-badge">{projectsCount}</span>
          </button>
          {/* Extensions shortcut */}
          <button className="sp-menu-button" onClick={onExtensionsClick}>
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
            <button className="sp-tool-button">
              <Settings size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">{t('projects.settings')}</span>
            </button>
            <button className="sp-tool-button">
              <User size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">{t('projects.profile')}</span>
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
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;