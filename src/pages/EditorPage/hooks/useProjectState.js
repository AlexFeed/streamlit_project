import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { getProject, createProject, updateProject } from '../../../api/projectsApi.js';
import {compileDashboardSchema} from '../services/editorSchema.js';
import {
    DATASET_DRAFT_STORAGE_KEY,
    EDITOR_DRAFT_STORAGE_KEY,
    EDITOR_PAGES_DRAFT_STORAGE_KEY,
} from '../../../shared/constants/storageKeys.js';
import useTranslation from '../../../shared/translation/useTranslation.js';

export const useProjectState = ({
                                    projectId,
                                    setEditorState,
                                    setDatasets,
                                }) => {
    const { t } = useTranslation();
    const translationRef = useRef(t);
    translationRef.current = t;
    const [isProjectLoading, setIsProjectLoading] = useState(false);
    const [isProjectSaving, setIsProjectSaving] = useState(false);
    const [project, setProject] = useState(null);

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
                setEditorState(
                    fetchedProject.editorState?.components || [],
                    fetchedProject.editorState?.pages || fetchedProject.schema?.pages
                );
                setDatasets(fetchedProject.datasets || []);
            } catch (error) {
                console.error('Could not load project:', error);
                toast.error(translationRef.current('editor.projectLoadFailure'));
            } finally {
                setIsProjectLoading(false);
            }
        };

        loadProject();
    }, [projectId, setDatasets, setEditorState]);

    const createProjectFromDraft = async (snapshot) => {
        // Saving is intentionally more permissive than preview/export. The editor
        // must be able to persist an unfinished component; a runnable schema is
        // attached only when the current draft is complete and valid.
        const { schema } = compileDashboardSchema(snapshot, t);

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            previewImage: snapshot.previewImage,
            datasets: snapshot.datasets,
            editorState: {
                components: snapshot.components,
                pages: snapshot.pages,
                previewImage: snapshot.previewImage,
            },
            schema: schema || null,
        };

        try {
            setIsProjectSaving(true);
            const savedProject = await createProject(payload);

            localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
            localStorage.removeItem(EDITOR_PAGES_DRAFT_STORAGE_KEY);
            localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);

            setProject(savedProject);
            toast.success(t('editor.projectCreateSuccess'));
            return savedProject;
        } catch (error) {
            console.error('Could not create project:', error);
            toast.error(t('editor.projectCreateFailure'));
            return null;
        } finally {
            setIsProjectSaving(false);
        }
    };

    const saveExistingProject = async (snapshot) => {
        if (!projectId || !project) return null;

        const { schema } = compileDashboardSchema(snapshot, t);

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            previewImage: snapshot.previewImage,
            datasets: snapshot.datasets,
            editorState: {
                components: snapshot.components,
                pages: snapshot.pages,
                previewImage: snapshot.previewImage,
            },
        };

        // Keep the last runnable schema while the user is saving an unfinished
        // draft. Preview/export will compile and validate the latest editor state.
        if (schema) {
            payload.schema = schema;
        }

        try {
            setIsProjectSaving(true);
            const updatedProject = await updateProject(projectId, payload);
            setProject(updatedProject);
            toast.success(t('editor.projectSaveSuccess'));
            return updatedProject;
        } catch (error) {
            console.error('Could not update project:', error);
            toast.error(t('editor.projectSaveFailure'));
            return null;
        } finally {
            setIsProjectSaving(false);
        }
    };

    const updatePreviewImage = async (previewImage, targetProjectId = projectId) => {
        if (!targetProjectId) return null;
        try {
            const updated = await updateProject(targetProjectId, {
                previewImage,
            });
            setProject(updated);
            return updated;
        } catch (err) {
            console.warn('Background preview update failed:', err);
            return null;
        }
    };


    return {
        isProjectLoading,
        isProjectSaving,
        updatePreviewImage,
        project,
        createProjectFromDraft,
        saveExistingProject,
    };
};
