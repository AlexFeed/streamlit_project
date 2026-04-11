import ComponentPalette from './components/ComponentsPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader';
import { useEditorState } from './hooks/useEditorState';
import {
    buildDashboardSchema,
    validateSchema,
} from './services/editorSchema';

const EditorPage = () => {
    const availableFields = ['date', 'sales', 'department', 'revenue', 'profit'];

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

    const handleGenerateDashboard = async () => {
        try {
            const validationErrors = validateSchema(components);

            if (validationErrors.length > 0) {
                console.error('Schema validation failed:');
                validationErrors.forEach((error) => console.error(`• ${error}`));
                return;
            }

            const schema = buildDashboardSchema(components, availableFields);

            console.log('READY TO SEND TO BACKEND:');
            console.log(schema);
            console.log(JSON.stringify(schema, null, 2));

            // Здесь позже будет запрос на backend
            // const response = await fetch('/generate', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(schema),
            // });
        } catch (error) {
            console.error('Ошибка генерации дашборда:', error);
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
                    />

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