import { authFetch } from './apiClient.js';

// Create a preview session for the given dashboard schema.
//
// Request body:
// {
//   schema: object
// }
//
// Response:
// {
//   sessionId: string,
//   previewUrl: string,
//   revision: number,
//   expiresIn: number
// }
export const createPreviewSession = async ({ schema }) => {
    const response = await authFetch('/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schema,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Could not start the preview session.');
    }

    return response.json();
};

// Update an existing preview session schema.
export const updatePreviewSession = async (sessionId, { schema }) => {
    const response = await authFetch(`/preview/${sessionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schema,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Could not update the preview session.');
    }

    return response.json();
};

// Delete/close a preview session on the backend.
export const deletePreviewSession = async (sessionId) => {
    const response = await authFetch(`/preview/${sessionId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Could not close the preview session.');
    }

    return response.json();
};