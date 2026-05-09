// Editor components
import ComponentPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import PreviewModal from './components/PreviewModal';
import { useParams, useNavigate } from 'react-router-dom';


// State hooks
import { usePreviewState } from './hooks/usePreviewState';
import { useEditorState } from './hooks/useEditorState';
import {useDatasetState} from './hooks/useDatasetState';
import {
    buildDashboardSchema,
    validateSchema,
} from './services/editorSchema';

import { useState } from 'react';
import { logout } from '../../api/authApi.js';
import { useProjectState } from './hooks/useProjectState.js';
import { generateProjectZip } from '../../api/generateApi.js';
import ErrorNotification from "./components/common/ErrorNotification.jsx";

const EditorPage = () => {
    // Получение из адресной строки параметров конкретного проекта
    const { projectId } = useParams();
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmed = window.confirm(
            'При выходе все несохраненные данные будут удалены. Продолжить?'
        );

        if (!confirmed) {
            return;
        }

        logout();

        navigate('/auth', { replace: true });
    };

    // Черновик это или уже сохранённый проект (Для управления localStorage)
    const isDraftMode = !(projectId);

    // Управление состоянием ошибок JSON-схемы
    const [validationErrors, setValidationErrors] = useState([]);

    // Состояние генерации кода
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    // Получения данных связанных с компонентами
    const {
        components,
        setComponents,
        selectedId,
        selectedComponent,
        addComponent,
        selectComponent,
        updateComponent,
        deleteComponent,
        deleteSelectedComponent,
        clearCanvas,
    } = useEditorState({
        useDraftStorage: isDraftMode,
    });

    // Получение данных связанных с датасетом
    const {
        datasetMeta,
        setDatasetMeta,
        availableFields,
        datasetError,
        isDatasetUploading,
        isDatasetClearing,
        handleFileUpload,
        clearDataset,
    } = useDatasetState({
        useDraftStorage: isDraftMode,
    });

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
        components,
        availableFields,
        datasetMeta,
        setComponents,
        setDatasetMeta,
        setValidationErrors,
    });

    // Получение данных связанных с preview дашборда
    const {
        previewUrl,
        isPreviewLoading,
        previewError,
        isPreviewOpen,
        handlePreview,
        closePreview,
    } = usePreviewState({
        components,
        availableFields,
        datasetMeta,
        projectTitle: project?.title,
        setValidationErrors,
    });


    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saveDescription, setSaveDescription] = useState('');
    const [saveMetadataError, setSaveMetadataError] = useState('');

    // Вызывается при клике на кнопку "Save" в хедере редактора
    const handleSaveClick = async () => {
        if (isDraftMode) {
            // Строго чистые поля для нового проекта
            setSaveMetadataError('');
            setSaveTitle('');
            setSaveDescription('');
            setIsSaveModalOpen(true);
        } else {
            await saveExistingProject();
        }
    };

    // Вызывается при клике "Сохранить" внутри модального окна
    const handleConfirmSave = async () => {
        if (!saveTitle.trim()) {
            setSaveMetadataError('Название проекта не может быть пустым.');
            return;
        }

        const saved = await createProjectFromDraft({
            title: saveTitle.trim(),
            description: saveDescription.trim(),
        });

        if (saved) {
            setIsSaveModalOpen(false);
            // Меняем URL на ID созданного проекта, оставаясь в редакторе
            navigate(`/editor/${saved.id}`, { replace: true });
        }
    };

    const handleCancelSave = () => {
        setSaveMetadataError('');
        setIsSaveModalOpen(false);
    };

    // Вызывается при нажатии на кнопку "Generate"
    const handleGenerateDashboard = async () => {
        try {
            const errors = validateSchema(components, availableFields, datasetMeta);

            if (errors.length > 0) {
                setValidationErrors(errors);
                return;
            }

            setValidationErrors([]);
            setGenerationError('');
            setIsGenerating(true);

            const schema = buildDashboardSchema(components, availableFields, datasetMeta, project?.title );
            console.log(schema)

            // Получение с сервера zip сгенерированного проекта
            const blob = await generateProjectZip(
                {
                    schema,
                    datasetId: datasetMeta.datasetId
                })

            // Скачивание zip пользователем
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dashboard_project.zip';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка генерации дашборда:', error);
            setGenerationError(error.message || 'Не удалось сгенерировать Streamlit-файл.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Все ошибки
    const allActiveErrors = [
        datasetError,
        projectError,
        previewError,
        generationError,
        ...validationErrors
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-zinc-950 text-white overflow-auto">
            <div className="grid grid-cols-[260px_minmax(0,1fr)]">
                <ComponentPalette onAddComponent={addComponent} />

                <div className="flex flex-col">
                    <EditorHeader
                        onClearCanvas={clearCanvas}
                        onGenerateDashboard={handleGenerateDashboard}
                        onFileUpload={handleFileUpload}
                        datasetMeta={datasetMeta}
                        onClearDataset={clearDataset}
                        isDatasetUploading={isDatasetUploading}
                        isDatasetClearing={isDatasetClearing}
                        isGenerating={isGenerating}
                        isPreviewLoading={isPreviewLoading}
                        onPreview={handlePreview}
                        onSaveProject={handleSaveClick}
                        onLogout={handleLogout}
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

                    <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
                        <Canvas
                            components={components}
                            selectedId={selectedId}
                            onSelect={selectComponent}
                            onDelete={deleteComponent}
                        />

                        <PropertiesPanel
                            selectedComponent={selectedComponent}
                            onUpdateComponent={updateComponent}
                            onDeleteSelected={deleteSelectedComponent}
                            availableFields={availableFields}
                        />
                    </div>
                </div>
            </div>
            <PreviewModal
                isOpen={isPreviewOpen}
                previewUrl={previewUrl}
                onClose={closePreview}
            />
        </div>
    );
};

export default EditorPage;