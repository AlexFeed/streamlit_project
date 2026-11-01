import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import Sidebar from './Sidebar';
import ExtensionHeader from './ExtensionHeader';
import ExtensionGrid from './ExtensionGrid';
import AddExtensionModal from './AddExtensionModal';
import ConfigModal from './ConfigModal';
import './ExtensionsPage.css';
import useTranslation from '../../shared/i18n/useTranslation.js';

const ExtensionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleProjectsNavigation = () => navigate('/', { replace: true });
  const [extensions, setExtensions] = useState([
    {
      id: 1,
      name: 'ECharts',
      descriptionKey: 'extension.echarts.description',
      version: '5.5.0',
      icon: '📊',
      category: 'chart',
      isActive: true,
      config: {
        theme: 'dark',
        renderer: 'canvas',
        locale: 'ru'
      }
    },
    {
      id: 2,
      name: 'Plotly',
      descriptionKey: 'extension.plotly.description',
      version: '2.27.0',
      icon: '📈',
      category: 'chart',
      isActive: false,
      config: {
        responsive: true,
        displayModeBar: false
      }
    },
    {
      id: 3,
      name: 'Leaflet',
      descriptionKey: 'extension.leaflet.description',
      version: '1.9.4',
      icon: '🗺️',
      category: 'map',
      isActive: true,
      config: {
        zoom: 10,
        center: [55.751244, 37.618423]
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: 'Activity' },
    { id: 'chart', name: 'Charts', icon: 'BarChart3' },
    { id: 'map', name: 'Maps', icon: 'Map' },
    { id: 'custom', name: 'Custom', icon: 'Settings' }
  ];

  const filteredExtensions = useMemo(() => {
    return extensions.filter(ext => {
      const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (ext.description || (ext.descriptionKey ? t(ext.descriptionKey) : '')).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [extensions, searchQuery, selectedCategory, t]);

  const activeCount = extensions.filter(ext => ext.isActive).length;

  const handleToggleExtension = (id) => {
    setExtensions(extensions.map(ext =>
      ext.id === id ? { ...ext, isActive: !ext.isActive } : ext
    ));
  };

  const handleDeleteExtension = (id) => {
    if (window.confirm(t('extensions.deleteConfirm'))) {
      setExtensions(extensions.filter(ext => ext.id !== id));
    }
  };

  const handleAddExtension = (newExtension) => {
    const newId = Math.max(...extensions.map(ext => ext.id), 0) + 1;
    setExtensions([{
      ...newExtension,
      id: newId,
      isActive: false,
      config: {}
    }, ...extensions]);
  };

  const handleOpenConfig = (extension) => {
    setSelectedExtension(extension);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (config) => {
    setExtensions(extensions.map(ext =>
      ext.id === selectedExtension.id ? { ...ext, config } : ext
    ));
    setIsConfigModalOpen(false);
    setSelectedExtension(null);
  };

  return (
    <div className="page-container extensions-page">
      <Sidebar 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        activeCount={activeCount}
        totalCount={extensions.length}
        onAddClick={() => setIsAddModalOpen(true)}
        onProjectsClick={handleProjectsNavigation}
      />

      <div className="main-content">
        <div className="gradient-bg" />

        <ExtensionHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="content-wrapper custom-scrollbar">

          <ExtensionGrid 
            extensions={filteredExtensions}
            categories={categories}
            onToggle={handleToggleExtension}
            onDelete={handleDeleteExtension}
            onConfig={handleOpenConfig}
            onAddClick={() => setIsAddModalOpen(true)}
          />
        </main>
      </div>

      {isAddModalOpen && (
        <AddExtensionModal 
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddExtension}
        />
      )}

      {isConfigModalOpen && selectedExtension && (
        <ConfigModal
          extension={selectedExtension}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
};

export default ExtensionsPage;