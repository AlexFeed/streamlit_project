import { authFetch } from './apiClient.js';

// Получение списка проектов текущего пользователя
//
// Response:
// [
//   {
//     id: string,
//     title: string,
//     description: string,
//     updatedAt: string,
//     ...
//   }
// ]
export const listProjects = async () => {
    const response = await authFetch('/projects');

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Projects loading failed');
    }

    return response.json();
};

// Создание нового проекта
//
// Request:
// {
//   title: string,
//   description: string,
//   schema: object,
//   datasetMeta: object,
//   editorState: object
// }
//
// Response:
// Полный объект созданного проекта
export const createProject = async (payload) => {
    const response = await authFetch('/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Project create failed');
    }

    return response.json();
};

// Получение проекта по id
//
// Response:
// Полный объект проекта
export const getProject = async (projectId) => {
    const response = await authFetch(`/projects/${projectId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Project loading failed');
    }

    return response.json();
};

// Обновление проекта
//
// Request:
// Частичный или полный payload проекта
//
// Response:
// Обновлённый объект проекта
export const updateProject = async (projectId, payload) => {
    const response = await authFetch(`/projects/${projectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Project update failed');
    }

    return response.json();
};

// Удаление проекта
//
// Response:
// {
//   deleted: true
// }
export const deleteProject = async (projectId) => {
    const response = await authFetch(`/projects/${projectId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Project delete failed');
    }

    return response.json();
};