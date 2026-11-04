import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    deleteDataset,
    getDatasetPreview,
    inspectExcelSheets,
    uploadDataset,
} from "../../../api/datasetsApi.js";
import {DATASET_DRAFT_STORAGE_KEY} from "../../../shared/constants/storageKeys.js";
import useTranslation from '../../../shared/translation/useTranslation.js';

const loadDatasetInfoFromDraft = () => {
    try {
        const saved = localStorage.getItem(DATASET_DRAFT_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed?.datasets) ? parsed.datasets : [];
    } catch (error) {
        console.error('Could not restore the dataset draft:', error);
        return [];
    }
};

export const useDatasetState = ({ useDraftStorage = true }) => {
    const { t } = useTranslation();
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

    const fetchedPreviewIdsRef = useRef(new Set());

    useEffect(() => {
        const currentIds = new Set(
            datasets.map((ds) => ds?.datasetId).filter(Boolean)
        );

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
                        console.error('Could not load dataset preview:', error);
                        toast.error(t('editor.datasetPreviewFailure'));
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
    }, [datasets, t]);

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
            console.error('Could not save the dataset draft:', error);
        }
    }, [datasets, useDraftStorage]);

    const uploadNewDataset = async (payload) => {
        try {
            setIsDatasetUploading(true);
            const datasetInfo = await uploadDataset(payload);
            setDatasets((prev) => [...prev, datasetInfo]);
            toast.success(t('editor.datasetUploadSuccess', { name: datasetInfo.name }));
            return datasetInfo;
        } catch (error) {
            console.error('Could not upload dataset:', error);
            toast.error(t('editor.datasetUploadFailure'));
            return null;
        } finally {
            setIsDatasetUploading(false);
        }
    };

    const removeDataset = async (datasetId) => {
        if (!datasetId) return;
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
            console.error('Could not delete dataset:', error);
            toast.error(t('editor.datasetDeleteFailure'));
        } finally {
            setIsDatasetClearing(false);
        }
    };

    const inspectSheets = async (file) => {
        return inspectExcelSheets(file);
    };

    return {
        datasets,
        setDatasets,
        previewRowsByDataset,
        setPreviewRowsByDataset,
        isDatasetUploading,
        isDatasetClearing,
        isDatasetPreviewLoading,

        uploadNewDataset,
        removeDataset,
        inspectSheets,
    };
};