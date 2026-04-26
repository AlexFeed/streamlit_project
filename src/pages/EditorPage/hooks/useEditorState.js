import { useEffect, useMemo, useState } from 'react';

// Hook отвечает за управление состоянием локальных компонентов дашборда, их загрузка в LocalStorage

// Ключ хранения состояния в localStorage
const STORAGE_KEY = 'editor_state_v1';

// Создание компоненты для холста
const createComponentFromPaletteItem = (paletteItem, index) => {
    return {
        id: `${paletteItem.type}-${Date.now()}-${index}`,
        type: paletteItem.type,
        config: { ...paletteItem.defaultConfig },
        bindings: { ...paletteItem.defaultBindings },
    };
};

// Управление всем состоянием редактора
export const useEditorState = () => {
    // Управление состоянием компонентов
    const [components, setComponents] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return [];

            const parsed = JSON.parse(saved);
            return parsed.components || [];
        } catch (error) {
            console.error('Ошибка чтения localStorage:', error);
            return [];
        }
    });

    // Управление состоянием выбранного элемента на холсте
    const [selectedId, setSelectedId] = useState(null);

    // При каждом изменении components, будет обновляться localStorage
    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    components,
                })
            );
        } catch (error) {
            console.error('Ошибка сохранения localStorage:', error);
        }
    }, [components]);


    const selectedComponent = useMemo(() => {
        return components.find((item) => item.id === selectedId) || null;
    }, [components, selectedId]);


    // Добавление компонента на холст
    const addComponent = (paletteItem) => {
        const newComponent = createComponentFromPaletteItem(
            paletteItem,
            components.length + 1
        );

        setComponents((prev) => [...prev, newComponent]);
        setSelectedId(newComponent.id);
    };

    // Выбор текущего компонента на холсте
    const selectComponent = (id) => {
        setSelectedId(id);
    };

    // Изменение данных в компоненте на холсте (например название графика)
    const updateComponent = (id, updater) => {
        setComponents((prev) =>
            prev.map((item) =>
                item.id === id ? updater(item) : item
            )
        );
    };

    // Удаление компонента с холста
    const deleteComponent = (id) => {
        setComponents((prev) => prev.filter((item) => item.id !== id));

        if (selectedId === id) {
            setSelectedId(null);
        }
    };

    // Удаление выбранного компонента с холста
    const deleteSelectedComponent = () => {
        if (!selectedId) return;
        deleteComponent(selectedId);
    };

    // Очистка холста целиком
    const clearCanvas = () => {
        setComponents([]);
        setSelectedId(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        components,
        selectedId,
        selectedComponent,
        addComponent,
        selectComponent,
        updateComponent,
        deleteComponent,
        deleteSelectedComponent,
        clearCanvas,
    };
};