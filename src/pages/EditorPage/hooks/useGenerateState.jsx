// Этот файл отвечает за управление состоянием генерации кода

import { useState } from 'react';
import { toast } from 'sonner';
import {compileDashboardSchema} from '../services/editorSchema.js';
import { generateProjectZip } from '../../../api/generateApi.js';

export const useGenerateState = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (snapshot) => {
        try {
            // Сборка схемы
            const { schema, errors } = compileDashboardSchema(snapshot);
            if (errors.length > 0) {
                errors.forEach((err) => toast.error(err));
                return null;
            }

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
            toast.error(error.message || 'Не удалось сгенерировать Streamlit-файл.');
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        handleGenerate,
    };
};