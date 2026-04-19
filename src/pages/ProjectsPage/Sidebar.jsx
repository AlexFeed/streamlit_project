import React from 'react';
import { BookOpen, Folder, Settings, User, Zap, Cpu } from 'lucide-react';

const Sidebar = ({ projectsCount = 0 }) => {
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
          <div className="sp-menu-section-title">Core</div>
          <button className="sp-menu-button">
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <BookOpen size={20} />
              </div>
              <span className="sp-menu-label">Документация</span>
            </div>
            <div className="sp-menu-dot" />
          </button>
          <button className="sp-menu-button">
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <Folder size={20} />
              </div>
              <span className="sp-menu-label">Проекты</span>
            </div>
            <span className="sp-menu-badge">{projectsCount}</span>
          </button>
        </div>
        <div className="sp-menu-section">
          <div className="sp-menu-section-title">Tools</div>
          <div className="sp-tools-grid">
            <button className="sp-tool-button">
              <Settings size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">Настройки</span>
            </button>
            <button className="sp-tool-button">
              <User size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">Профиль</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;