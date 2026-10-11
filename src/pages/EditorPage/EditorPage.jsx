// Editor components
import ComponentsPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import { useParams, useNavigate } from 'react-router-dom';
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';


// State hooks
import { useEditorState } from './hooks/useEditorState';
import {useDatasetState} from './hooks/useDatasetState';

import { useState } from 'react';
import { useProjectState } from './hooks/useProjectState.js';
import ErrorNotification from "./components/common/ErrorNotification.jsx";
import {useGenerateState} from "./hooks/useGenerateState.jsx";

const EditorPage = () => {
    // Получение из адресной строки параметров конкретного проекта
    const { projectId } = useParams();
    const navigate = useNavigate();

    // Черновик это или уже сохранённый проект (Для управления localStorage)
    const isDraftMode = !(projectId);

    // Управление состоянием ошибок JSON-схемы
    const [validationErrors, setValidationErrors] = useState([]);


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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeDrag, setActiveDrag] = useState(null);

    const handleDragStart = ({ active }) => {
        setActiveDrag(active.data.current || null);
    };

    const handleDragCancel = () => {
        setActiveDrag(null);
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveDrag(null);
        if (!over) return;

        const dragData = active.data.current;

        if (dragData?.source === 'palette') {
            const overIndex = components.findIndex((item) => item.id === over.id);
            const targetIndex = overIndex >= 0 ? overIndex : components.length;
            addComponent(dragData.paletteItem, targetIndex);
            return;
        }

        if (
            dragData?.source === 'canvas-item'
            && over.id !== 'dashboard-canvas'
        ) {
            reorderComponent(active.id, over.id);
        }
    };

    // Получение данных связанных с датасетом
    const {
        dataset,
        setDataset,
        availableFields,
        fieldTypes,
        previewRows,
        datasetError,
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
        projectError,
        project,
        createProjectFromDraft,
        saveExistingProject,
    } = useProjectState({
        projectId,
        setComponents,
        setDataset,
        setValidationErrors,
    });

    // Получения данных, связанных с генерацией streamlit кода
    const {
        isGenerating,
        generationError,
        handleGenerate
    } = useGenerateState({ setValidationErrors });

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
    const [saveTitle, setSaveTitle] = useState('');
    const [saveDescription, setSaveDescription] = useState('');
    const [saveMetadataError, setSaveMetadataError] = useState('');

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
            setSaveMetadataError('');
            setSaveTitle('');
            setSaveDescription('');
            setIsSaveModalOpen(true);
        } else {
            const snapshot = getProjectSnapshot();
            await saveExistingProject(snapshot);
        }
    };

    // Вызывается при клике "Сохранить" внутри модального окна
    const handleConfirmSave = async () => {
        if (!saveTitle.trim()) {
            setSaveMetadataError('Название проекта не может быть пустым.');
            return;
        }

        // Передаем данные модалки в snapshot
        const snapshot = getProjectSnapshot(saveTitle.trim(), saveDescription.trim());
        const saved = await createProjectFromDraft(snapshot);

        if (saved) {
            setIsSaveModalOpen(false);
            navigate(`/editor/${saved.id}`, { replace: true });
        }
    };

    const handleCancelSave = () => {
        setSaveMetadataError('');
        setIsSaveModalOpen(false);
    };

    // Обработчик для кнопки Генерации (использует Snapshot)
    const onGenerateClick = async () => {
        const snapshot = getProjectSnapshot();
        await handleGenerate(snapshot);
    };

    // Все ошибки
    const allActiveErrors = [
        datasetError,
        projectError,
        generationError,
        ...validationErrors
    ].filter(Boolean);

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

                    {/* Вывод ошибок в UI */}

                    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[360px] pointer-events-none">
                        {allActiveErrors.map((error) => (
                            <ErrorNotification
                                key={error}
                                message={error}
                            />
                        ))}
                    </div>

                    {isSaveModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
                            <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Сохранить проект</h2>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Укажите название и описание перед сохранением.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCancelSave}
                                        className="text-zinc-400 transition hover:text-white"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">Название проекта</label>
                                        <input
                                            type="text"
                                            value={saveTitle}
                                            onChange={(e) => setSaveTitle(e.target.value)}
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">Описание</label>
                                        <textarea
                                            value={saveDescription}
                                            onChange={(e) => setSaveDescription(e.target.value)}
                                            rows={4}
                                            className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    {saveMetadataError && (
                                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                            {saveMetadataError}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelSave}
                                        className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmSave}
                                        className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400"
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
