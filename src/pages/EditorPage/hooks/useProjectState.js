import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { getProject, createProject, updateProject } from '../../../api/projectsApi.js';
import {compileDashboardSchema} from '../services/editorSchema.js';
import {DATASET_DRAFT_STORAGE_KEY, EDITOR_DRAFT_STORAGE_KEY} from "../../../shared/constants/storageKeys.js";
import useTranslation from '../../../shared/translation/useTranslation.js';

export const useProjectState = ({
                                    projectId,
                                    setComponents,
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
                setComponents(fetchedProject.editorState?.components || []);
                setDatasets(fetchedProject.datasets || []);
            } catch (error) {
                console.error('Could not load project:', error);
                toast.error(translationRef.current('editor.projectLoadFailure'));
            } finally {
                setIsProjectLoading(false);
            }
        };

        loadProject();
    }, [projectId, setComponents, setDatasets]);

    const createProjectFromDraft = async (snapshot) => {
        const { schema, errors } = compileDashboardSchema(snapshot, t);
        if (errors.length > 0) {
            errors.forEach((err) => toast.error(err));
            return null;
        }

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            previewImage: snapshot.previewImage,
            datasets: snapshot.datasets,
            editorState: {
                components: snapshot.components,
                previewImage: snapshot.previewImage,
            },
            schema,
        };

        try {
            setIsProjectSaving(true);
            const savedProject = await createProject(payload);

            localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
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

        const { schema, errors } = compileDashboardSchema(snapshot, t);
        if (errors.length > 0) {
            errors.forEach((err) => toast.error(err));
            return null;
        }

        const payload = {
            title: snapshot.title,
            description: snapshot.description,
            previewImage: snapshot.previewImage,
            datasets: snapshot.datasets,
            editorState: {
                components: snapshot.components,
                previewImage: snapshot.previewImage,
            },
            schema,
        };

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

    return {
        isProjectLoading,
        isProjectSaving,
        project,
        createProjectFromDraft,
        saveExistingProject,
    };
};