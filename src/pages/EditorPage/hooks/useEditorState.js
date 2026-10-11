import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    gridUnitsToContentHeight,
    normalizeComponentLayouts,
    normalizeGridWidth,
} from '../services/gridLayout.js';

// Hook отвечает за управление состоянием локальных компонентов дашборда, их загрузка в LocalStorage

// Ключ хранения состояния в localStorage
export const EDITOR_DRAFT_STORAGE_KEY = 'streamlit-editor-draft';

const defaultHeightByType = {
    selectbox: 120,
    line_chart: 320,
    bar_chart: 320,
    area_chart: 320,
    scatter_plot: 320,
    metric: 140,
};

const normalizeComponents = normalizeComponentLayouts;

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

        return normalizeComponents(parsed);
    } catch (error) {
        console.error('Ошибка чтения черновика editor из localStorage:', error);
        return [];
    }
};

// Создание компоненты для холста
const createComponentFromPaletteItem = (paletteItem, index) => {
    return {
        id: `${paletteItem.type}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${index}`}`,
        type: paletteItem.type,
        config: { ...paletteItem.defaultConfig },
        bindings: { ...paletteItem.defaultBindings },
        layout: {
            width: paletteItem.defaultWidth || 6,
            height: paletteItem.defaultHeight
                || defaultHeightByType[paletteItem.type]
                || 320,
        },
    };
};

// Управление всем состоянием редактора
export const useEditorState = ({ useDraftStorage = true }) => {
    // Управление состоянием компонентов для draft (только для /editor)
    const [components, setComponents] = useState(() => {
        if (!useDraftStorage) {
            return [];
        }

        return loadDraftComponents();
    });

    // Управление состоянием выбранного элемента на холсте
    const [selectedId, setSelectedId] = useState(null);

    const replaceComponents = useCallback((nextComponents) => {
        setComponents(normalizeComponents(nextComponents));
        setSelectedId(null);
    }, []);

    // При изменении components сохраняем draft (только для /editor)
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
    const addComponent = (paletteItem, targetIndex) => {
        const newComponent = createComponentFromPaletteItem(
            paletteItem,
            components.length + 1
        );

        setComponents((prev) => {
            const insertIndex = Number.isInteger(targetIndex)
                ? Math.max(0, Math.min(targetIndex, prev.length))
                : prev.length;

            return normalizeComponents([
                ...prev.slice(0, insertIndex),
                newComponent,
                ...prev.slice(insertIndex),
            ]);
        });
        setSelectedId(newComponent.id);
    };

    const reorderComponent = (activeId, overId) => {
        if (!activeId || !overId || activeId === overId) return;

        setComponents((prev) => {
            const fromIndex = prev.findIndex((item) => item.id === activeId);
            const toIndex = prev.findIndex((item) => item.id === overId);

            if (fromIndex < 0 || toIndex < 0) return prev;

            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const duplicateComponent = (id) => {
        const source = components.find((item) => item.id === id);
        if (!source) return;

        const duplicate = {
            ...source,
            id: `${source.type}-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
            config: { ...source.config },
            bindings: { ...source.bindings },
            layout: { ...source.layout },
        };
        delete duplicate.layout.x;
        delete duplicate.layout.y;

        setComponents((prev) => {
            const sourceIndex = prev.findIndex((item) => item.id === id);
            if (sourceIndex < 0) return prev;

            return normalizeComponents([
                ...prev.slice(0, sourceIndex + 1),
                duplicate,
                ...prev.slice(sourceIndex + 1),
            ]);
        });
        setSelectedId(duplicate.id);
    };

    const setDashboardLayout = (gridLayout) => {
        if (!Array.isArray(gridLayout)) return;

        const layoutById = new Map(
            gridLayout.map((item) => [item.i, item])
        );

        setComponents((prev) => prev.map((component) => {
            const item = layoutById.get(component.id);
            if (!item) return component;

            return {
                ...component,
                layout: {
                    ...component.layout,
                    x: Math.max(0, Math.round(item.x)),
                    y: Math.max(0, Math.round(item.y)),
                    width: normalizeGridWidth(item.w, component.type),
                    height: gridUnitsToContentHeight(item.h, component.type),
                },
            };
        }));
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
        if (components.length === 0) return;
        const confirmed = window.confirm(
            'Вы уверены, что хотите очистить холст? Все добавленные компоненты будут удалены.'
        );
        if (!confirmed) {
            return;
        }
        setComponents([]);
        setSelectedId(null);
        if (useDraftStorage) {
            localStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
        }
    };

    return {
        components,
        setComponents: replaceComponents,
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
    };
};
