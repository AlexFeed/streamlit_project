import {useMemo, useState} from 'react';
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

const EditorPage = () => {
    const [components, setComponents] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const selectedComponent = useMemo(
        () => components.find((item) => item.id === selectedId) || null,
        [components, selectedId]
    );

    const handleAddComponent = (paletteItem) => {
        const newComponent = createComponentFromPaletteItem(paletteItem, components.length + 1);

        setComponents((prev) => [...prev, newComponent]);
        setSelectedId(newComponent.id);
    };

    const handleSelectComponent = (id) => {
        setSelectedId(id);
    };

    const handleUpdateComponent = (id, newProps) => {
        setComponents((prev) =>
            prev.map((item) => (item.id === id ? {...item, props: newProps} : item))
        );
    };

    const handleDeleteComponent = (id) => {
        setComponents((prev) => prev.filter((item) => item.id !== id));

        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    const handleDeleteSelected = () => {
        if (!selectedId) return;
        handleDeleteComponent(selectedId);
    };

    const handleClearCanvas = () => {
        setComponents([]);
        setSelectedId(null);
    };

    return (
        <div className="min-h-screen overflow-auto bg-zinc-950 text-white">
            <div className="grid grid-cols-[260px_minmax(0,1fr)]">
                <ComponentsPalette onAddComponent={handleAddComponent} />

                <div className="flex flex-col">
                    <EditorHeader onClearCanvas={handleClearCanvas} />

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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;