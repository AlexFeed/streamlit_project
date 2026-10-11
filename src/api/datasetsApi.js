import { authFetch } from './apiClient.js';

// Загрузка CSV датасета на backend
//
// Request:
// multipart/form-data:
// dataset=<csv_file>
//
// Response:
// {
//   datasetId: string,
//   userId: string,
//   name: string,
//   storedName: string,
//   fields: string[],
//   fieldTypes: Record<string, "number" | "datetime" | "string" | "boolean">,
//   sampleRows: Record<string, any>[],
//   size: number,
//   createdAt: string
// }
export const uploadDataset = async (file) => {
    const formData = new FormData();
    formData.append('dataset', file);

    const response = await authFetch('/datasets/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Dataset upload failed');
    }

    return response.json();
};

// Получение meta-информации датасета
//
// Response:
// {
//   datasetId: string,
//   name: string,
//   fields: string[]
// }
export const getDataset = async (datasetId) => {
    const response = await authFetch(`/datasets/${datasetId}`);

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Dataset loading failed');
    }

    return response.json();
};

// Получение выборки строк и типов колонок датасета для предпросмотра на Canvas через Recharts
//
// Query params:
// limit: number (default = 500, max = 1000)
//
// Response:
// {
//   datasetId: string,
//   fields: string[],
//   fieldTypes: Record<string, "number" | "datetime" | "string" | "boolean">,
//   rows: Record<string, any>[],
//   returnedRows: number,
//   limit: number
// }
export const getDatasetPreview = async (datasetId, limit = 500) => {
    const response = await authFetch(
        `/datasets/${datasetId}/preview?limit=${limit}`
    );

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Dataset preview loading failed');
    }

    return response.json();
};

// Удаление датасета
//
// Response:
// {
//   deleted: true
// }
export const deleteDataset = async (datasetId) => {
    const response = await authFetch(`/datasets/${datasetId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Dataset delete failed');
    }

    return response.json();
};
