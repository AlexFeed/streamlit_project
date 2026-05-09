import { useEffect, useState } from 'react';

import { getProject, createProject, updateProject } from '../../../api/projectsApi.js';
import { buildDashboardSchema, validateSchema } from '../services/editorSchema.js';
import { EDITOR_DRAFT_STORAGE_KEY } from './useEditorState.js';
import { DATASET_DRAFT_STORAGE_KEY } from './useDatasetState.js';

// Hook отвечает за загрузку и сохранение проекта.
export const useProjectState = ({
                                    projectId,
                                    components,
                                    availableFields,
                                    datasetMeta,
                                    setComponents,
                                    setDatasetMeta,
                                    setValidationErrors,
                                }) => {
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [isProjectSaving, setIsProjectSaving] = useState(false);
    const [projectError, setProjectError] = useState('');
    const [project, setProject] = useState(null);

    // Загрузка сохранённого проекта при открытии /editor/:projectId
    useEffect(() => {
        if (!projectId) {
            setProject(null);
            return;
        }

        const loadProject = async () => {
            try {
                setIsProjectLoading(true);
                setProjectError('');

                const fetchedProject = await getProject(projectId);

                setProject(fetchedProject);
                setComponents(fetchedProject.editorState?.components || []);
                setDatasetMeta(fetchedProject.datasetMeta || null);
            } catch (error) {
                console.error('Ошибка загрузки проекта:', error);
                setProjectError('Не удалось загрузить проект.');
            } finally {
                setIsProjectLoading(false);
            }
        };

        loadProject();
    }, [projectId, setComponents, setDatasetMeta]);

    // Вспомогательная функция для сборки данных для отправки
    const buildProjectData = (projectTitle, projectDescription) => {
        const schema = buildDashboardSchema(
            components,
            availableFields,
            datasetMeta,
            projectTitle
        );

        return {
            title: projectTitle,
            description: projectDescription,
            datasetMeta,
            editorState: { components },
            schema,
        };
    };

    // Операция 1: Создание проекта из черновика (с модалкой)
    const createProjectFromDraft = async ({ title, description }) => {
        const errors = validateSchema(components, availableFields, datasetMeta);

        if (errors.length > 0) {
            setValidationErrors(errors);
            return null;
        }

        setValidationErrors([]);
        setProjectError('');

        const payload = buildProjectData(title, description);

        try {
            setIsProjectSaving(true);

            const savedProject = await createProject(payload);

            // Очищаем черновики только при успешном создании
            localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
            localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);

            setProject(savedProject);
            return savedProject;
        } catch (error) {
            console.error('Ошибка создания проекта:', error);
            setProjectError('Не удалось создать проект.');
            return null;
        } finally {
            setIsProjectSaving(false);
        }
    };

    // Операция 2: Тихое сохранение существующего проекта
    const saveExistingProject = async () => {
        if (!projectId || !project) return null;

        const errors = validateSchema(components, availableFields, datasetMeta);

        if (errors.length > 0) {
            setValidationErrors(errors);
            return null;
        }

        setValidationErrors([]);
        setProjectError('');

        // Используем уже существующие title и description
        const payload = buildProjectData(project.title, project.description);

        try {
            setIsProjectSaving(true);

            const updatedProject = await updateProject(projectId, payload);

            setProject(updatedProject);
            return updatedProject;
        } catch (error) {
            console.error('Ошибка обновления проекта:', error);
            setProjectError('Не удалось обновить проект.');
            return null;
        } finally {
            setIsProjectSaving(false);
        }
    };

    return {
        isProjectLoading,
        isProjectSaving,
        projectError,
        project,
        createProjectFromDraft,
        saveExistingProject,
    };
};