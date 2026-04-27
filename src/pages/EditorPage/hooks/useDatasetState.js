import { useEffect, useState } from 'react';
import Papa from 'papaparse';

// Hook отвечает за управление состоянием с датасетом

export const DATASET_DRAFT_STORAGE_KEY = 'streamlit-editor-dataset-draft';
const API_BASE_URL = 'http://localhost:8000';

// Определение начальных значений состояний датасета из LocalStorage (либо null)
const loadDraftDatasetMeta = () => {
    try {
        const saved = localStorage.getItem(DATASET_DRAFT_STORAGE_KEY);

        if (!saved) {
            return null;
        }

        const parsed = JSON.parse(saved);

        return parsed?.datasetMeta || null;
    } catch (error) {
        console.error('Ошибка восстановления dataset draft:', error);
        return null;
    }
};

export const useDatasetState = ({ useDraftStorage = true }) => {
    const [datasetMeta, setDatasetMeta] = useState(() => {
        if (!useDraftStorage) {
            return null;
        }

        return loadDraftDatasetMeta();
    });

    const [datasetError, setDatasetError] = useState('');
    const [isDatasetUploading, setIsDatasetUploading] = useState(false);
    const [isDatasetClearing, setIsDatasetClearing] = useState(false);

    const availableFields = datasetMeta?.fields || [];

    // Сохраняем datasetMeta в localStorage только для /editor
    useEffect(() => {
        if (!useDraftStorage) {
            return;
        }

        try {
            if (!datasetMeta) {
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
                return;
            }

            localStorage.setItem(
                DATASET_DRAFT_STORAGE_KEY,
                JSON.stringify({
                    datasetMeta,
                })
            );
        } catch (error) {
            console.error('Ошибка сохранения dataset draft:', error);
        }
    }, [datasetMeta, useDraftStorage]);

    // Обработчик загрузки датасета
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setDatasetError('');

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setDatasetError('Поддерживаются только CSV-файлы.');
            return;
        }

        try {
            setIsDatasetUploading(true);

            const formData = new FormData();
            formData.append('dataset', file);

            // Отправка датасета на сервер
            const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки датасета: ${response.status}`);
            }

            // Получение мета данных датасета с сервера (в том числе названия столбцов)
            const meta = await response.json();
            setDatasetMeta(meta);

            event.target.value = '';
        } catch (error) {
            console.error('Ошибка загрузки CSV:', error);
            setDatasetError('Не удалось загрузить CSV на backend.');
        } finally {
            setIsDatasetUploading(false);
        }
    };

    // Удаление загруженного датасета
    const clearDataset = async () => {
        if (!datasetMeta?.datasetId) {
            setDatasetMeta(null);

            if (useDraftStorage) {
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
            }

            return;
        }

        try {
            setIsDatasetClearing(true);

            await fetch(`${API_BASE_URL}/datasets/${datasetMeta.datasetId}`, {
                method: 'DELETE',
            });

            setDatasetMeta(null);
            setDatasetError('');

            if (useDraftStorage) {
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Ошибка удаления датасета:', error);
            setDatasetError('Не удалось удалить датасет на backend.');
        } finally {
            setIsDatasetClearing(false);
        }
    };

    return {
        datasetMeta,
        setDatasetMeta,
        availableFields,
        datasetError,
        isDatasetUploading,
        isDatasetClearing,

        handleFileUpload,
        clearDataset,
    };
};