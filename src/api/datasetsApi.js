import { authFetch } from './apiClient.js';

// Upload a dataset to the backend.
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
//   format: "csv" | "tsv" | "excel",
//   delimiter: string | null,
//   sheetName: string | null,
//   fields: string[],
//   fieldTypes: Record<string, "number" | "datetime" | "string" | "boolean">,
//   size: number,
//   createdAt: string
// }
export const uploadDataset = async (payload) => {
    const formData = new FormData();

    if (payload && payload.file) {
        const { file, name, delimiter, sheetName } = payload;
        formData.append('dataset', file);
        if (name) formData.append('name', name);
        if (delimiter && delimiter !== 'auto') formData.append('delimiter', delimiter);
        if (sheetName) formData.append('sheetName', sheetName);
    } else {
        throw new Error('No file provided for upload');
    }

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

// Retrieve dataset metadata.
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

// Retrieve a sample of dataset rows and column types for the canvas preview.
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

// Delete a dataset.
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


// Retrieve sheet names from an Excel file.
//
// Request:
// multipart/form-data:
// file=<excel_file>
//
// Response:
// {
//   sheets: string[]
// }
export const inspectExcelSheets = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await authFetch('/datasets/inspect-sheets', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || 'Could not retrieve Excel sheet names');
    }
    return response.json();
};