import { useEffect, useState } from 'react';
import Papa from 'papaparse';

// Hook отвечает за управление состоянием с датасетом

const DATASET_STORAGE_KEY = 'dataset_state_v2';
const API_BASE_URL = 'http://localhost:8000';

// Определение начальных значений состояний датасета из LocalStorage (либо null)
const getInitialDatasetState = () => {
    try {
        const saved = localStorage.getItem(DATASET_STORAGE_KEY);
        if (!saved) {
            return {
                datasetMeta: null,
            };
        }

        const parsed = JSON.parse(saved);

        return {
            datasetMeta: parsed.datasetMeta || null,
        };
    } catch (error) {
        console.error('Ошибка восстановления dataset state:', error);
        return {
            datasetMeta: null,
        };
    }
};

export const useDatasetState = () => {
    const initial = getInitialDatasetState();

    const [datasetMeta, setDatasetMeta] = useState(initial.datasetMeta);
    const [datasetError, setDatasetError] = useState('');
    const [isDatasetUploading, setIsDatasetUploading] = useState(false);
    const [isDatasetClearing, setIsDatasetClearing] = useState(false);

    const availableFields = datasetMeta?.fields || [];

    // Фиксируем каждое обновление данных о датасете в LocalStorage
    useEffect(() => {
        try {
            localStorage.setItem(
                DATASET_STORAGE_KEY,
                JSON.stringify({
                    datasetMeta,
                })
            );
        } catch (error) {
            console.error('Ошибка сохранения dataset state:', error);
        }
    }, [datasetMeta]);

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
            localStorage.removeItem(DATASET_STORAGE_KEY);
            return;
        }

        try {
            setIsDatasetClearing(true);

            await fetch(`${API_BASE_URL}/datasets/${datasetMeta.datasetId}`, {
                method: 'DELETE',
            });

            setDatasetMeta(null);
            setDatasetError('');
            localStorage.removeItem(DATASET_STORAGE_KEY);
        } catch (error) {
            console.error('Ошибка удаления датасета:', error);
            setDatasetError('Не удалось удалить датасет на backend.');
        } finally {
            setIsDatasetClearing(false);
        }
    };

    return {
        datasetMeta,
        availableFields,
        datasetError,
        isDatasetUploading,
        isDatasetClearing,

        handleFileUpload,
        clearDataset,
    };
};