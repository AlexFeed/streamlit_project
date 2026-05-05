// Editor components
import ComponentPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import PreviewModal from './components/PreviewModal';
import { useParams, useNavigate } from 'react-router-dom';

import { EDITOR_DRAFT_STORAGE_KEY } from './hooks/useEditorState';

// State hooks
import { usePreviewState } from './hooks/usePreviewState';
import { useEditorState } from './hooks/useEditorState';
import {DATASET_DRAFT_STORAGE_KEY, useDatasetState} from './hooks/useDatasetState';
import {
    buildDashboardSchema,
    validateSchema,
} from './services/editorSchema';

import {useEffect, useState} from "react";
import {authFetch} from "../../api/apiClient.js";
import { logout } from '../../api/authApi.js';

const EditorPage = () => {
    // Получение из адресной строки параметров конкретного проекта
    const { projectId } = useParams();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth', { replace: true });
    };

    // Черновик это или уже сохранённый проект (Для управления localStorage)
    const isDraftMode = !(projectId);
    
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

    // Получение данных связанных с preview дашборда
    const {
        previewUrl,
        isPreviewLoading,
        previewError,
        isPreviewOpen,
        generatePreview,
        closePreview,
    } = usePreviewState();
    

    useEffect(() => {
        if (!projectId) return;

        const loadProject = async () => {
            try {
                const response = await authFetch(`/projects/${projectId}`);

                if (!response.ok) {
                    throw new Error('Project not found');
                }

                const project = await response.json();

                setComponents(project.editorState?.components || [])
                setDatasetMeta(project.datasetMeta || null)

            } catch (error) {
                console.error('Ошибка загрузки проекта:', error);
            }
        };

        loadProject();
    }, [projectId, setComponents, setDatasetMeta]);

    // Управление состоянием ошибок JSON-схемы
    const [validationErrors, setValidationErrors] = useState([]);

    // Состояние генерации кода
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    // Обработка сохранения дашборда в отдельный проект
    const handleSaveProject = async () => {
        const errors = validateSchema(components, availableFields, datasetMeta);

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }


        const schema = buildDashboardSchema(components, availableFields, datasetMeta);

        const payload = {
            title: schema.dashboard.title,
            description: '',
            datasetMeta,
            editorState: {
                components,
            },
            schema,
        };

        const url = projectId
            ? `/projects/${projectId}`
            : '/projects';

        const method = projectId ? 'PUT' : 'POST';

        try {
            const response = await authFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Save failed');
            }

            const savedProject = await response.json();

            if (!projectId) {
                localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
                localStorage.removeItem(DATASET_DRAFT_STORAGE_KEY);
                navigate(`/editor/${savedProject.id}`);
            }

            console.log('Проект сохранён:', savedProject);
        } catch (error) {
            console.error('Ошибка сохранения проекта:', error);
        }
    };

    // Вызывается при нажатии кнопки preview
    const handlePreview = async () => {
        const errors = validateSchema(components, availableFields, datasetMeta);

        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors([]);

        const schema = buildDashboardSchema(
            components,
            availableFields,
            datasetMeta
        );

        console.log(schema)

        await generatePreview({
            schema,
            datasetId: datasetMeta?.datasetId,
        });
    };

    // Вызывается при нажатии на кнопку "Generate"
    const handleGenerateDashboard = async () => {
        try {
            const errors = validateSchema(components, availableFields, datasetMeta);

            if (errors.length > 0) {
                setValidationErrors(errors);
                setGenerationError('');
                return;
            }

            setValidationErrors([]);
            setGenerationError('');
            setIsGenerating(true);

            const schema = buildDashboardSchema(components, availableFields, datasetMeta);
            console.log(schema)

            const response = await fetch('http://localhost:8000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schema,
                    datasetId: datasetMeta.datasetId,
                }),
            });

            if (response.status === 404) {
                setGenerationError('Датасет не найден на backend. Загрузите CSV заново.');
                return;
            }

            if (!response.ok) {
                throw new Error(`Ошибка backend: ${response.status}`);
            }

            // Скачивание сгенерированного дашборда с сервера
            const blob = await response.blob();

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
            setGenerationError('Не удалось сгенерировать Streamlit-файл.');
        } finally {
            setIsGenerating(false);
        }
    };

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
                        onSaveProject={handleSaveProject}
                        onLogout={handleLogout}
                    />

                    {/* Вывод ошибок в UI */}

                    {datasetError && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                {datasetError}
                            </div>
                        </div>
                    )}

                    {previewError && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                {previewError}
                            </div>
                        </div>
                    )}

                    {validationErrors.length > 0 && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                                <p className="mb-2 text-sm font-semibold text-red-300">
                                    Исправьте ошибки перед генерацией
                                </p>

                                <ul className="list-disc space-y-1 pl-5 text-sm text-red-200">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {generationError && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                {generationError}
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