import { authFetch } from './apiClient.js';

// Получение списка проектов текущего пользователя (краткие карточки для главной страницы)
//
// Response:
// [
//   {
//     id: string,
//     title: string,
//     description: string,
//     datasetName: string | null,
//     createdAt: string,
//     updatedAt: string
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
//   dataset: object | null,
//   editorState: { components: object[] },
//   schema: object | null
// }
//
// Response:
// {
//   id: string,
//   userId: string,
//   title: string,
//   description: string,
//   dataset: object | null,
//   editorState: { components: object[] },
//   schema: object | null,
//   createdAt: string,
//   updatedAt: string
// }
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

// Получение полного проекта по id (для восстановления состояния редактора)
//
// Response:
// {
//   id: string,
//   userId: string,
//   title: string,
//   description: string,
//   dataset: object | null,
//   editorState: { components: object[] },
//   schema: object | null,
//   createdAt: string,
//   updatedAt: string
// }
export const getProject = async (projectId) => {
    const response = await authFetch(`/projects/${projectId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Project loading failed');
    }

    return response.json();
};

// Частичное или полное обновление проекта
//
// Request (все поля опциональны):
// {
//   title?: string,
//   description?: string,
//   dataset?: object | null,
//   editorState?: { components: object[] },
//   schema?: object | null
// }
//
// Response:
// {
//   id: string,
//   userId: string,
//   title: string,
//   description: string,
//   dataset: object | null,
//   editorState: { components: object[] },
//   schema: object | null,
//   createdAt: string,
//   updatedAt: string
// }
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