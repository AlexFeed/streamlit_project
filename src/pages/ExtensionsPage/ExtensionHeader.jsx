import React from 'react';
import useTranslation from '../../shared/i18n/useTranslation.js';

const ExtensionHeader = ({ searchQuery, onSearchChange }) => {
  const { t } = useTranslation();

  return (
    <div className="extensions-header">
      <div className="header-container">
        <div className="search-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('extensions.search')}
            aria-label={t('extensions.search')}
            className="search-input"
          />
        </div>
        
        <div className="title-wrapper">
          <div className="title-badge">
            <div>
              <h2 className="page-title">{t('extensions.manage')}</h2>
              <p className="page-subtitle">{t('extensions.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionHeader;