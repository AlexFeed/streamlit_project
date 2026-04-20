import { useEffect, useState } from 'react';
import Papa from 'papaparse';

// Hook отвечает за управление состоянием с датасетом

const DATASET_STORAGE_KEY = 'dataset_state_v1';

// Для MVP максимальный размер файлов, чтобы не было проблем с производительностью (frontend file upload)
const MAX_FILE_SIZE_MB = 10;

// Определение начальных значений состояний из LocalStorage (либо null)
const getInitialState = () => {
    try {
        const saved = localStorage.getItem(DATASET_STORAGE_KEY);
        if (!saved) {
            return {
                availableFields: [],
                datasetMeta: null,
                datasetWarning: false,
            };
        }

        const parsed = JSON.parse(saved);

        return {
            availableFields: parsed.availableFields || [],
            datasetMeta: parsed.datasetMeta || null,
            // ⚠️ файл не восстанавливается → показываем warning
            datasetWarning: !!parsed.availableFields?.length,
        };
    } catch (error) {
        console.error('Ошибка восстановления dataset state:', error);
        return {
            availableFields: [],
            datasetMeta: null,
            datasetWarning: false,
        };
    }
};

export const useDatasetState = () => {
    // --- INIT STATE ---
    const initial = getInitialState();

    const [availableFields, setAvailableFields] = useState(initial.availableFields);
    const [datasetMeta, setDatasetMeta] = useState(initial.datasetMeta);
    const [datasetWarning, setDatasetWarning] = useState(initial.datasetWarning);
    const [datasetError, setDatasetError] = useState('');

    // --- При обновлении данных обновляется LocalStorage ---
    useEffect(() => {
        try {
            localStorage.setItem(
                DATASET_STORAGE_KEY,
                JSON.stringify({
                    availableFields,
                    datasetMeta,
                })
            );
        } catch (error) {
            console.error('Ошибка сохранения dataset state:', error);
        }
    }, [availableFields, datasetMeta]);

    // --- Обработчик загрузки датасета ---
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setDatasetError('');

        // Проверка расширения
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setDatasetError('Поддерживаются только CSV-файлы.');
            return;
        }

        // Проверка размера
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setDatasetError(
                `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE_MB} MB.`
            );
            return;
        }

        try {
            Papa.parse(file, {
                header: true,
                preview: 1, // читаем только первую строку
                skipEmptyLines: true,

                complete: (result) => {
                    const columns = result.meta.fields || [];

                    if (!columns.length) {
                        setDatasetError('Не удалось извлечь названия колонок.');
                        return;
                    }

                    setAvailableFields(columns);

                    setDatasetMeta({
                        name: file.name,
                        size: file.size,
                    });

                    setDatasetWarning(false);
                },

                error: (error) => {
                    console.error('Ошибка парсинга CSV:', error);
                    setDatasetError('Ошибка при чтении CSV-файла.');
                },
            });
        } catch (error) {
            console.error('Ошибка чтения CSV:', error);
            setDatasetError('Ошибка при чтении CSV-файла.');
        }
    };

    // --- CLEAR DATASET ---
    const clearDataset = () => {
        setAvailableFields([]);
        setDatasetMeta(null);
        setDatasetWarning(false);
        setDatasetError('');

        localStorage.removeItem(DATASET_STORAGE_KEY);
    };

    // --- DISMISS WARNING ---
    const dismissDatasetWarning = () => {
        setDatasetWarning(false);
    };

    return {
        availableFields,
        datasetMeta,
        datasetWarning,
        datasetError,

        handleFileUpload,
        clearDataset,
        dismissDatasetWarning,
    };
};