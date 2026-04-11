import React from 'react';
import { Zap } from 'lucide-react';

const Sidebar = ({ isLogin }) => {
  return (
    <aside className="sidebar">
      {/* Фоновая надпись "STREAMLIT" */}
      <div className="background-text">
        <span>STREAMLIT</span>
      </div>

      {/* Верхняя часть: Логотип */}
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

      {/* Центральная часть */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h2 className="welcome-title">
            {isLogin ? 'Добро пожаловать' : 'Создайте аккаунт'}
          </h2>
          <p className="welcome-subtitle">
            {isLogin ? 'Войдите в свой аккаунт для продолжения' : 'Начните создавать no-code приложения'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;