import React from 'react';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';

const Header = ({ 
  searchQuery, setSearchQuery, 
  viewMode, setViewMode, 
  onCreateProject 
}) => {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        {/* Поиск */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Поиск проектов..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-600 transition-all"
          />
        </div>
      </div>

      {/* Правая часть: Переключение вида и кнопка создания */}
      <div className="flex items-center gap-3">
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-800 text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Сетка"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-800 text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Список"
          >
            <List size={18} />
          </button>
        </div>
        <button 
          onClick={onCreateProject}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Новый проект</span>
        </button>
      </div>
    </header>
  );
};

export default Header;