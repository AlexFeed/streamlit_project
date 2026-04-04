
import React from 'react';
import { FolderOpen } from 'lucide-react'; // Используем иконку папки вместо сетки

const EmptyState = ({ onCreateProject }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[200px] font-black text-white opacity-[0.03] pointer-events-none select-none whitespace-nowrap z-0">
      STREAMLIT
    </div>
    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-orange-900/20">
      <FolderOpen size={40} className="text-gray-600" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">У вас пока нет проектов</h2>
    <p className="text-gray-400 max-w-md mb-8 text-lg">
      Создайте своё первое no-code приложение на базе Streamlit за пару минут.
    </p>
    {/* Кнопка убрана, так как есть общая в хедере */}
  </div>
);

export default EmptyState;