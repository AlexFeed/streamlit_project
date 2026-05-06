import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi.js';
import { listProjects, deleteProject, updateProject } from '../../api/projectsApi.js';
import EmptyState from './EmptyState';
import Header from './Header';
import ProjectCard from './ProjectCard';
import Sidebar from './Sidebar';
import './ProjectsPage.css';

const formatProject = (project) => ({
  ...project,
  lastEdited: project.updatedAt || project.createdAt || project.lastEdited || 'Только что',
});

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const handleLogout = () => {
    const confirmed = window.confirm(
        'При выходе все несохраненные данные будут удалены. Продолжить?'
    );

    if (!confirmed) {
      return;
    }

    logout();

    navigate('/auth', { replace: true });
  };

  const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const serverProjects = await listProjects();
        setProjects(Array.isArray(serverProjects) ? serverProjects.map(formatProject) : []);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
        setLoadError(error?.message || 'Не удалось загрузить проекты.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleOpenCreateModal = () => {
    navigate('/editor');
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      return;
    }

    try {
      await deleteProject(id);
      setProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Ошибка удаления проекта:', error);
      window.alert('Не удалось удалить проект. Попробуйте снова.');
    }
  };

  const handleUpdateTitle = async (id, newTitle) => {
    try {
      await updateProject(id, { title: newTitle });
      setProjects((prevProjects) => prevProjects.map((p) =>
        p.id === id ? { ...p, title: newTitle, lastEdited: 'Только что' } : p
      ));
    } catch (error) {
      console.error('Ошибка обновления названия проекта:', error);
      window.alert('Не удалось сохранить название проекта. Попробуйте снова.');
    }
  };

  const handleUpdateDescription = async (id, newDesc) => {
    try {
      await updateProject(id, { description: newDesc });
      setProjects((prevProjects) => prevProjects.map((p) =>
        p.id === id ? { ...p, description: newDesc, lastEdited: 'Только что' } : p
      ));
    } catch (error) {
      console.error('Ошибка обновления описания проекта:', error);
      window.alert('Не удалось сохранить описание проекта. Попробуйте снова.');
    }
  };

  const renderProjects = () => {
    if (isLoading) {
      return <div className="sp-loading">Загрузка проектов...</div>;
    }

    if (loadError) {
      return <div className="sp-error-message">{loadError}</div>;
    }

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
              onOpen={() => handleOpenProject(project.id)}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="sp-projects-page">
      <Sidebar 
        projectsCount={projects.length} 
        onLogout={handleLogout} 
        onExtensionsClick={() => navigate('/extensions')} 
      />
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
    </div>
  );
};

export default ProjectsPage;