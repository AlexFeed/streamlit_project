import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    gridUnitsToContentHeight,
    resolveGridCollisions,
    normalizeGridWidth,
    toReactGridLayout,
} from '../services/gridLayout.js';
import {
    EDITOR_DRAFT_STORAGE_KEY,
    EDITOR_PAGES_DRAFT_STORAGE_KEY,
} from '../../../shared/constants/storageKeys.js';
import useTranslation from '../../../shared/translation/useTranslation.js';
import { useCanvasHistory } from './useCanvasHistory.js';
import {
    createDefaultPages,
    normalizeComponentsByPage,
    normalizePages,
} from '../services/pageState.js';

const loadDraftPages = () => {
    try {
        const saved = localStorage.getItem(EDITOR_PAGES_DRAFT_STORAGE_KEY);
        return normalizePages(saved ? JSON.parse(saved) : null);
    } catch (error) {
        console.error('Could not read editor pages from local storage:', error);
        return createDefaultPages();
    }
};

const loadDraftComponents = (pages) => {
    try {
        const saved = localStorage.getItem(EDITOR_DRAFT_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return normalizeComponentsByPage(parsed, pages);
    } catch (error) {
        console.error('Could not read the editor draft from local storage:', error);
        return [];
    }
};

const createComponentFromPaletteItem = (
    paletteItem,
    index,
    defaultDatasetId = '',
    pageId,
    targetLayout = null
) => {
    return {
        id: `${paletteItem.type}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${index}`}`,
        type: paletteItem.type,
        datasetId: defaultDatasetId,
        pageId,
        parentId: null,
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
    const [pages, setPages] = useState(() => (
        useDraftStorage ? loadDraftPages() : createDefaultPages()
    ));
    const [activePageId, setActivePageId] = useState(() => (
        (useDraftStorage ? loadDraftPages() : createDefaultPages())[0].id
    ));
    const {
        state: components,
        setState: setComponents,
        reset: resetComponents,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useCanvasHistory(() => {
        if (!useDraftStorage) {
            return [];
        }

        const draftPages = loadDraftPages();
        return loadDraftComponents(draftPages);
    });

    const [selectedId, setSelectedId] = useState(null);

    const replaceEditorState = useCallback((nextComponents, nextPages) => {
        const normalizedPages = normalizePages(nextPages);
        setPages(normalizedPages);
        setActivePageId(normalizedPages[0].id);
        resetComponents(normalizeComponentsByPage(nextComponents, normalizedPages));
        setSelectedId(null);
    }, [resetComponents]);

    useEffect(() => {
        if (!useDraftStorage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            try {
                localStorage.setItem(
                    EDITOR_DRAFT_STORAGE_KEY,
                    JSON.stringify(components)
                );
            } catch (error) {
                console.error('Could not save the editor draft to local storage:', error);
            }
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [components, useDraftStorage]);

    useEffect(() => {
        if (!useDraftStorage) return;
        const timeoutId = window.setTimeout(() => {
            try {
                localStorage.setItem(
                    EDITOR_PAGES_DRAFT_STORAGE_KEY,
                    JSON.stringify(pages)
                );
            } catch (error) {
                console.error('Could not save editor pages to local storage:', error);
            }
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [pages, useDraftStorage]);


    const selectedComponent = useMemo(() => {
        return components.find((item) => item.id === selectedId) || null;
    }, [components, selectedId]);

    const pageComponents = useMemo(
        () => components.filter((item) => item.pageId === activePageId),
        [activePageId, components]
    );


    const addComponent = useCallback((
        paletteItem,
        targetIndex,
        targetLayout = null,
        parentId = null
    ) => {
        const shouldInsert = Boolean(targetLayout?.insert);
        const componentLayout = targetLayout
            ? Object.fromEntries(
                Object.entries(targetLayout).filter(([key]) => !['insert', 'tabId'].includes(key))
            )
            : null;
        const newComponent = createComponentFromPaletteItem(
            paletteItem,
            components.length + 1,
            defaultDatasetId,
            activePageId,
            componentLayout
        );
        if (newComponent.type === 'page_link') {
            newComponent.config.targetPageId = (
                pages.find((page) => page.id !== activePageId)?.id
                || activePageId
            );
        }
        if (!['layout_group', 'tab_group'].includes(newComponent.type)) {
            newComponent.parentId = parentId;
            newComponent.tabId = targetLayout?.tabId || null;
        }
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
                return normalizeComponentsByPage(nextComponents, pages);
            }

            const layout = toReactGridLayout(nextComponents.filter(
                (component) => component.pageId === activePageId && !component.parentId
            ));
            const activeItem = layout.find((item) => item.i === newComponent.id);
            if (!activeItem) return normalizeComponentsByPage(nextComponents, pages);
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
        setSelectedId(null);
    }, [activePageId, components.length, defaultDatasetId, pages, setComponents]);

    const moveComponent = useCallback((id, parentId = null, targetLayout = null) => {
        setComponents((current) => {
            const next = current.map((component) => {
                if (component.id !== id) return component;
                const cleanTargetLayout = targetLayout
                    ? Object.fromEntries(
                        Object.entries(targetLayout).filter(([key]) => !['insert', 'tabId'].includes(key))
                    )
                    : null;
                const tabId = targetLayout?.tabId || null;
                return {
                    ...component,
                    parentId: ['layout_group', 'tab_group'].includes(component.type) ? null : parentId,
                    tabId: parentId ? tabId : null,
                    layout: {
                        ...component.layout,
                        ...(cleanTargetLayout || {}),
                    },
                };
            });
            return normalizeComponentsByPage(next, pages);
        });
    }, [pages, setComponents]);

    const reorderComponent = useCallback((activeId, overId) => {
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
    }, [setComponents]);

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

            return normalizeComponentsByPage([
                ...prev.slice(0, sourceIndex + 1),
                duplicate,
                ...prev.slice(sourceIndex + 1),
            ], pages);
        });
        setSelectedId(duplicate.id);
    }, [components, pages, setComponents]);

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
                    manualWidth: Boolean(item.manualWidth || component.layout?.manualWidth),
                    manualHeight: Boolean(item.manualHeight || component.layout?.manualHeight),
                },
                config: item.manualHeight
                    ? { ...component.config, heightMode: 'fixed' }
                    : component.config,
            };
        }));
    }, [setComponents]);

    const selectComponent = useCallback((id) => {
        setSelectedId(id);
    }, []);

    const updateComponent = useCallback((id, updater) => {
        setComponents((prev) =>
            prev.map((item) =>
                item.id === id ? updater(item) : item
            )
        );
    }, [setComponents]);

    const deleteComponent = useCallback((id) => {
        setComponents((prev) => prev
            .filter((item) => item.id !== id)
            .map((item) => (
                item.parentId === id ? { ...item, parentId: null } : item
            ))
        );
        setSelectedId((prev) => (prev === id ? null : prev));
    }, [setComponents]);

    const deleteSelectedComponent = useCallback(() => {
        if (!selectedId) return;
        deleteComponent(selectedId);
    }, [deleteComponent, selectedId]);

    const selectPage = useCallback((pageId) => {
        if (!pages.some((page) => page.id === pageId)) return;
        setActivePageId(pageId);
        setSelectedId(null);
    }, [pages]);

    const addPage = useCallback(() => {
        const page = {
            id: `page-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
            title: t('editor.pageDefaultTitle', { number: pages.length + 1 }),
        };
        setPages((current) => [...current, page]);
        setActivePageId(page.id);
        setSelectedId(null);
    }, [pages.length, t]);

    const renamePage = useCallback((pageId, title) => {
        const normalizedTitle = String(title || '').trim();
        if (!normalizedTitle) return;
        setPages((current) => current.map((page) => (
            page.id === pageId ? { ...page, title: normalizedTitle } : page
        )));
    }, []);

    const deletePage = useCallback((pageId) => {
        if (pages.length <= 1) return;
        const nextPages = pages.filter((page) => page.id !== pageId);
        setPages(nextPages);
        setComponents((current) => current
            .filter((component) => component.pageId !== pageId)
            .map((component) => (
                component.type === 'page_link' && component.config?.targetPageId === pageId
                    ? {
                        ...component,
                        config: {
                            ...component.config,
                            targetPageId: nextPages[0].id,
                        },
                    }
                    : component
            ))
        );
        setActivePageId((current) => (
            current === pageId ? nextPages[0].id : current
        ));
        setSelectedId(null);
    }, [pages, setComponents]);

    const clearCanvas = useCallback(() => {
        if (pageComponents.length === 0) return;
        const confirmed = window.confirm(
            t('editor.clearPageConfirm')
        );
        if (!confirmed) {
            return;
        }
        setComponents((current) => current.filter(
            (component) => component.pageId !== activePageId
        ));
        setSelectedId(null);
    }, [activePageId, pageComponents.length, setComponents, t]);

    return {
        components,
        pageComponents,
        pages,
        activePageId,
        setEditorState: replaceEditorState,
        selectedId,
        selectedComponent,
        addComponent,
        reorderComponent,
        moveComponent,
        duplicateComponent,
        setDashboardLayout,
        selectComponent,
        updateComponent,
        deleteComponent,
        deleteSelectedComponent,
        selectPage,
        addPage,
        renamePage,
        deletePage,
        clearCanvas,
        undo,
        redo,
        canUndo,
        canRedo,
    };
};
