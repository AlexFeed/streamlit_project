import { useState } from 'react';

import { createPreview } from '../../../api/previewApi.js';
import {
    buildDashboardSchema,
    validateSchema,
} from '../services/editorSchema.js';

// Файл отвечает за управление состоянием preview дашборда
export const usePreviewState = ({
                                    components,
                                    availableFields,
                                    datasetMeta,
                                    setValidationErrors,
                                }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const generatePreview = async ({ schema, datasetId }) => {
        if (!datasetId) {
            setPreviewError('Сначала загрузите CSV');
            return;
        }

        try {
            setIsPreviewLoading(true);
            setPreviewError('');

            const data = await createPreview({
                schema,
                datasetId,
            });

            setPreviewUrl(data.previewUrl);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error('Ошибка preview:', error);
            setPreviewError('Не удалось загрузить preview');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // Полный обработчик Preview:
    // 1. валидирует компоненты
    // 2. строит schema
    // 3. создаёт preview session на backend
    // 4. открывает preview modal
    const handlePreview = async () => {
        const errors = validateSchema(
            components,
            availableFields,
            datasetMeta
        );

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);

        const schema = buildDashboardSchema(
            components,
            availableFields,
            datasetMeta
        );

        await generatePreview({
            schema,
            datasetId: datasetMeta?.datasetId,
        });
    };

    const openPreview = () => setIsPreviewOpen(true);

    const closePreview = () => setIsPreviewOpen(false);

    const clearPreview = () => {
        setPreviewUrl(null);
        setPreviewError('');
        setIsPreviewOpen(false);
    };

    return {
        previewUrl,
        isPreviewLoading,
        previewError,
        isPreviewOpen,

        handlePreview,
        generatePreview,
        clearPreview,
        openPreview,
        closePreview,
    };
};