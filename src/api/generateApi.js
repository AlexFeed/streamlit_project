import { authFetch } from './apiClient.js';

// Generate a standalone Streamlit project.
//
// Request:
// {
//   schema: object,
//   datasetId: string
// }
//
// Response:
// Blob (zip archive)
export const generateProjectZip = async ({ schema }) => {
    const response = await authFetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schema,
        }),
    });
    if (response.status === 404) {
        throw new Error('Dataset not found on the backend. Upload the CSV again.');
    }
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Could not generate the Streamlit file.');
    }
    return response.blob();
};