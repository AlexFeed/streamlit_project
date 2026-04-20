import ComponentPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
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
        availableFields,
        datasetMeta,
        datasetWarning,
        datasetError,
        handleFileUpload,
        clearDataset,
        dismissDatasetWarning,
    } = useDatasetState();

    // Управление состоянием ошибок JSON-схемы
    const [validationErrors, setValidationErrors] = useState([]);

    // Вызывается при нажатии на кнопку "Generate"
    const handleGenerateDashboard = async () => {
        try {
            const errors = validateSchema(components);

            if (errors.length > 0) {
                setValidationErrors(errors);
                console.error('Schema validation failed:', errors);
                return;
            }

            setValidationErrors([]);

            const schema = buildDashboardSchema(components, availableFields, datasetMeta);

            console.log('READY TO SEND TO BACKEND:');
            console.log(schema);
            console.log(JSON.stringify(schema, null, 2));
        } catch (error) {
            console.error('Ошибка генерации дашборда:', error);
            setValidationErrors(['Во время генерации произошла непредвиденная ошибка.']);
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
                    />

                    {/* Вывод ошибок в UI */}
                    {datasetWarning && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-yellow-200">
                                        Поля датасета восстановлены из localStorage, но сам файл после перезагрузки страницы недоступен.
                                        При необходимости загрузите CSV заново.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={dismissDatasetWarning}
                                        className="rounded-lg border border-yellow-500/30 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-500/10"
                                    >
                                        Скрыть
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {datasetError && (
                        <div className="px-4 pt-4">
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                                {datasetError}
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
        </div>
    );
};

export default EditorPage;