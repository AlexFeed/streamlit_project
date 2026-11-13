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

import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectState } from './hooks/useProjectState.js';
import {useGenerateState} from "./hooks/useGenerateState.jsx";
import { useEditorDnd } from './hooks/useEditorDnd.js';
import './EditorPage.css';
import useTranslation from '../../shared/translation/useTranslation.js';
import { captureCanvasPreview } from './services/captureCanvasPreview.js';
import {usePreviewState} from "./hooks/usePreviewState.js";
import PreviewModal from "./components/modals/PreviewModal.jsx";
import PageTabs from './components/PageTabs.jsx';
import { normalizeComponentsByPage } from './services/pageState.js';
import { pointerWithin } from '@dnd-kit/core';

const editorCollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) {
        return [...pointerHits].sort((left, right) => {
            const leftIsGroup = String(left.id).startsWith('layout-group-');
            const rightIsGroup = String(right.id).startsWith('layout-group-');
            return Number(rightIsGroup) - Number(leftIsGroup);
        });
    }
    return closestCenter(args);
};


const EditorPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const translationRef = useRef(t);
    useEffect(() => {
        translationRef.current = t;
    }, [t]);

    const isDraftMode = !(projectId);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isUploadDatasetModalOpen, setIsUploadDatasetModalOpen] = useState(false);
    const canvasRef = useRef(null);

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
        pageComponents,
        pages,
        activePageId,
        setEditorState,
        selectedId,
        selectedComponent,
        addComponent,
        reorderComponent,
        moveComponent,
        duplicateComponent,
        setDashboardLayout,
        selectComponent,
        updateComponent,
        deleteComponent,
        deleteSelectedComponent,
        selectPage,
        addPage,
        renamePage,
        deletePage,
        clearCanvas,
        undo,
        redo,
        canUndo,
        canRedo,
        markAsSaved,
        isDirty,
    } = useEditorState({
        useDraftStorage: isDraftMode,
        defaultDatasetId: datasets[0]?.datasetId || '',
    });

    const addLocalizedComponent = useCallback((item, targetIndex, targetLayout, parentId) => {
        addComponent(item, targetIndex, targetLayout, parentId);
    }, [addComponent]);

    const {
        isProjectLoading,
        isProjectSaving,
        updatePreviewImage,
        project,
        createProjectFromDraft,
        saveExistingProject,
    } = useProjectState({
        projectId,
        setEditorState,
        setDatasets,
    });

    const {
        isGenerating,
        handleGenerate
    } = useGenerateState();

    const {
        isPreviewLoading,
        previewUrl,
        isPreviewModalOpen,
        handleOpenPreview,
        handleClosePreview,
    } = usePreviewState();

    const {
        sensors,
        activeDrag,
        handleDragStart,
        handleDragCancel,
        handleDragEnd,
    } = useEditorDnd({
        components: pageComponents,
        addComponent: addLocalizedComponent,
        reorderComponent,
    });

    useEffect(() => {
        const handleHistoryShortcut = (event) => {
            const target = event.target;
            const isEditingText = target instanceof HTMLElement
                && (target.isContentEditable
                    || ['INPUT', 'TEXTAREA'].includes(target.tagName));
            if (isEditingText || !(event.ctrlKey || event.metaKey)) return;

            const key = event.key.toLowerCase();
            if (key === 'z' && event.shiftKey) {
                event.preventDefault();
                redo();
            } else if (key === 'y' && !event.shiftKey) {
                event.preventDefault();
                redo();
            } else if (key === 'z') {
                event.preventDefault();
                undo();
            }
        };

        window.addEventListener('keydown', handleHistoryShortcut);
        return () => window.removeEventListener('keydown', handleHistoryShortcut);
    }, [redo, undo]);

    // Flag to confirm saving when changes are unsaved.
    const hasUnsavedChanges = isDirty || isProjectSaving;

    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
    useEffect(() => {
        hasUnsavedChangesRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    useEffect(() => {
        // Push a guard entry so the browser's back button triggers popstate before leaving
        if (!window.history.state?.isEditorGuard) {
            window.history.pushState({ isEditorGuard: true }, '', window.location.href);
        }

        // Prevent infinite popstate loops when programmatically navigating back after user confirmation
        let isNavigatingAway = false;

        const handleBeforeUnload = (event) => {
            if (!hasUnsavedChangesRef.current) return;
            event.preventDefault();
            // Required standard assignment for cross-browser native reload prompt
            event.returnValue = '';
        };

        const handlePopState = () => {
            if (isNavigatingAway) return;

            if (!hasUnsavedChangesRef.current) {
                isNavigatingAway = true;
                window.history.back();
                return;
            }

            const confirmed = window.confirm(
                translationRef.current('editor.leaveConfirm')
            );

            if (confirmed) {
                isNavigatingAway = true;
                window.history.back();
            } else {
                // Restore the guard entry so subsequent back button clicks remain intercepted
                window.history.pushState({ isEditorGuard: true }, '', window.location.href);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

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
                    if (Array.isArray(cleanedBindings[key])) {
                        cleanedBindings[key] = cleanedBindings[key].filter(
                            (field) => fallbackFields.has(field)
                        );
                    } else if (cleanedBindings[key] && !fallbackFields.has(cleanedBindings[key])) {
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

    const getProjectSnapshot = (overrideTitle, overrideDescription, previewImage) => ({
        title: overrideTitle ?? project?.title ?? 'Untitled dashboard',
        description: overrideDescription ?? project?.description ?? '',
        previewImage,
        components: normalizeComponentsByPage(components, pages),
        pages,
        datasets: datasets.map((ds) => {
            const metadata = { ...ds };
            delete metadata.sampleRows;
            return metadata;
        })
    });


    const handleGoHome = () => {
        // Show confirmation dialog only if there are actual unsaved changes
        if (hasUnsavedChanges) {
            const confirmed = window.confirm(
                t('editor.leaveConfirm')
            );

            if (!confirmed) {
                return;
            }
        }

        navigate('/');
    };

    // Save for existing project
    const handleSaveClick = async () => {
        if (isDraftMode) {
            setIsSaveModalOpen(true);
            return;
        }

        const snapshot = getProjectSnapshot(undefined, undefined, project?.previewImage);
        const saved = await saveExistingProject(snapshot);

        if (saved) {
            markAsSaved();
            // Sending a screenshot in the background without blocking the browser thread
            const scheduleWork = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
            scheduleWork(async () => {
                try {
                    const freshPreview = await captureCanvasPreview(canvasRef.current);
                    if (freshPreview) {
                        await updatePreviewImage(freshPreview);
                    }
                } catch (err) {
                    console.warn('Could not generate background preview:', err);
                }
            });
        }
    };

    // Save modal for draft project
    const handleConfirmSave = async ({ title, description }) => {
        const snapshot = getProjectSnapshot(title, description);
        const saved = await createProjectFromDraft(snapshot);

        if (saved) {
            markAsSaved();
            setIsSaveModalOpen(false);
            navigate(`/editor/${saved.id}`, { replace: true });

            const scheduleWork = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 300));
            scheduleWork(async () => {
                try {
                    const freshPreview = await captureCanvasPreview(canvasRef.current);
                    if (freshPreview) {
                        await updatePreviewImage(freshPreview, saved.id);
                    }
                } catch (err) {
                    console.warn('Could not generate background preview for draft:', err);
                }
            });
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

    const onPreviewClick = async () => {
        const snapshot = getProjectSnapshot();
        await handleOpenPreview(snapshot);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={editorCollisionDetection}
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
                        onPreviewDashboard={onPreviewClick}
                        datasets={datasets}
                        onRemoveDataset={handleRemoveDataset}
                        isDatasetClearing={isDatasetClearing}
                        isGenerating={isGenerating}
                        isPreviewLoading={isPreviewLoading}
                        isProjectSaving={isProjectSaving}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={canUndo}
                        canRedo={canRedo}
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

                    <PreviewModal
                        isOpen={isPreviewModalOpen}
                        previewUrl={previewUrl}
                        onClose={handleClosePreview}
                    />

                    <div className={`editor-workspace${selectedComponent ? ' has-properties' : ''}`}>
                        <main className="editor-canvas-area">
                            <PageTabs
                                pages={pages}
                                activePageId={activePageId}
                                onSelect={selectPage}
                                onAdd={addPage}
                                onRename={renamePage}
                                onDelete={deletePage}
                            />
                            <Canvas
                                canvasRef={canvasRef}
                                components={pageComponents}
                                selectedId={selectedId}
                                onSelect={selectComponent}
                                onDelete={deleteComponent}
                                onDuplicate={duplicateComponent}
                                onLayoutChange={setDashboardLayout}
                                onMoveToContainer={moveComponent}
                                onReorderComponent={reorderComponent}
                                isDragging={Boolean(activeDrag)}
                                datasets={datasets}
                                previewRowsByDataset={previewRowsByDataset}
                                isDataLoading={isDatasetPreviewLoading}
                                isProjectLoading={isProjectLoading}
                                pages={pages}
                            />
                        </main>

                        <PropertiesPanel
                            selectedComponent={selectedComponent}
                            onUpdateComponent={updateComponent}
                            onDeleteSelected={deleteSelectedComponent}
                            onClose={() => selectComponent(null)}
                            datasets={datasets}
                            pages={pages}
                            components={pageComponents}
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
