import React, { useState } from 'react';
import { Trash2, Clock, Pencil } from 'lucide-react';

const CrownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8L7 12L12 4L17 12L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

  if (viewMode === 'list') {
    return (
      <div className="sp-project-card-list">
        <div className="sp-list-accent" />
        <div className="sp-list-content">
          <div className="sp-list-title-row">
            {isEditingTitle ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleTitleKeyDown}
                className="sp-edit-title-input"
                autoFocus
              />
            ) : (
              <h3 className="sp-list-title">{project.title}</h3>
            )}
            <button onClick={() => setIsEditingTitle(true)} className="sp-edit-title-btn" title="Редактировать название">
              <Pencil size={12} />
            </button>
          </div>
          <div className="sp-list-desc-row">
            {isEditingDesc ? (
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                onBlur={handleSaveDesc}
                onKeyDown={handleDescKeyDown}
                className="sp-edit-desc-input"
                autoFocus
              />
            ) : (
              <p className="sp-list-desc">{project.description}</p>
            )}
            <button onClick={() => setIsEditingDesc(true)} className="sp-edit-desc-btn" title="Редактировать описание">
              <Pencil size={12} />
            </button>
          </div>
        </div>
        <button onClick={() => onDelete(project.id)} className="sp-delete-list-btn" title="Удалить проект">
          <Trash2 size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="sp-project-card-grid">
      <div className="sp-card-banner">
        <div className="sp-banner-watermark">
          <span>STREAMLIT</span>
        </div>
        <div className="sp-banner-gradient" />
        <CrownIcon className="sp-card-crown" />
      </div>
      <div className="sp-card-body">
        <div className="sp-card-title-row">
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleTitleKeyDown}
              className="sp-edit-title-input"
              autoFocus
            />
          ) : (
            <h3 className="sp-card-title">{project.title}</h3>
          )}
          <button onClick={() => setIsEditingTitle(true)} className="sp-edit-title-btn" title="Редактировать название">
            <Pencil size={12} />
          </button>
        </div>
        <div className="sp-card-desc-row">
          {isEditingDesc ? (
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onBlur={handleSaveDesc}
              onKeyDown={handleDescKeyDown}
              className="sp-edit-desc-input"
              rows={2}
              style={{ minHeight: '2.5rem' }}
              autoFocus
            />
          ) : (
            <p className="sp-card-desc">{project.description}</p>
          )}
          <button onClick={() => setIsEditingDesc(true)} className="sp-edit-desc-btn" title="Редактировать описание">
            <Pencil size={12} />
          </button>
        </div>
        <div className="sp-card-footer">
          <div className="sp-project-date">
            <Clock size={12} />
            <span>{project.lastEdited}</span>
          </div>
          <button onClick={() => onDelete(project.id)} className="sp-delete-card-btn" title="Удалить проект">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;