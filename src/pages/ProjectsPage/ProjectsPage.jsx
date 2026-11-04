import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi.js';
import { useProjects } from './hooks/useProjects.js';
import SettingsModal from './SettingsModal.jsx';
import EmptyState from './EmptyState';
import Header from './Header';
import ProjectCard from './ProjectCard';
import Sidebar from './Sidebar';
import './ProjectsPage.css';
import { formatProjectDate } from "../../shared/utils/dateUtils.js";
import useTranslation from '../../shared/translation/useTranslation.js';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { language, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const {
    projects,
    isLoading,
    loadError,
    removeProject,
    updateProjectTitle,
    updateProjectDescription,
  } = useProjects();

  const handleLogout = () => {
    const confirmed = window.confirm(
        t('projects.logoutConfirm')
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

  const handleOpenCreateModal = () => {
    navigate('/editor');
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm(t('projects.deleteConfirm'))) {
      return;
    }

    await removeProject(id);
  };

  const handleUpdateTitle = async (id, newTitle) => {
    await updateProjectTitle(id, newTitle);
  };

  const handleUpdateDescription = async (id, newDesc) => {
    await updateProjectDescription(id, newDesc);
  };

  const renderProjects = () => {
    if (isLoading) {
      return <div className="sp-loading">{t('projects.loading')}</div>;
    }

    if (loadError) {
      return <div className="sp-error-message">{t(loadError)}</div>;
    }

    if (filteredProjects.length === 0) {
      return <EmptyState onCreateProject={handleOpenCreateModal} />;
    }

    return (
        <>
          <div className="sp-section-header">
            <div>
              <h2 className="sp-section-title">{t('projects.mine')}</h2>
              <p className="sp-section-subtitle">{t('projects.subtitle')}</p>
            </div>
          </div>
          <div className={viewMode === 'grid' ? 'sp-projects-grid sp-grid-mode' : 'sp-projects-list'}>
            {filteredProjects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={{
                      ...project,
                      lastEdited: formatProjectDate(project.updatedAt || project.createdAt, language),
                    }}
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

  const renderDocumentation = () => (
      <section className="sp-documentation">
        <h2 className="sp-section-title">{t('projects.documentation')}</h2>
        <p className="sp-section-subtitle">{t('projects.documentationIntro')}</p>
        <div className="sp-documentation-card">
          <h3>{t('projects.documentation.createTitle')}</h3>
          <p>{t('projects.documentation.createDescription')}</p>
        </div>
        <div className="sp-documentation-card">
          <h3>{t('projects.documentation.editTitle')}</h3>
          <p>{t('projects.documentation.editDescription')}</p>
        </div>
        <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
        >
          {t('projects.new')}
        </button>
      </section>
  );

  return (
      <div className="page-container sp-projects-page">
        <Sidebar
            projectsCount={projects.length}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLogout={handleLogout}
            onExtensionsClick={() => navigate('/extensions')}
            onSettingsClick={() => setIsSettingsOpen(true)}
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
          <main
              id="projects-tabpanel"
              className="sp-projects-content sp-custom-scrollbar"
              role="tabpanel"
              aria-labelledby={activeTab === 'projects' ? 'projects-list-tab' : 'projects-documentation-tab'}
          >
            {activeTab === 'projects' ? renderProjects() : renderDocumentation()}
          </main>
        </div>
        {isSettingsOpen && (
            <SettingsModal onClose={() => setIsSettingsOpen(false)} />
        )}
      </div>
  );
};

export default ProjectsPage;