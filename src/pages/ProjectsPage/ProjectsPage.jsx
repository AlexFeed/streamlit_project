import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import EmptyState from './EmptyState';
import Header from './Header';
import ProjectCard from './ProjectCard';
import Sidebar from './Sidebar';

// Начальные данные без статуса
const initialProjects = [
  { id: 1, title: 'Анализ данных продаж', description: 'Интерактивный дашборд для визуализации продаж по регионам.', lastEdited: '2 часа назад' },
  { id: 2, title: 'Чат-бот поддержки', description: 'Простой бот для ответов на частые вопросы.', lastEdited: '1 день назад' },
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Фильтрация только по поиску
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      return project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             project.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [projects, searchQuery]);

  const handleOpenCreateModal = () => {
    setNewProjectTitle('');
    setNewProjectDesc('');
    setIsCreateModalOpen(true);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const newProject = {
      id: newId,
      title: newProjectTitle,
      description: newProjectDesc || 'Описание отсутствует',
      lastEdited: 'Только что'
    };
    setProjects([newProject, ...projects]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleUpdateTitle = (id, newTitle) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, title: newTitle, lastEdited: 'Только что' } : p
    ));
  };

  const handleUpdateDescription = (id, newDesc) => {
    setProjects(projects.map(p =>
      p.id === id ? { ...p, description: newDesc, lastEdited: 'Только что' } : p
    ));
  };

  const renderProjects = () => {
    if (filteredProjects.length === 0) {
      return <EmptyState onCreateProject={handleOpenCreateModal} />;
    }

    return (
      <>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Мои проекты</h2>
            <p className="text-gray-400 text-sm">Управляйте своими приложениями Streamlit</p>
          </div>
        </div>

        <div className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'flex flex-col gap-4'
        } transition-all duration-500 ease-in-out`}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onDelete={handleDeleteProject}
              onUpdateTitle={handleUpdateTitle}
              onUpdateDescription={handleUpdateDescription}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-orange-500 selection:text-white">
      <Sidebar projectsCount={projects.length} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none z-0" />

        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateProject={handleOpenCreateModal}
        />

        <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          {renderProjects()}
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-orange-900/20 w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Новый проект</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Название</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Введите название проекта"
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-600"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Описание (необязательно)</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Краткое описание функционала..."
                  rows={3}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!newProjectTitle.trim()}
                  className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-orange-600/20"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;