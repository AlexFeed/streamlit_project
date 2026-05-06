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
//   name: string,
//   fields: string[]
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