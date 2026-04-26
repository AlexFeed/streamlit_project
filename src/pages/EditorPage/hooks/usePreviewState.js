import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';


// Файл отвечает за управление состоянием preview дашборда
export const usePreviewState = () => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const generatePreview = async ({
                                       schema,
                                       datasetId,
                                   }) => {
        if (!datasetId) {
            setPreviewError('Сначала загрузите CSV');
            return;
        }

        try {
            setIsPreviewLoading(true);
            setPreviewError('');

            const response = await fetch(`${API_BASE_URL}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schema, datasetId }),
            });

            if (!response.ok) {
                throw new Error(`Preview error: ${response.status}`);
            }

            const data = await response.json();

            setPreviewUrl(data.previewUrl);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error(error);
            setPreviewError('Не удалось загрузить preview');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const openPreview = () => setIsPreviewOpen(true);
    const closePreview = () => setIsPreviewOpen(false);

    const clearPreview = () => {
        setPreviewUrl(null);
        setPreviewError('');
    };

    return {
        previewUrl,
        isPreviewLoading,
        previewError,
        isPreviewOpen,

        generatePreview,
        clearPreview,
        openPreview,
        closePreview
    };
};