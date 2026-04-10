import React from 'react';
import { BookOpen, Folder, Settings, User, Zap, Sparkles, Cpu } from 'lucide-react';

const Sidebar = ({ projectsCount = 0 }) => {
  return (
    <aside className="w-72 bg-black border-r border-orange-900/30 flex flex-col relative overflow-hidden h-full shadow-2xl shadow-orange-900/10">

      {/* Верхняя часть: Логотип и название */}
      <div className="relative z-10 p-6 flex flex-col items-center border-b border-orange-900/20">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 transform hover:rotate-6 transition-transform duration-300 cursor-pointer">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
          Stream<span className="text-orange-500">Lit</span>
        </h1>
        
        {/* Новая подпись: no-code конструктор */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] backdrop-blur-sm group cursor-default">
          <Cpu size={12} className="text-orange-500 animate-pulse" />
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest border-r border-orange-500/30 pr-2">Python</span>
          <span className="text-xs font-mono text-orange-200">no-code builder</span>
        </div>
      </div>

      {/* Центрированное меню */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-6 overflow-y-auto custom-scrollbar">
        
        {/* Секция: Навигация как карточки */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2">Core</div>
          
          {/* Кнопка Документация */}
          <button className="w-full group flex items-center justify-between p-4 bg-gray-900/50 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/30 rounded-xl transition-all duration-300 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:text-orange-300 group-hover:bg-orange-500/30 transition-colors">
                <BookOpen size={20} />
              </div>
              <span className="text-gray-200 font-medium group-hover:text-white">Документация</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-orange-500 transition-colors"></div>
          </button>

          {/* Кнопка Проекты с динамическим числом */}
          <button className="w-full group flex items-center justify-between p-4 bg-gray-900/50 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/30 rounded-xl transition-all duration-300 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:text-orange-300 group-hover:bg-orange-500/30 transition-colors">
                <Folder size={20} />
              </div>
              <span className="text-gray-200 font-medium group-hover:text-white">Проекты</span>
            </div>
            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{projectsCount}</span>
          </button>
        </div>

        {/* Секция: Инструменты (Сетка) */}
        <div className="space-y-3 mt-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 pl-2">Tools</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-3 bg-gray-900/30 hover:bg-orange-500/10 rounded-lg border border-gray-800 hover:border-orange-500/30 transition-all group">
              <Settings size={18} className="text-gray-400 group-hover:text-orange-400 mb-1" />
              <span className="text-[10px] text-gray-400 group-hover:text-gray-200">Настройки</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 bg-gray-900/30 hover:bg-orange-500/10 rounded-lg border border-gray-800 hover:border-orange-500/30 transition-all group">
              <User size={18} className="text-gray-400 group-hover:text-orange-400 mb-1" />
              <span className="text-[10px] text-gray-400 group-hover:text-gray-200">Профиль</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;