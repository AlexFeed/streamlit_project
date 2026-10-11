// Editor components
import ComponentsPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import SaveProjectModal from './components/modals/SaveProjectModal';
import { useParams, useNavigate } from 'react-router-dom';
import {
    closestCenter,
    DndContext,
    DragOverlay,
} from '@dnd-kit/core';


// State hooks
import { useEditorState } from './hooks/useEditorState';
import {useDatasetState} from './hooks/useDatasetState';

import { useState } from 'react';
import { useProjectState } from './hooks/useProjectState.js';
import {useGenerateState} from "./hooks/useGenerateState.jsx";
import { useEditorDnd } from './hooks/useEditorDnd.js';

const EditorPage = () => {
    // Получение из адресной строки параметров конкретного проекта
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Черновик это или уже сохранённый проект (Для управления localStorage)
    const isDraftMode = !(projectId);

    // Получения данных связанных с компонентами
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
    } = useEditorState({ useDraftStorage: isDraftMode });

    // Получение данных связанных с датасетом
    const {
        dataset,
        setDataset,
        availableFields,
        fieldTypes,
        previewRows,
        isDatasetUploading,
        isDatasetClearing,
        isDatasetPreviewLoading,
        handleFileUpload,
        clearDataset,
    } = useDatasetState({ useDraftStorage: isDraftMode });

    // Получение данных, связанных с загрузкой проекта
    const {
        isProjectLoading,
        isProjectSaving,
        project,
        createProjectFromDraft,
        saveExistingProject,
    } = useProjectState({
        projectId,
        setComponents,
        setDataset,
    });

    // Получения данных, связанных с генерацией streamlit кода
    const {
        isGenerating,
        handleGenerate
    } = useGenerateState();

    // Получение данных связанных с drag and drop интерактивностью
    const {
        sensors,
        activeDrag,
        handleDragStart,
        handleDragCancel,
        handleDragEnd,
    } = useEditorDnd({
        components,
        addComponent,
        reorderComponent,
    });

    const getDatasetMetadata = () => {
        if (!dataset) return null;

        const metadata = { ...dataset };
        delete metadata.sampleRows;
        return metadata;
    };

    // ЕДИНЫЙ ДИСПЕТЧЕР ДАННЫХ (Snapshot)
    const getProjectSnapshot = (overrideTitle, overrideDescription) => ({
        title: overrideTitle ?? project?.title ?? 'Untitled dashboard',
        description: overrideDescription ?? project?.description ?? '',
        components,
        availableFields,
        dataset: getDatasetMetadata()
    });

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);


    // Перемещение на главную страницу с проектами
    const handleGoHome = () => {
        const confirmed = window.confirm(
            'При выходе на главную все несохраненные данные будут удалены. Продолжить?'
        );

        if (!confirmed) {
            return;
        }

        navigate('/');
    };

    // Вызывается при клике на кнопку "Save" в хедере редактора
    const handleSaveClick = async () => {
        if (isDraftMode) {
            // Если черновик открываем модалку для сохранения
            setIsSaveModalOpen(true);
        } else {
            const snapshot = getProjectSnapshot();
            await saveExistingProject(snapshot);
        }
    };

    // Вызывается при клике "Сохранить" внутри модального окна
    const handleConfirmSave = async ({ title, description }) => {
        // Передаем данные модалки в snapshot
        const snapshot = getProjectSnapshot(title, description);
        const saved = await createProjectFromDraft(snapshot);

        if (saved) {
            setIsSaveModalOpen(false);
            navigate(`/editor/${saved.id}`, { replace: true });
        }
    };

    // Обработчик для кнопки Генерации (использует Snapshot)
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
        <div className="h-screen overflow-hidden bg-zinc-950 text-white">
            <div className="grid h-full grid-cols-[252px_minmax(0,1fr)]">
                <ComponentsPalette onAddComponent={addComponent} onGoHome={handleGoHome}/>

                <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                    <EditorHeader
                        onClearCanvas={clearCanvas}
                        onGenerateDashboard={onGenerateClick}
                        onFileUpload={handleFileUpload}
                        datasetMeta={dataset}
                        onClearDataset={clearDataset}
                        isDatasetUploading={isDatasetUploading}
                        isDatasetClearing={isDatasetClearing}
                        isGenerating={isGenerating}
                        onSaveProject={handleSaveClick}
                        onGoHome={handleGoHome}
                    />

                    <SaveProjectModal
                        isOpen={isSaveModalOpen}
                        isSaving={isProjectSaving}
                        onClose={() => setIsSaveModalOpen(false)}
                        onConfirm={handleConfirmSave}
                    />

                    {/* UI загрузки */}
                    {isProjectLoading && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
                                Загрузка проекта...
                            </div>
                        </div>
                    )}

                    {isProjectSaving && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-200">
                                Сохранение проекта...
                            </div>
                        </div>
                    )}

                    <div className={`grid min-h-0 min-w-0 flex-1 overflow-hidden ${
                        selectedComponent
                            ? 'xl:grid-cols-[minmax(0,1fr)_360px]'
                            : 'grid-cols-1'
                    }`}>
                        <main className="min-h-0 min-w-0 overflow-y-auto p-4">
                            <Canvas
                                key={dataset?.datasetId || 'no-dataset'}
                                components={components}
                                selectedId={selectedId}
                                onSelect={selectComponent}
                                onDelete={deleteComponent}
                                onDuplicate={duplicateComponent}
                                onLayoutChange={setDashboardLayout}
                                isDragging={Boolean(activeDrag)}
                                dataRows={previewRows}
                                isDataLoading={isDatasetPreviewLoading}
                            />
                        </main>

                        <PropertiesPanel
                            selectedComponent={selectedComponent}
                            onUpdateComponent={updateComponent}
                            onDeleteSelected={deleteSelectedComponent}
                            onClose={() => selectComponent(null)}
                            availableFields={availableFields}
                            fieldTypes={fieldTypes}
                        />
                    </div>
                </div>
            </div>
        </div>
            <DragOverlay dropAnimation={null}>
                {activeDrag && (
                    <div className="w-64 rounded-xl border border-blue-500 bg-zinc-900 p-4 shadow-2xl shadow-black/50">
                        <p className="text-sm font-medium text-white">
                            {activeDrag.paletteItem?.label || 'Компонент дашборда'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                            Переместите в нужную позицию
                        </p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
};

export default EditorPage;
