import React from 'react';

const ExtensionHeader = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="extensions-header">
      <div className="header-container">
        <div className="search-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск расширений..."
            className="search-input"
          />
        </div>
        
        <div className="title-wrapper">
          <div className="title-badge">
            <div>
              <h2 className="page-title">Управление расширениями</h2>
              <p className="page-subtitle">Подключите дополнительные библиотеки для визуального конструктора</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionHeader;