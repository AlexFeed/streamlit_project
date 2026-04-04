import React, { useState } from 'react';
import { Trash2, Clock, Pencil } from 'lucide-react';

// --- Иконка короны (только линии, без нижней полоски) ---
const CrownIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 8L7 12L12 4L17 12L20 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
// ---------------------------------------------

const ProjectCard = ({ project, onDelete, viewMode = 'grid', onUpdateTitle, onUpdateDescription }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState(project.description);

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== project.title) {
      onUpdateTitle(project.id, editTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveTitle();
    if (e.key === 'Escape') {
      setEditTitle(project.title);
      setIsEditingTitle(false);
    }
  };

  const handleSaveDesc = () => {
    if (editDesc.trim() && editDesc !== project.description) {
      onUpdateDescription(project.id, editDesc);
    }
    setIsEditingDesc(false);
  };

  const handleDescKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveDesc();
    if (e.key === 'Escape') {
      setEditDesc(project.description);
      setIsEditingDesc(false);
    }
  };

  // РЕЖИМ СПИСКА
  if (viewMode === 'list') {
    return (
      <div className="group bg-gray-900/50 border border-gray-800 hover:border-orange-500/30 rounded-xl p-4 flex items-center gap-6 transition-all duration-300 hover:bg-gray-900 hover:shadow-lg hover:shadow-orange-900/10 w-full">
        {/* Оранжевая полоска для всех проектов */}
        <div className="w-1.5 h-12 rounded-full flex-shrink-0 bg-orange-500/50" />
        
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 w-full min-h-[2rem]">
            {isEditingTitle ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                className="flex-1 bg-gray-800 text-white px-2 py-1 rounded border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-lg font-semibold w-full"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-semibold text-white truncate group-hover:text-orange-400 transition-colors flex-1 min-w-0">
                {project.title}
              </h3>
            )}
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-gray-500 hover:text-orange-400 transition-colors p-1 rounded-full hover:bg-gray-800 flex-shrink-0 w-6 h-6 flex items-center justify-center"
              title="Редактировать название"
            >
              <Pencil size={12} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-1 w-full min-h-[2rem]">
            {isEditingDesc ? (
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                onBlur={handleSaveDesc}
                onKeyDown={handleDescKeyDown}
                className="flex-1 bg-gray-800 text-gray-300 px-2 py-1 rounded border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm w-full"
                autoFocus
              />
            ) : (
              <p className="text-gray-500 text-sm truncate flex-1 min-w-0">{project.description}</p>
            )}
            <button
              onClick={() => setIsEditingDesc(true)}
              className="text-gray-500 hover:text-orange-400 transition-colors p-1 rounded-full hover:bg-gray-800 flex-shrink-0 w-6 h-6 flex items-center justify-center"
              title="Редактировать описание"
            >
              <Pencil size={12} />
            </button>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(project.id)}
          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
          title="Удалить проект"
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  }

  // РЕЖИМ СЕТКИ
  return (
    <div className="group bg-gray-900 rounded-xl border border-gray-800 hover:border-orange-500/50 transition-all duration-300 overflow-hidden flex flex-col relative w-full h-full">
      <div className="h-32 bg-black relative overflow-hidden flex items-center justify-center border-b border-gray-800">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
          <span className="text-6xl font-bold text-orange-500 tracking-widest transform -rotate-12">STREAMLIT</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80 z-0"></div>
        <CrownIcon className="text-gray-700 group-hover:text-orange-500 transition-all duration-300 z-10 opacity-50 group-hover:opacity-100 w-10 h-10 drop-shadow-lg" />
      </div>

      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center gap-2 mb-2 w-full min-h-[2rem]">
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 bg-gray-800 text-white px-2 py-1 rounded border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-lg font-semibold w-full"
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1 flex-1 min-w-0">
              {project.title}
            </h3>
          )}
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-gray-500 hover:text-orange-400 transition-colors p-1 rounded-full hover:bg-gray-800 flex-shrink-0 w-6 h-6 flex items-center justify-center"
            title="Редактировать название"
          >
            <Pencil size={12} />
          </button>
        </div>

        <div className="flex items-start gap-2 mb-4 w-full min-h-[3rem]">
          {isEditingDesc ? (
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onBlur={handleSaveDesc}
              onKeyDown={handleDescKeyDown}
              className="flex-1 bg-gray-800 text-gray-300 px-2 py-1 rounded border border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm resize-none w-full"
              rows={2}
              style={{ minHeight: '2.5rem' }}
              autoFocus
            />
          ) : (
            <p className="text-gray-400 text-sm line-clamp-2 flex-1 min-w-0">
              {project.description}
            </p>
          )}
          <button
            onClick={() => setIsEditingDesc(true)}
            className="text-gray-500 hover:text-orange-400 transition-colors p-1 rounded-full hover:bg-gray-800 flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center"
            title="Редактировать описание"
          >
            <Pencil size={12} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} />
            <span>{project.lastEdited}</span>
          </div>
          <button
            onClick={() => onDelete(project.id)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-400/10"
            title="Удалить проект"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;