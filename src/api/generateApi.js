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
export const generateProjectZip = async ({ schema, datasetId }) => { // Убрали setGenerationError
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
        throw new Error('Датасет не найден на backend. Загрузите CSV заново.');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Не удалось сгенерировать Streamlit-файл.');
    }

    return response.blob();
};