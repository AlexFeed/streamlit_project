import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    deleteDataset,
    getDatasetPreview,
    uploadDataset,
} from "../../../api/datasetsApi.js";

// Hook отвечает за управление состоянием с датасетом

export const DATASET_DRAFT_STORAGE_KEY = 'streamlit-editor-dataset-draft';

// Определение начальных значений состояний датасета из LocalStorage (либо [])
const loadDatasetInfoFromDraft = () => {
    try {
        const saved = localStorage.getItem(DATASET_DRAFT_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed?.datasets) ? parsed.datasets : [];
    } catch (error) {
        console.error('Ошибка восстановления dataset draft:', error);
        return [];
    }
};

export const useDatasetState = ({ useDraftStorage = true }) => {
    const [datasets, setDatasets] = useState(() => {
        if (!useDraftStorage) {
            return [];
        }

        return loadDatasetInfoFromDraft();
    });

    const [isDatasetUploading, setIsDatasetUploading] = useState(false);
    const [isDatasetClearing, setIsDatasetClearing] = useState(false);
    const [isDatasetPreviewLoading, setIsDatasetPreviewLoading] = useState(false);
    const [previewRowsByDataset, setPreviewRowsByDataset] = useState(() => {
        const initial = {};
        datasets.forEach((ds) => {
            if (ds?.datasetId) {
                initial[ds.datasetId] = ds.sampleRows || [];
            }
        });
        return initial;
    });

    // Храним ID датасетов, для которых уже было запрошено полное превью с сервера
    const fetchedPreviewIdsRef = useRef(new Set());

    useEffect(() => {
        const currentIds = new Set(
            datasets.map((ds) => ds?.datasetId).filter(Boolean)
        );

        // Очищаем ref от удалённых датасетов
        fetchedPreviewIdsRef.current.forEach((id) => {
            if (!currentIds.has(id)) {
                fetchedPreviewIdsRef.current.delete(id);
            }
        });

        const pendingDatasets = datasets.filter(
            (ds) => ds?.datasetId && !fetchedPreviewIdsRef.current.has(ds.datasetId)
        );

        if (pendingDatasets.length === 0) {
            return;
        }

        pendingDatasets.forEach((ds) => {
            fetchedPreviewIdsRef.current.add(ds.datasetId);
        });

        const loadPreviewRows = async () => {
            setIsDatasetPreviewLoading(true);

            await Promise.all(
                pendingDatasets.map(async (ds) => {
                    try {
                        const preview = await getDatasetPreview(ds.datasetId);

                        setPreviewRowsByDataset((prev) => ({
                            ...prev,
                            [ds.datasetId]: preview.rows || [],
                        }));

                        setDatasets((current) =>
                            current.map((item) =>
                                item.datasetId === preview.datasetId
                                    ? {
                                        ...item,
                                        fields: preview.fields || item.fields,
                                        fieldTypes: preview.fieldTypes || item.fieldTypes,
                                    }
                                    : item
                            )
                        );
                    } catch (error) {
                        console.error('Ошибка загрузки данных для Canvas:', error);
                        setPreviewRowsByDataset((prev) => ({
                            ...prev,
                            [ds.datasetId]: ds.sampleRows || [],
                        }));
                    }
                })
            );

            setIsDatasetPreviewLoading(false);
        };

        loadPreviewRows();
    }, [datasets]);

    // Сохраняем datasetMeta в localStorage только для /editor
    useEffect(() => {
        if (!useDraftStorage) {
            return;
        }

        try {
            if (datasets.length === 0) {
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
                return;
            }

            localStorage.setItem(
                DATASET_DRAFT_STORAGE_KEY,
                JSON.stringify({
                    datasets,
                })
            );
        } catch (error) {
            console.error('Ошибка сохранения dataset draft:', error);
        }
    }, [datasets, useDraftStorage]);

    // Обработчик загрузки датасета
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return null;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Поддерживаются только CSV-файлы.');
            return null;
        }

        try {
            setIsDatasetUploading(true);

            // Получение данных датасета с сервера (в том числе названия столбцов)
            const datasetInfo = await uploadDataset(file);
            setDatasets((prev) => [...prev, datasetInfo]);
            setPreviewRowsByDataset((prev) => ({
                ...prev,
                [datasetInfo.datasetId]: datasetInfo.sampleRows || [],
            }));

            event.target.value = '';
            return datasetInfo;
        } catch (error) {
            console.error('Ошибка загрузки CSV:', error);
            toast.error('Не удалось загрузить CSV на backend.');
            return null;
        } finally {
            setIsDatasetUploading(false);
        }
    };

    // Удаление загруженного датасета
    const removeDataset = async (datasetId) => {
        if (!datasetId) return;

        // В режиме сохранённого проекта удаляем датасет только локально до нажатия «Сохранить»
        if (!useDraftStorage) {
            setDatasets((prev) => prev.filter((ds) => ds.datasetId !== datasetId));
            setPreviewRowsByDataset((prev) => {
                const next = { ...prev };
                delete next[datasetId];
                return next;
            });
            return;
        }

        try {
            setIsDatasetClearing(true);

            await deleteDataset(datasetId);

            setDatasets((prev) => prev.filter((ds) => ds.datasetId !== datasetId));
            setPreviewRowsByDataset((prev) => {
                const next = { ...prev };
                delete next[datasetId];
                return next;
            });
        } catch (error) {
            console.error('Ошибка удаления датасета:', error);
            toast.error('Не удалось удалить датасет на backend.');
        } finally {
            setIsDatasetClearing(false);
        }
    };

    return {
        datasets,
        setDatasets,
        previewRowsByDataset,
        setPreviewRowsByDataset,
        isDatasetUploading,
        isDatasetClearing,
        isDatasetPreviewLoading,

        handleFileUpload,
        removeDataset,
    };
};