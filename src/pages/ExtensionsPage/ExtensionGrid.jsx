import React from 'react';
import ExtensionCard from './ExtensionCard';

const ExtensionGrid = ({ extensions, categories, onToggle, onDelete, onConfig, onAddClick }) => {
  if (extensions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔌</div>
        <h3 className="empty-title">Нет расширений</h3>
        <p className="empty-description">Добавьте первое расширение для вашего проекта</p>
        <button className="empty-button" onClick={onAddClick}>
          Добавить расширение
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