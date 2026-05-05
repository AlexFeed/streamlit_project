import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { logout } from '../../api/authApi.js';
import EmptyState from './EmptyState';
import Header from './Header';
import ProjectCard from './ProjectCard';
import Sidebar from './Sidebar';
import './ProjectsPage.css';

const initialProjects = [
  { id: 1, title: 'Анализ данных продаж', description: 'Интерактивный дашборд для визуализации продаж по регионам.', lastEdited: '2 часа назад' },
  { id: 2, title: 'Чат-бот поддержки', description: 'Простой бот для ответов на частые вопросы.', lastEdited: '1 день назад' },
];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/auth', { replace: true });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
        <div className="sp-section-header">
          <div>
            <h2 className="sp-section-title">Мои проекты</h2>
            <p className="sp-section-subtitle">Управляйте своими приложениями Streamlit</p>
          </div>
        </div>
        <div className={viewMode === 'grid' ? 'sp-projects-grid sp-grid-mode' : 'sp-projects-list'}>
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
    <div className="sp-projects-page">
      <Sidebar projectsCount={projects.length} onLogout={handleLogout} />
      <div className="sp-projects-main">
        <div className="sp-gradient-overlay" />
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onCreateProject={handleOpenCreateModal}
        />
        <main className="sp-projects-content sp-custom-scrollbar">
          {renderProjects()}
        </main>
      </div>

      {isCreateModalOpen && (
        <div className="sp-modal-overlay sp-animate-fade-in">
          <div className="sp-modal-container">
            <div className="sp-modal-header">
              <h3 className="sp-modal-title">Новый проект</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="sp-modal-close">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="sp-modal-form">
              <div className="sp-form-group">
                <label className="sp-form-label">Название</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Введите название проекта"
                  className="sp-modal-input"
                  autoFocus
                />
              </div>
              <div className="sp-form-group">
                <label className="sp-form-label">Описание (необязательно)</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Краткое описание функционала..."
                  rows={3}
                  className="sp-modal-textarea"
                />
              </div>
              <div className="sp-modal-actions">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="sp-cancel-btn">
                  Отмена
                </button>
                <button type="submit" disabled={!newProjectTitle.trim()} className="sp-submit-btn">
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