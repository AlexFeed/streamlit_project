import { useEffect, useState } from 'react';

import { getProject, createProject, updateProject } from '../../../api/projectsApi.js';
import {compileDashboardSchema} from '../services/editorSchema.js';
import { EDITOR_DRAFT_STORAGE_KEY } from './useEditorState.js';
import { DATASET_DRAFT_STORAGE_KEY } from './useDatasetState.js';

// Hook отвечает за загрузку и сохранение проекта.
export const useProjectState = ({
                                    projectId,
                                    setComponents,
                                    setDataset,
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
                setDataset(fetchedProject.dataset || null);
            } catch (error) {
                console.error('Ошибка загрузки проекта:', error);
                setProjectError('Не удалось загрузить проект.');
            } finally {
                setIsProjectLoading(false);
            }
        };

        loadProject();
    }, [projectId, setComponents, setDataset]);


    // Операция 1: Создание проекта из черновика (с модалкой)
    const createProjectFromDraft = async (snapshot) => {
        const { schema, errors } = compileDashboardSchema(snapshot);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return null;
        }

        setValidationErrors([]);
        setProjectError('');

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            dataset: snapshot.dataset,
            editorState: { components: snapshot.components },
            schema,
        };

        try {
            setIsProjectSaving(true);
            const savedProject = await createProject(payload);

            // Удаляем данные черновика после успешного создания проекта
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
    const saveExistingProject = async (snapshot) => {
        if (!projectId || !project) return null;

        const { schema, errors } = compileDashboardSchema(snapshot);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return null;
        }

        setValidationErrors([]);
        setProjectError('');

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            dataset: snapshot.dataset,
            editorState: { components: snapshot.components },
            schema,
        };

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