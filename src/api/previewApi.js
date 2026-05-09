import { authFetch } from './apiClient.js';

// Создание preview-сессии
//
// Request:
// {
//   schema: object,
//   datasetId: string
// }
//
// Response:
// {
//   sessionId: string,
//   previewUrl: string
// }
export const createPreview = async ({ schema, datasetId }) => {
    console.log(schema)
    const response = await authFetch('/preview/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schema,
            datasetId,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Preview failed');
    }

    return response.json();
};