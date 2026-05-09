import { useState } from 'react';

import { createPreview } from '../../../api/previewApi.js';
import {compileDashboardSchema,} from '../services/editorSchema.js';

// Файл отвечает за управление состоянием preview дашборда
export const usePreviewState = ({ setValidationErrors }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Основной обработчик Preview, принимающий snapshot (Слепок)
    const handlePreview = async (snapshot) => {
        // Сборка схемы из слепка
        const { schema, errors } = compileDashboardSchema(snapshot);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return null;
        }

        setValidationErrors([]);
        setPreviewError('');
        setPreviewUrl(null); // 👈 Сбрасываем старое превью перед загрузкой нового

        const datasetId = snapshot.dataset?.datasetId;

        if (!datasetId) {
            setPreviewError('Сначала загрузите CSV');
            return;
        }

        // Запрос к API
        try {
            setIsPreviewLoading(true);

            const data = await createPreview({
                schema,
                datasetId,
            });

            setPreviewUrl(data.previewUrl);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Ошибка preview:', error);
            setPreviewError(error.message || 'Не удалось загрузить preview');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
    };

    return {
        previewUrl,
        isPreviewLoading,
        previewError,
        isPreviewOpen,
        handlePreview,
        closePreview,
    };
};