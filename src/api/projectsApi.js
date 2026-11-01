import { authFetch } from './apiClient.js';

// Retrieve the current user's project cards.
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

// Create a project.
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

// Retrieve a full project for restoring the editor state.
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

// Partially or fully update a project.
//
// Request body fields are optional.
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

// Delete a project.
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