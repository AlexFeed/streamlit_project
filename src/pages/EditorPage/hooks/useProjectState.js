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
                                    navigate,
                                    setValidationErrors,
                                }) => {
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [isProjectSaving, setIsProjectSaving] = useState(false);
    const [projectError, setProjectError] = useState('');

    // Загрузка сохранённого проекта при открытии /editor/:projectId
    useEffect(() => {
        if (!projectId) {
            return;
        }

        const loadProject = async () => {
            try {
                setIsProjectLoading(true);
                setProjectError('');

                const project = await getProject(projectId);

                setComponents(project.editorState?.components || []);
                setDatasetMeta(project.datasetMeta || null);
            } catch (error) {
                console.error('Ошибка загрузки проекта:', error);
                setProjectError('Не удалось загрузить проект.');
            } finally {
                setIsProjectLoading(false);
            }
        };

        loadProject();
    }, [projectId, setComponents, setDatasetMeta]);

    // Сохранение нового или существующего проекта
    const handleSaveProject = async () => {
        const errors = validateSchema(components, availableFields, datasetMeta);

        if (errors.length > 0) {
            setValidationErrors(errors);
            setProjectError('');
            return;
        }

        setValidationErrors([]);
        setProjectError('');

        const schema = buildDashboardSchema(
            components,
            availableFields,
            datasetMeta
        );

        const payload = {
            title: schema.dashboard.title,
            description: '',
            datasetMeta,
            editorState: {
                components,
            },
            schema,
        };

        try {
            setIsProjectSaving(true);

            const savedProject = projectId
                ? await updateProject(projectId, payload)
                : await createProject(payload);

            if (!projectId) {
                localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);

                navigate(`/editor/${savedProject.id}`);
            }

            console.log('Проект сохранён:', savedProject);

            return savedProject;
        } catch (error) {
            console.error('Ошибка сохранения проекта:', error);
            setProjectError('Не удалось сохранить проект.');
            return null;
        } finally {
            setIsProjectSaving(false);
        }
    };

    return {
        isProjectLoading,
        isProjectSaving,
        projectError,
        handleSaveProject,
    };
};