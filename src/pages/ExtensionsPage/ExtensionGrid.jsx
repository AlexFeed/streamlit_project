import React from 'react';
import ExtensionCard from './ExtensionCard';
import useTranslation from '../../shared/translation/useTranslation.js';

const ExtensionGrid = ({ extensions, categories, onToggle, onDelete, onConfig, onAddClick }) => {
  const { t } = useTranslation();

  if (extensions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔌</div>
        <h3 className="empty-title">{t('extensions.none')}</h3>
        <p className="empty-description">{t('extensions.empty')}</p>
        <button className="btn btn-secondary empty-button" onClick={onAddClick}>
          {t('extensions.add')}
        </button>
      </div>
    );
  }

  return (
    <div className="extensions-grid">
      {extensions.map((extension) => (
        <ExtensionCard
          key={extension.id}
          extension={extension}
          categories={categories}
          onToggle={onToggle}
          onDelete={onDelete}
          onConfig={onConfig}
        />
      ))}
    </div>
  );
};

export default ExtensionGrid;