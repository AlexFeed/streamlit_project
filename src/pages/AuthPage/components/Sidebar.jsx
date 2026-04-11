import React from 'react';
import { Zap } from 'lucide-react';

const Sidebar = ({ isLogin }) => {
  return (
    <aside className="w-72 bg-black border-r border-orange-900/30 flex flex-col relative overflow-hidden h-full shadow-2xl shadow-orange-900/10">
      {/* Фоновая надпись "STREAMLIT" */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="text-[10rem] font-black text-orange-900/5 rotate-12 select-none whitespace-nowrap tracking-tighter">
          STREAMLIT
        </div>
      </div>

      {/* Верхняя часть: Логотип */}
      <div className="relative z-10 p-6 flex flex-col items-center border-b border-orange-900/20">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">
          Stream<span className="text-orange-500">Lit</span>
        </h1>
        <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded bg-black/50 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] backdrop-blur-sm">
          <span className="text-xs font-mono text-orange-200">no-code builder</span>
        </div>
      </div>

      {/* Центральная часть */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            {isLogin ? 'Добро пожаловать' : 'Создайте аккаунт'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Войдите в свой аккаунт для продолжения' : 'Начните создавать no-code приложения'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;