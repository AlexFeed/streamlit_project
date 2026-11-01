// Editor components
import ComponentsPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import SaveProjectModal from './components/modals/SaveProjectModal';
import UploadDatasetModal from "./components/modals/UploadDatasetModal.jsx";
import { useParams, useNavigate } from 'react-router-dom';
import {
    closestCenter,
    DndContext,
    DragOverlay,
} from '@dnd-kit/core';


// State hooks
import { useEditorState } from './hooks/useEditorState';
import {useDatasetState} from './hooks/useDatasetState';

import { useCallback, useState } from 'react';
import { useProjectState } from './hooks/useProjectState.js';
import {useGenerateState} from "./hooks/useGenerateState.jsx";
import { useEditorDnd } from './hooks/useEditorDnd.js';
import './EditorPage.css';
import useTranslation from '../../shared/i18n/useTranslation.js';


const EditorPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const isDraftMode = !(projectId);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isUploadDatasetModalOpen, setIsUploadDatasetModalOpen] = useState(false);

    const {
        datasets,
        setDatasets,
        previewRowsByDataset,
        isDatasetUploading,
        isDatasetClearing,
        isDatasetPreviewLoading,
        uploadNewDataset,
        removeDataset,
    } = useDatasetState({ useDraftStorage: isDraftMode });

    const {
        components,
        setComponents,
        selectedId,
        selectedComponent,
        addComponent,
        reorderComponent,
        duplicateComponent,
        setDashboardLayout,
        selectComponent,
        updateComponent,
        deleteComponent,
        deleteSelectedComponent,
        clearCanvas,
    } = useEditorState({
        useDraftStorage: isDraftMode,
        defaultDatasetId: datasets[0]?.datasetId || '',
    });
    const addLocalizedComponent = useCallback((item, targetIndex, targetLayout) => {
        addComponent(item, targetIndex, targetLayout);
    }, [addComponent]);

    const {
        isProjectLoading,
        isProjectSaving,
        project,
        createProjectFromDraft,
        saveExistingProject,
    } = useProjectState({
        projectId,
        setComponents,
        setDatasets,
    });

    const {
        isGenerating,
        handleGenerate
    } = useGenerateState();

    const {
        sensors,
        activeDrag,
        handleDragStart,
        handleDragCancel,
        handleDragEnd,
    } = useEditorDnd({
        components,
        addComponent: addLocalizedComponent,
        reorderComponent,
    });

    const handleRemoveDataset = async (datasetId) => {
        const targetDataset = datasets.find((ds) => ds.datasetId === datasetId);
        const datasetName = targetDataset?.name || t('editor.datasetFallbackName');
        const confirmed = window.confirm(
            t('editor.deleteDatasetConfirm', { name: datasetName })
        );
        if (!confirmed) {
            return;
        }

        const remainingDatasets = datasets.filter((ds) => ds.datasetId !== datasetId);
        const fallbackDataset = remainingDatasets[0] || null;
        const fallbackDatasetId = fallbackDataset?.datasetId || '';
        const fallbackFields = new Set(fallbackDataset?.fields || []);

        await removeDataset(datasetId);

        components.forEach((component) => {
            if (component.datasetId && component.datasetId !== datasetId) {
                return;
            }

            updateComponent(component.id, (current) => {
                const cleanedBindings = { ...current.bindings };
                Object.keys(cleanedBindings).forEach((key) => {
                    if (cleanedBindings[key] && !fallbackFields.has(cleanedBindings[key])) {
                        cleanedBindings[key] = '';
                    }
                });

                return {
                    ...current,
                    datasetId: fallbackDatasetId,
                    bindings: cleanedBindings,
                };
            });
        });
    };

    const getProjectSnapshot = (overrideTitle, overrideDescription) => ({
        title: overrideTitle ?? project?.title ?? 'Untitled dashboard',
        description: overrideDescription ?? project?.description ?? '',
        components,
        datasets: datasets.map((ds) => {
            const metadata = { ...ds };
            delete metadata.sampleRows;
            return metadata;
        })
    });


    const handleGoHome = () => {
        const confirmed = window.confirm(
            t('editor.leaveConfirm')
        );

        if (!confirmed) {
            return;
        }

        navigate('/');
    };

    const handleSaveClick = async () => {
        if (isDraftMode) {
            setIsSaveModalOpen(true);
        } else {
            const snapshot = getProjectSnapshot();
            await saveExistingProject(snapshot);
        }
    };

    const handleConfirmSave = async ({ title, description }) => {
        const snapshot = getProjectSnapshot(title, description);
        const saved = await createProjectFromDraft(snapshot);

        if (saved) {
            setIsSaveModalOpen(false);
            navigate(`/editor/${saved.id}`, { replace: true });
        }
    };

    const handleModalDatasetConfirmUpload = async (uploadPayload) => {
        const res = await uploadNewDataset(uploadPayload);
        return Boolean(res);
    };

    const onGenerateClick = async () => {
        const snapshot = getProjectSnapshot();
        await handleGenerate(snapshot);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
        >
        <div className="editor-page">
            <div className="editor-layout">
                <ComponentsPalette onAddComponent={addLocalizedComponent} onGoHome={handleGoHome}/>

                <div className="editor-main">
                    <EditorHeader
                        onClearCanvas={clearCanvas}
                        onGenerateDashboard={onGenerateClick}
                        datasets={datasets}
                        onRemoveDataset={handleRemoveDataset}
                        isDatasetClearing={isDatasetClearing}
                        isGenerating={isGenerating}
                        onSaveProject={handleSaveClick}
                        onGoHome={handleGoHome}
                        onUploadDataset={() => setIsUploadDatasetModalOpen(true)}
                    />

                    <UploadDatasetModal isOpen={isUploadDatasetModalOpen}
                                        isUploading={isDatasetUploading}
                                        onClose={() => setIsUploadDatasetModalOpen(false)}
                                        onConfirm={handleModalDatasetConfirmUpload}/>

                    <SaveProjectModal
                        isOpen={isSaveModalOpen}
                        isSaving={isProjectSaving}
                        onClose={() => setIsSaveModalOpen(false)}
                        onConfirm={handleConfirmSave}
                    />

                    {isProjectLoading && (
                        <div className="editor-loading-wrap">
                            <div className="editor-loading">
                                {t('editor.loadingProject')}
                            </div>
                        </div>
                    )}

                    {isProjectSaving && (
                        <div className="editor-loading-wrap">
                            <div className="editor-loading">
                                {t('editor.savingProject')}
                            </div>
                        </div>
                    )}

                    <div className={`editor-workspace${selectedComponent ? ' has-properties' : ''}`}>
                        <main className="editor-canvas-area">
                            <Canvas
                                components={components}
                                selectedId={selectedId}
                                onSelect={selectComponent}
                                onDelete={deleteComponent}
                                onDuplicate={duplicateComponent}
                                onLayoutChange={setDashboardLayout}
                                isDragging={Boolean(activeDrag)}
                                datasets={datasets}
                                previewRowsByDataset={previewRowsByDataset}
                                isDataLoading={isDatasetPreviewLoading}
                            />
                        </main>

                        <PropertiesPanel
                            selectedComponent={selectedComponent}
                            onUpdateComponent={updateComponent}
                            onDeleteSelected={deleteSelectedComponent}
                            onClose={() => selectComponent(null)}
                            datasets={datasets}
                        />
                    </div>
                </div>
            </div>
        </div>
            <DragOverlay dropAnimation={null}>
                {activeDrag && (
                    <div className="editor-drag-overlay">
                        <p className="editor-drag-overlay-title">
                            {t(activeDrag.paletteItem?.labelKey || 'editor.dragOverlayTitle')}
                        </p>
                        <p className="editor-drag-overlay-description">
                            {t('editor.dragOverlayDescription')}
                        </p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default EditorPage;
