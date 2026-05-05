import React from 'react';
import { BookOpen, Folder, Settings, User, Zap, Cpu, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ projectsCount = 0 }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

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
          <button className="sp-menu-button" onClick={() => navigate('/')}> 
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <Folder size={20} />
              </div>
              <span className="sp-menu-label">Проекты</span>
            </div>
            <span className="sp-menu-badge">{projectsCount}</span>
          </button>
          <button className="sp-menu-button" onClick={() => navigate('/editor')}>
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <PlusCircle size={20} />
              </div>
              <span className="sp-menu-label">Новый проект</span>
            </div>
          </button>
          <button className="sp-menu-button" onClick={() => navigate('/extensions')}>
            <div className="sp-menu-left">
              <div className="sp-menu-icon">
                <Settings size={20} />
              </div>
              <span className="sp-menu-label">Расширения</span>
            </div>
          </button>
        </div>
        <div className="sp-menu-section">
          <div className="sp-menu-section-title">Tools</div>
          <div className="sp-tools-grid">
            <button className="sp-tool-button" onClick={() => navigate('/extensions')}>
              <Settings size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">Расширения</span>
            </button>
            <button className="sp-tool-button">
              <User size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">Профиль</span>
            </button>
            <button className="sp-tool-button" onClick={handleLogout}>
              <LogOut size={18} className="sp-tool-icon" />
              <span className="sp-tool-label">Выйти</span>
            </button>
          </div>
        </div>
        {user && (
          <div className="sp-user-info">
            <p>Привет, {user.name || user.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;