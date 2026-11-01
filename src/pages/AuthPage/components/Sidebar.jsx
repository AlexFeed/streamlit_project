import React from 'react';
import { Zap } from 'lucide-react';
import ThemeToggle from '../../../shared/ThemeToggle.jsx';
import LanguageToggle from '../../../shared/LanguageToggle.jsx';
import useTranslation from '../../../shared/i18n/useTranslation.js';

const Sidebar = ({ isLogin }) => {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="logo-section">
        <div className="logo-icon">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="logo-text">
          Stream<span>Lit</span>
        </h1>
        <div className="badge">
          <span className="badge-text">no-code builder</span>
        </div>
      </div>

      {/* Welcome copy */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h2 className="welcome-title">
            {t(isLogin ? 'auth.welcome' : 'auth.createAccount')}
          </h2>
          <p className="welcome-subtitle">
            {t(isLogin ? 'auth.welcomeSubtitle' : 'auth.createSubtitle')}
          </p>
        </div>
      </div>
      <div className="auth-sidebar-footer">
        <div className="sidebar-controls">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;