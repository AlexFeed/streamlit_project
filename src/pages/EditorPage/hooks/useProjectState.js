import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getProject, createProject, updateProject } from '../../../api/projectsApi.js';
import {compileDashboardSchema} from '../services/editorSchema.js';
import {DATASET_DRAFT_STORAGE_KEY, EDITOR_DRAFT_STORAGE_KEY} from "../../../shared/constants/storageKeys.js";

// Hook отвечает за загрузку и сохранение проекта.
export const useProjectState = ({
                                    projectId,
                                    setComponents,
                                    setDatasets,
                                }) => {
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [isProjectSaving, setIsProjectSaving] = useState(false);
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

                const fetchedProject = await getProject(projectId);

                setProject(fetchedProject);
                setComponents(fetchedProject.editorState?.components || []);
                setDatasets(fetchedProject.datasets || []);
            } catch (error) {
                console.error('Ошибка загрузки проекта:', error);
                toast.error('Не удалось загрузить проект.');
            } finally {
                setIsProjectLoading(false);
            }
        };

        loadProject();
    }, [projectId, setComponents, setDatasets]);


    // Операция 1: Создание проекта из черновика (с модалкой)
    const createProjectFromDraft = async (snapshot) => {
        const { schema, errors } = compileDashboardSchema(snapshot);
        if (errors.length > 0) {
            errors.forEach((err) => toast.error(err));
            return null;
        }

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            datasets: snapshot.datasets,
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
            toast.success('Проект успешно сохранён.');
            return savedProject;
        } catch (error) {
            console.error('Ошибка создания проекта:', error);
            toast.error('Не удалось создать проект.');
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
            errors.forEach((err) => toast.error(err));
            return null;
        }

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            datasets: snapshot.datasets,
            editorState: { components: snapshot.components },
            schema,
        };

        try {
            setIsProjectSaving(true);
            const updatedProject = await updateProject(projectId, payload);
            setProject(updatedProject);
            toast.success('Изменения сохранены.');
            return updatedProject;
        } catch (error) {
            console.error('Ошибка обновления проекта:', error);
            toast.error('Не удалось обновить проект.');
            return null;
        } finally {
            setIsProjectSaving(false);
        }
    };

    return {
        isProjectLoading,
        isProjectSaving,
        project,
        createProjectFromDraft,
        saveExistingProject,
    };
};