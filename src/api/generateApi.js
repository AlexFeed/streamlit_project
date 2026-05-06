import { authFetch } from './apiClient.js';

// Генерация standalone Streamlit проекта
//
// Request:
// {
//   schema: object,
//   datasetId: string
// }
//
// Response:
// Blob (zip archive)
export const generateProjectZip = async ({schema, datasetId, setGenerationError}) => {
    const response = await authFetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            schema,
            datasetId,
        }),
    });

    if (response.status === 404) {
        setGenerationError('Датасет не найден на backend. Загрузите CSV заново.');
        return;
    }

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Generate failed');
    }

    return response.blob();
};