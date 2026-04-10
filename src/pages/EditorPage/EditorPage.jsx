import { useEffect, useMemo, useState } from 'react';
import ComponentsPalette from './components/ComponentsPalette.jsx';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import EditorHeader from './components/EditorHeader.jsx';

const createComponentFromPaletteItem = (paletteItem, index) => {
    return {
        id: `${paletteItem.type}-${Date.now()}-${index}`,
        type: paletteItem.type,
        props: {...paletteItem.defaultProps},
    };
};

// Ключ хранения состояния в localStorage
const STORAGE_KEY = 'editor_state_v1';

// Тестовые данные "колонок датасета" для возможности выбора в панели свойств
const availableFields = ['date', 'sales', 'department', 'revenue', 'profit'];

// Сборка схемы дашборда
const buildDashboardSchema = (components) => {
    return {
        version: 1,
        title: 'Untitled dashboard',
        exportedAt: new Date().toISOString(),
        components,
    };
};

const EditorPage = () => {
    // HOOKS

    // Управление состоянием компонентов
    const [components, setComponents] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return [];

            const parsed = JSON.parse(saved);

            return parsed.components || [];
        } catch (e) {
            console.error('Ошибка чтения localStorage', e);
            return [];
        }
    });

    // При каждом изменении components, будет обновляться localStorage
    useEffect(() => {
        const timeout = setTimeout(() => {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ components })
                );
            } catch (e) {
                console.error(e);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [components]);

    // Управление состоянием выбранного элемента на холсте
    const [selectedId, setSelectedId] = useState(null);

    const selectedComponent = useMemo(
        () => components.find((item) => item.id === selectedId) || null,
        [components, selectedId]
    );

    // Handling functions

    // Функция генерации дашборда (бета версия, реализована только генерация json-схемы в консоль)
    const handleGenerateDashboard = () => {
        try {
            const schema = buildDashboardSchema(components);
            console.log('Generated dashboard schema:', schema);
        } catch (error) {
            console.error('Ошибка генерации схемы дашборда:', error);
        }
    };

    // Добавление компонента на холст
    const handleAddComponent = (paletteItem) => {
        const newComponent = createComponentFromPaletteItem(paletteItem, components.length + 1);

        setComponents((prev) => [...prev, newComponent]);
        setSelectedId(newComponent.id);
    };

    // Выбор текущего компонента на холсте
    const handleSelectComponent = (id) => {
        setSelectedId(id);
    };

    // Изменение данных в компоненте на холсте (например название графика)
    const handleUpdateComponent = (id, newProps) => {
        setComponents((prev) =>
            prev.map((item) => (item.id === id ? {...item, props: newProps} : item))
        );
    };

    // Удаление компонента с холста
    const handleDeleteComponent = (id) => {
        setComponents((prev) => prev.filter((item) => item.id !== id));

        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    // Удаление выбранного компонента с холста
    const handleDeleteSelected = () => {
        if (!selectedId) return;
        handleDeleteComponent(selectedId);
    };

    // Очистка холста целиком
    const handleClearCanvas = () => {
        setComponents([]);
        setSelectedId(null);

        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <div className="min-h-screen overflow-auto bg-zinc-950 text-white">
            <div className="grid grid-cols-[260px_minmax(0,1fr)]">
                <ComponentsPalette onAddComponent={handleAddComponent} />

                <div className="flex flex-col">
                    <EditorHeader onClearCanvas={handleClearCanvas} onGenerateDashboard={handleGenerateDashboard}/>

                    <div className="grid gap-4 p-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
                        <Canvas
                            components={components}
                            selectedId={selectedId}
                            onSelect={handleSelectComponent}
                            onDelete={handleDeleteComponent}
                        />

                        <PropertiesPanel
                            selectedComponent={selectedComponent}
                            onUpdateComponent={handleUpdateComponent}
                            onDeleteSelected={handleDeleteSelected}
                            availableFields={availableFields}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;