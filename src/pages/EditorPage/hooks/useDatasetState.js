import { useEffect, useState } from 'react';
import {
    deleteDataset,
    getDatasetPreview,
    uploadDataset,
} from "../../../api/datasetsApi.js";

// Hook отвечает за управление состоянием с датасетом

export const DATASET_DRAFT_STORAGE_KEY = 'streamlit-editor-dataset-draft';

// Определение начальных значений состояний датасета из LocalStorage (либо null)
const loadDatasetInfoFromDraft = () => {
    try {
        const saved = localStorage.getItem(DATASET_DRAFT_STORAGE_KEY);

        if (!saved) {
            return null;
        }

        const parsed = JSON.parse(saved);

        return parsed?.dataset || null;
    } catch (error) {
        console.error('Ошибка восстановления dataset draft:', error);
        return null;
    }
};

export const useDatasetState = ({ useDraftStorage = true }) => {
    const [dataset, setDataset] = useState(() => {
        if (!useDraftStorage) {
            return null;
        }

        return loadDatasetInfoFromDraft();
    });

    const [datasetError, setDatasetError] = useState('');
    const [isDatasetUploading, setIsDatasetUploading] = useState(false);
    const [isDatasetClearing, setIsDatasetClearing] = useState(false);
    const [isDatasetPreviewLoading, setIsDatasetPreviewLoading] = useState(false);
    const [previewRows, setPreviewRows] = useState(
        () => dataset?.sampleRows || []
    );

    const availableFields = dataset?.fields || [];
    const fieldTypes = dataset?.fieldTypes || {};

    useEffect(() => {
        if (!dataset?.datasetId) {
            return undefined;
        }

        let isCancelled = false;

        const loadPreviewRows = async () => {
            try {
                setIsDatasetPreviewLoading(true);
                const preview = await getDatasetPreview(dataset.datasetId);

                if (!isCancelled) {
                    setPreviewRows(preview.rows || []);
                    setDataset((current) => {
                        if (current?.datasetId !== preview.datasetId) {
                            return current;
                        }

                        return {
                            ...current,
                            fields: preview.fields || current.fields,
                            fieldTypes: preview.fieldTypes || current.fieldTypes,
                        };
                    });
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Ошибка загрузки данных для Canvas:', error);
                    setPreviewRows(dataset.sampleRows || []);
                }
            } finally {
                if (!isCancelled) {
                    setIsDatasetPreviewLoading(false);
                }
            }
        };

        loadPreviewRows();

        return () => {
            isCancelled = true;
        };
    }, [dataset?.datasetId, dataset?.sampleRows]);

    // Сохраняем datasetMeta в localStorage только для /editor
    useEffect(() => {
        if (!useDraftStorage) {
            return;
        }

        try {
            if (!dataset) {
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
                return;
            }

            localStorage.setItem(
                DATASET_DRAFT_STORAGE_KEY,
                JSON.stringify({
                    dataset: dataset,
                })
            );
        } catch (error) {
            console.error('Ошибка сохранения dataset draft:', error);
        }
    }, [dataset, useDraftStorage]);

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

            // Получение данных датасета с сервера (в том числе названия столбцов)
            const datasetInfo = await uploadDataset(file);
            setDataset(datasetInfo);
            setPreviewRows(datasetInfo.sampleRows || []);

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
        if (!dataset?.datasetId) {
            setDataset(null);
            setPreviewRows([]);

            if (useDraftStorage) {
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
            }

            return;
        }

        try {
            setIsDatasetClearing(true);

            await deleteDataset(dataset.datasetId)

            setDataset(null);
            setPreviewRows([]);
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
        dataset,
        setDataset,
        availableFields,
        fieldTypes,
        previewRows: dataset?.datasetId ? previewRows : [],
        datasetError,
        isDatasetUploading,
        isDatasetClearing,
        isDatasetPreviewLoading,

        handleFileUpload,
        clearDataset,
    };
};
