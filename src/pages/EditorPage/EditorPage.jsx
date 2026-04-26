// Editor components
import ComponentPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import PreviewModal from './components/PreviewModal';

// State hooks
import { usePreviewState } from './hooks/usePreviewState';
import { useEditorState } from './hooks/useEditorState';
import { useDatasetState } from './hooks/useDatasetState';
import {
    buildDashboardSchema,
    validateSchema,
} from './services/editorSchema';

import {useState} from "react";

const EditorPage = () => {
    // Получения данных связанных с компонентами
    const {
        components,
        selectedId,
        selectedComponent,
        addComponent,
        selectComponent,
        updateComponent,
        deleteComponent,
        deleteSelectedComponent,
        clearCanvas,
    } = useEditorState();

    // Получение данных связанных с датасетом
    const {
        datasetMeta,
        availableFields,
        datasetError,
        isDatasetUploading,
        isDatasetClearing,
        handleFileUpload,
        clearDataset,
    } = useDatasetState();

    // Получение данных связанных с preview дашборда
    const {
        previewUrl,
        isPreviewLoading,
        previewError,
        isPreviewOpen,
        generatePreview,
        closePreview,
    } = usePreviewState();

    // Управление состоянием ошибок JSON-схемы
    const [validationErrors, setValidationErrors] = useState([]);

    // Состояние генерации кода
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    // Вызывается при нажатии кнопки preview
    const handlePreview = async () => {
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
            const errors = validateSchema(components);

            if (errors.length > 0) {
                setValidationErrors(errors);
                setGenerationError('');
                return;
            }

            setValidationErrors([]);
            setGenerationError('');
            setIsGenerating(true);

            // Проверка есть ли файл датасета на сервере
            if (!datasetMeta?.datasetId) {
                setGenerationError('Сначала загрузите CSV-файл.');
                return;
            }

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