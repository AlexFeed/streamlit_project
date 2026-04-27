import { useEffect, useMemo, useState } from 'react';

// Hook отвечает за управление состоянием локальных компонентов дашборда, их загрузка в LocalStorage

// Ключ хранения состояния в localStorage
export const EDITOR_DRAFT_STORAGE_KEY = 'streamlit-editor-draft';

const loadDraftComponents = () => {
    try {
        const saved = localStorage.getItem(EDITOR_DRAFT_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch (error) {
        console.error('Ошибка чтения черновика editor из localStorage:', error);
        return [];
    }
};

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
export const useEditorState = ({ useDraftStorage = true }) => {
    // Управление состоянием компонентов
    const [components, setComponents] = useState(() => {
        if (!useDraftStorage) {
            return [];
        }

        return loadDraftComponents();
    });

    // Управление состоянием выбранного элемента на холсте
    const [selectedId, setSelectedId] = useState(null);

    // При изменении components сохраняем draft только для /editor
    useEffect(() => {
        if (!useDraftStorage) {
            return;
        }

        try {
            localStorage.setItem(
                EDITOR_DRAFT_STORAGE_KEY,
                JSON.stringify(components)
            );
        } catch (error) {
            console.error('Ошибка сохранения черновика editor в localStorage:', error);
        }
    }, [components, useDraftStorage]);


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

        if (useDraftStorage) {
            localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
        }
    };

    return {
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
    };
};