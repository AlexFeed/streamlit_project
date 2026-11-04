import React from 'react';
import { FolderOpen } from 'lucide-react';
import useTranslation from '../../shared/translation/useTranslation.js';

const EmptyState = ({ onCreateProject }) => {
  const { t } = useTranslation();

  return (
  <div className="sp-empty-state sp-animate-fade-in">
    {/* Background wordmark */}
    <div className="sp-empty-bg-text">
      STREAMLIT
    </div>
    <div className="sp-empty-icon-wrapper">
      <FolderOpen size={40} className="sp-empty-icon" />
    </div>
    <h2 className="sp-empty-title">{t('projects.empty.title')}</h2>
    <p className="sp-empty-text">
      {t('projects.empty.description')}
    </p>
    <button type="button" className="btn btn-primary" onClick={onCreateProject}>
      {t('projects.empty.create')}
    </button>
  </div>
  );
};

export default EmptyState;