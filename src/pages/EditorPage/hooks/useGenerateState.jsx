// Этот файл отвечает за управление состоянием генерации кода

import { useState } from 'react';
import {compileDashboardSchema} from '../services/editorSchema.js';
import { generateProjectZip } from '../../../api/generateApi.js';

export const useGenerateState = ({ setValidationErrors }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    const handleGenerate = async (snapshot) => {
        try {
            // Сборка схемы
            const { schema, errors } = compileDashboardSchema(snapshot);
            if (errors.length > 0) {
                setValidationErrors(errors);
                return null;
            }

            setValidationErrors([]);
            setGenerationError('');
            setIsGenerating(true);

            // Отправка на бэкенд
            const blob = await generateProjectZip({
                schema,
                datasetId: snapshot.dataset?.datasetId,
            });

            // Скачивание архива
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dashboard_project.zip';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Ошибка генерации дашборда:', error);
            setGenerationError(error.message || 'Не удалось сгенерировать Streamlit-файл.');
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        generationError,
        handleGenerate,
    };
};