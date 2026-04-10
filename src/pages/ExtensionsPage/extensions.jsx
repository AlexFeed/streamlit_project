import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Edit2, Save, Zap, Power, PowerOff, Settings, BarChart3, PieChart, LineChart, Map, Activity } from 'lucide-react';

const ExtensionsPage = () => {
  const [extensions, setExtensions] = useState([
    {
      id: 1,
      name: 'ECharts',
      description: 'Мощная библиотека для создания интерактивных графиков и визуализаций данных',
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
      description: 'Интерактивные графики с возможностью масштабирования и фильтрации',
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
      description: 'Интерактивные карты и геовизуализации',
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
  const [newExtension, setNewExtension] = useState({
    name: '',
    description: '',
    version: '',
    category: 'chart',
    icon: '🔌'
  });

  const categories = [
    { id: 'all', name: 'Все', icon: <Activity size={16} /> },
    { id: 'chart', name: 'Графики', icon: <BarChart3 size={16} /> },
    { id: 'map', name: 'Карты', icon: <Map size={16} /> },
    { id: 'custom', name: 'Кастомные', icon: <Settings size={16} /> }
  ];

  const filteredExtensions = useMemo(() => {
    return extensions.filter(ext => {
      const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ext.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [extensions, searchQuery, selectedCategory]);

  const activeCount = extensions.filter(ext => ext.isActive).length;

  const handleToggleExtension = (id) => {
    setExtensions(extensions.map(ext =>
      ext.id === id ? { ...ext, isActive: !ext.isActive } : ext
    ));
  };

  const handleDeleteExtension = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это расширение?')) {
      setExtensions(extensions.filter(ext => ext.id !== id));
    }
  };

  const handleAddExtension = (e) => {
    e.preventDefault();
    if (!newExtension.name.trim()) return;

    const newId = Math.max(...extensions.map(ext => ext.id), 0) + 1;
    setExtensions([{
      ...newExtension,
      id: newId,
      isActive: false,
      config: {}
    }, ...extensions]);
    setIsAddModalOpen(false);
    setNewExtension({
      name: '',
      description: '',
      version: '',
      category: 'chart',
      icon: '🔌'
    });
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

  const getCategoryColor = (category) => {
    switch(category) {
      case 'chart': return 'text-blue-400 bg-blue-500/10';
      case 'map': return 'text-green-400 bg-green-500/10';
      default: return 'text-purple-400 bg-purple-500/10';
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      {/* Левый сайдбар */}
      <aside className="w-72 bg-black border-r border-orange-900/30 flex flex-col relative overflow-hidden h-full shadow-2xl shadow-orange-900/10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-[10rem] font-black text-orange-900/5 rotate-12 select-none whitespace-nowrap tracking-tighter">
            EXTENSIONS
          </div>
        </div>

        <div className="relative z-10 p-6 flex flex-col items-center border-b border-orange-900/20">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
            Stream<span className="text-orange-500">lit</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] backdrop-blur-sm">
            <span className="text-xs font-mono text-orange-200">{activeCount} / {extensions.length} активны</span>
          </div>
        </div>

        <div className="relative z-10 flex-1 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Категории</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {cat.icon}
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all shadow-lg shadow-orange-600/20"
          >
            <Plus size={18} />
            <span>Добавить расширение</span>
          </button>
        </div>
      </aside>

      {/* Основная область */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none z-0" />

        {/* Header */}
        <div className="relative z-10 border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск расширений..."
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Управление расширениями</h2>
            <p className="text-gray-400">Подключите дополнительные библиотеки для визуального конструктора</p>
          </div>

          {filteredExtensions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔌</div>
              <h3 className="text-xl font-semibold text-white mb-2">Нет расширений</h3>
              <p className="text-gray-400 mb-4">Добавьте первое расширение для вашего проекта</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all"
              >
                Добавить расширение
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExtensions.map((extension) => (
                <div
                  key={extension.id}
                  className={`bg-gray-900/50 border rounded-xl p-6 transition-all backdrop-blur-sm ${
                    extension.isActive
                      ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{extension.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{extension.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(extension.category)}`}>
                          {categories.find(c => c.id === extension.category)?.name || extension.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleExtension(extension.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          extension.isActive
                            ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
                            : 'text-gray-500 bg-gray-800/50 hover:bg-gray-700/50'
                        }`}
                      >
                        {extension.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleOpenConfig(extension)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExtension(extension.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{extension.description}</p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">v{extension.version}</span>
                    <span className={`px-2 py-0.5 rounded ${
                      extension.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}>
                      {extension.isActive ? 'Активно' : 'Отключено'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal добавления */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-orange-900/20 w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Добавить расширение</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddExtension}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Название</label>
                <input
                  type="text"
                  value={newExtension.name}
                  onChange={(e) => setNewExtension({...newExtension, name: e.target.value})}
                  placeholder="ECharts, Plotly, etc."
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Описание</label>
                <textarea
                  value={newExtension.description}
                  onChange={(e) => setNewExtension({...newExtension, description: e.target.value})}
                  placeholder="Описание функционала расширения..."
                  rows={3}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Версия</label>
                  <input
                    type="text"
                    value={newExtension.version}
                    onChange={(e) => setNewExtension({...newExtension, version: e.target.value})}
                    placeholder="1.0.0"
                    className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Категория</label>
                  <select
                    value={newExtension.category}
                    onChange={(e) => setNewExtension({...newExtension, category: e.target.value})}
                    className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="chart">Графики</option>
                    <option value="map">Карты</option>
                    <option value="custom">Кастомные</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Иконка (emoji)</label>
                <input
                  type="text"
                  value={newExtension.icon}
                  onChange={(e) => setNewExtension({...newExtension, icon: e.target.value})}
                  placeholder="📊"
                  maxLength={2}
                  className="w-20 bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-2xl"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!newExtension.name.trim()}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-orange-600/20"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal конфигурации */}
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

// Компонент модального окна конфигурации
const ConfigModal = ({ extension, onClose, onSave }) => {
  const [config, setConfig] = useState(extension.config || {});

  const renderConfigFields = () => {
    if (extension.name === 'ECharts') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Тема</label>
            <select
              value={config.theme || 'dark'}
              onChange={(e) => setConfig({...config, theme: e.target.value})}
              className="w-full bg-black border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="dark">Темная</option>
              <option value="light">Светлая</option>
              <option value="vintage">Винтаж</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Рендерер</label>
            <select
              value={config.renderer || 'canvas'}
              onChange={(e) => setConfig({...config, renderer: e.target.value})}
              className="w-full bg-black border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="canvas">Canvas</option>
              <option value="svg">SVG</option>
            </select>
          </div>
        </>
      );
    }

    if (extension.name === 'Plotly') {
      return (
        <>
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.responsive || false}
                onChange={(e) => setConfig({...config, responsive: e.target.checked})}
                className="w-4 h-4 rounded border-gray-700 bg-black text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-400">Адаптивный размер</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.displayModeBar === false}
                onChange={(e) => setConfig({...config, displayModeBar: !e.target.checked})}
                className="w-4 h-4 rounded border-gray-700 bg-black text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-400">Скрыть панель управления</span>
            </label>
          </div>
        </>
      );
    }

    if (extension.name === 'Leaflet') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Начальный зум</label>
            <input
              type="number"
              value={config.zoom || 10}
              onChange={(e) => setConfig({...config, zoom: parseInt(e.target.value)})}
              className="w-full bg-black border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min={1}
              max={18}
            />
          </div>
        </>
      );
    }

    return (
      <div className="text-center text-gray-500 py-8">
        Нет доступных настроек для этого расширения
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-orange-900/20 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            Настройки: {extension.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {renderConfigFields()}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={() => onSave(config)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-orange-600/20"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionsPage;