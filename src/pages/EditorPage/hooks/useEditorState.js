import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    gridUnitsToContentHeight,
    resolveGridCollisions,
    normalizeComponentLayouts,
    normalizeGridWidth,
    toReactGridLayout,
} from '../services/gridLayout.js';
import {EDITOR_DRAFT_STORAGE_KEY} from "../../../shared/constants/storageKeys.js";
import useTranslation from '../../../shared/i18n/useTranslation.js';

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
        console.error('Could not read the editor draft from local storage:', error);
        return [];
    }
};

const createComponentFromPaletteItem = (
    paletteItem,
    index,
    defaultDatasetId = '',
    targetLayout = null
) => {
    return {
        id: `${paletteItem.type}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${index}`}`,
        type: paletteItem.type,
        datasetId: defaultDatasetId,
        config: { ...paletteItem.defaultConfig },
        bindings: { ...paletteItem.defaultBindings },
        layout: {
            width: paletteItem.defaultWidth || 6,
            height: paletteItem.defaultHeight || 320,
            ...(targetLayout || {}),
        },
    };
};

export const useEditorState = ({ useDraftStorage = true, defaultDatasetId = ''}) => {
    const { t } = useTranslation();
    const [components, setComponents] = useState(() => {
        if (!useDraftStorage) {
            return [];
        }

        return loadDraftComponents();
    });

    const [selectedId, setSelectedId] = useState(null);

    const replaceComponents = useCallback((nextComponents) => {
        setComponents(normalizeComponents(nextComponents));
        setSelectedId(null);
    }, []);

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
            console.error('Could not save the editor draft to local storage:', error);
        }
    }, [components, useDraftStorage]);


    const selectedComponent = useMemo(() => {
        return components.find((item) => item.id === selectedId) || null;
    }, [components, selectedId]);


    const addComponent = (paletteItem, targetIndex, targetLayout = null) => {
        const shouldInsert = Boolean(targetLayout?.insert);
        const componentLayout = targetLayout
            ? Object.fromEntries(
                Object.entries(targetLayout).filter(([key]) => key !== 'insert')
            )
            : null;
        const newComponent = createComponentFromPaletteItem(
            paletteItem,
            components.length + 1,
            defaultDatasetId,
            componentLayout
        );
        setComponents((prev) => {
            const insertIndex = Number.isInteger(targetIndex)
                ? Math.max(0, Math.min(targetIndex, prev.length))
                : prev.length;
            const nextComponents = [
                ...prev.slice(0, insertIndex),
                newComponent,
                ...prev.slice(insertIndex),
            ];
            if (!shouldInsert) {
                return normalizeComponents(nextComponents);
            }

            const layout = toReactGridLayout(nextComponents);
            const activeItem = layout.find((item) => item.i === newComponent.id);
            if (!activeItem) return normalizeComponents(nextComponents);
            const resolved = resolveGridCollisions(
                layout,
                newComponent.id,
                activeItem
            );
            const layoutById = new Map(
                resolved.map((item) => [item.i, item])
            );

            return nextComponents.map((component) => {
                const item = layoutById.get(component.id);
                if (!item) return component;
                return {
                    ...component,
                    layout: {
                        ...component.layout,
                        x: item.x,
                        y: item.y,
                        width: normalizeGridWidth(item.w, component.type),
                        height: gridUnitsToContentHeight(item.h, component.type),
                    },
                };
            });
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

    const duplicateComponent = useCallback((id) => {
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
    }, [components]);

    const setDashboardLayout = useCallback((gridLayout) => {
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
    }, []);

    const selectComponent = useCallback((id) => {
        setSelectedId(id);
    }, []);

    const updateComponent = (id, updater) => {
        setComponents((prev) =>
            prev.map((item) =>
                item.id === id ? updater(item) : item
            )
        );
    };

    const deleteComponent = useCallback((id) => {
        setComponents((prev) => prev.filter((item) => item.id !== id));
        setSelectedId((prev) => (prev === id ? null : prev));
    }, []);

    const deleteSelectedComponent = () => {
        if (!selectedId) return;
        deleteComponent(selectedId);
    };

    const clearCanvas = () => {
        if (components.length === 0) return;
        const confirmed = window.confirm(
            t('editor.clearConfirm')
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
