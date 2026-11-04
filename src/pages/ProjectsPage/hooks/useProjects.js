import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    deleteProject,
    listProjects,
    updateProject,
} from '../../../api/projectsApi.js';
import useTranslation from '../../../shared/translation/useTranslation.js';

export const useProjects = () => {
    const { t } = useTranslation();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError('');

            const serverProjects = await listProjects();
            setProjects(serverProjects);
        } catch (error) {
            console.error('Could not load projects:', error);
            setLoadError('projects.loadError');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const removeProject = useCallback(async (id) => {
        if (!id) return false;

        try {
            await deleteProject(id);
            setProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
            return true;
        } catch (error) {
            console.error('Could not delete project:', error);
            toast.error(t('projects.deleteError'));
            return false;
        }
    }, [t]);

    const updateProjectTitle = useCallback(async (id, newTitle) => {
        if (!id) return false;

        try {
            await updateProject(id, { title: newTitle });
            setProjects((prevProjects) => prevProjects.map((p) =>
                p.id === id
                    ? { ...p, title: newTitle, updatedAt: new Date().toISOString() }
                    : p
            ));
            return true;
        } catch (error) {
            console.error('Could not update project title:', error);
            toast.error(t('projects.saveTitleError'));
            return false;
        }
    }, [t]);

    const updateProjectDescription = useCallback(async (id, newDesc) => {
        if (!id) return false;

        try {
            await updateProject(id, { description: newDesc });
            setProjects((prevProjects) => prevProjects.map((p) =>
                p.id === id
                    ? { ...p, description: newDesc, updatedAt: new Date().toISOString() }
                    : p
            ));
            return true;
        } catch (error) {
            console.error('Could not update project description:', error);
            toast.error(t('projects.saveDescriptionError'));
            return false;
        }
    }, [t]);

    return {
        projects,
        isLoading,
        loadError,
        fetchProjects,
        removeProject,
        updateProjectTitle,
        updateProjectDescription,
    };
};

export default useProjects;