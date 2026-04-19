import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({ onCreateProject }) => (
  <div className="sp-empty-state sp-animate-fade-in">
    {/* Фоновая надпись STREAMLIT */}
    <div className="sp-empty-bg-text">
      STREAMLIT
    </div>
    <div className="sp-empty-icon-wrapper">
      <FolderOpen size={40} className="sp-empty-icon" />
    </div>
    <h2 className="sp-empty-title">У вас пока нет проектов</h2>
    <p className="sp-empty-text">
      Создайте своё первое no-code приложение на базе Streamlit за пару минут.
    </p>
  </div>
);

export default EmptyState;