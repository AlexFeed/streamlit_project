import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    gridUnitsToContentHeight,
    resolveGridCollisions,
    normalizeGridWidth,
    toReactGridLayout,
} from '../services/gridLayout.js';
import {
    createDefaultPages,
    normalizeComponentsByPage,
    normalizePages,
} from '../services/pageState.js';
import {
    EDITOR_DRAFT_STORAGE_KEY,
    EDITOR_PAGES_DRAFT_STORAGE_KEY,
} from '../../../shared/constants/storageKeys.js';

// Hook отвечает за управление состоянием локальных компонентов дашборда, их загрузка в LocalStorage

const loadDraftPages = () => {
    try {
        const saved = localStorage.getItem(EDITOR_PAGES_DRAFT_STORAGE_KEY);
        return normalizePages(saved ? JSON.parse(saved) : null);
    } catch (error) {
        console.error('Ошибка чтения страниц editor из localStorage:', error);
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
        console.error('Ошибка чтения черновика editor из localStorage:', error);
        return [];
    }
};

// Создание компоненты для холста
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

// Управление всем состоянием редактора
export const useEditorState = ({ useDraftStorage = true, defaultDatasetId = ''}) => {
    const [pages, setPages] = useState(() => (
        useDraftStorage ? loadDraftPages() : createDefaultPages()
    ));
    const [activePageId, setActivePageId] = useState(() => (
        (useDraftStorage ? loadDraftPages() : createDefaultPages())[0].id
    ));

    // Управление состоянием компонентов для draft (только для /editor)
    const [components, setComponents] = useState(() => {
        if (!useDraftStorage) {
            return [];
        }

        const draftPages = loadDraftPages();
        return loadDraftComponents(draftPages);
    });

    // Управление состоянием выбранного элемента на холсте
    const [selectedId, setSelectedId] = useState(null);

    const replaceEditorState = useCallback((nextComponents, nextPages) => {
        const normalizedPages = normalizePages(nextPages);
        setPages(normalizedPages);
        setActivePageId(normalizedPages[0].id);
        setComponents(normalizeComponentsByPage(nextComponents, normalizedPages));
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

    useEffect(() => {
        if (!useDraftStorage) return;

        try {
            localStorage.setItem(
                EDITOR_PAGES_DRAFT_STORAGE_KEY,
                JSON.stringify(pages)
            );
        } catch (error) {
            console.error('Ошибка сохранения страниц editor в localStorage:', error);
        }
    }, [pages, useDraftStorage]);


    const selectedComponent = useMemo(() => {
        return components.find((item) => item.id === selectedId) || null;
    }, [components, selectedId]);

    const pageComponents = useMemo(
        () => components.filter((item) => item.pageId === activePageId),
        [components, activePageId]
    );


    // Добавление компонента на холст
    const addComponent = (
        paletteItem,
        targetIndex,
        targetLayout = null,
        parentId = null
    ) => {
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
            activePageId,
            componentLayout
        );
        if (newComponent.type === 'page_link') {
            newComponent.config.targetPageId = (
                pages.find((page) => page.id !== activePageId)?.id
                || activePageId
            );
        }
        if (newComponent.type !== 'layout_group') {
            newComponent.parentId = parentId;
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

            const currentPageComponents = nextComponents.filter(
                (component) => component.pageId === activePageId
            );
            const layout = toReactGridLayout(currentPageComponents);
            const activeItem = layout.find((item) => item.i === newComponent.id);
            if (!activeItem) {
                return normalizeComponentsByPage(nextComponents, pages);
            }
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

    const moveComponent = useCallback((id, parentId = null, targetLayout = null) => {
        setComponents((current) => {
            const next = current.map((component) => {
                if (component.id !== id) return component;

                const nextParentId = component.type === 'layout_group'
                    ? null
                    : parentId;
                const cleanTargetLayout = targetLayout
                    ? Object.fromEntries(
                        Object.entries(targetLayout).filter(([key]) => key !== 'insert')
                    )
                    : null;

                return {
                    ...component,
                    parentId: nextParentId,
                    layout: {
                        ...component.layout,
                        ...(cleanTargetLayout || {}),
                    },
                };
            });

            const normalized = normalizeComponentsByPage(next, pages);
            if (parentId || !targetLayout?.insert) {
                return normalized;
            }

            const pageLayout = toReactGridLayout(normalized.filter(
                (component) => (
                    component.pageId === activePageId
                    && !component.parentId
                )
            ));
            const activeItem = pageLayout.find((item) => item.i === id);
            if (!activeItem) return normalized;

            const resolved = resolveGridCollisions(pageLayout, id, activeItem);
            const layoutById = new Map(resolved.map((item) => [item.i, item]));
            return normalized.map((component) => {
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
        setSelectedId(id);
    }, [activePageId, pages]);

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
    }, [components, pages]);

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
                    manualWidth: Boolean(
                        item.manualWidth || component.layout?.manualWidth
                    ),
                    manualHeight: Boolean(
                        item.manualHeight || component.layout?.manualHeight
                    ),
                },
                config: item.manualHeight
                    ? { ...component.config, heightMode: 'fixed' }
                    : component.config,
            };
        }));
    }, []);

    // Выбор текущего компонента на холсте
    const selectComponent = useCallback((id) => {
        setSelectedId(id);
    }, []);

    // Изменение данных в компоненте на холсте (например название графика)
    const updateComponent = (id, updater) => {
        setComponents((prev) =>
            prev.map((item) =>
                item.id === id ? updater(item) : item
            )
        );
    };

    // Удаление компонента с холста
    const deleteComponent = useCallback((id) => {
        setComponents((prev) => prev
            .filter((item) => item.id !== id)
            .map((item) => (
                item.parentId === id ? { ...item, parentId: null } : item
            ))
        );
        setSelectedId((prev) => (prev === id ? null : prev));
    }, []);

    // Удаление выбранного компонента с холста
    const deleteSelectedComponent = () => {
        if (!selectedId) return;
        deleteComponent(selectedId);
    };

    const selectPage = useCallback((pageId) => {
        if (!pages.some((page) => page.id === pageId)) return;
        setActivePageId(pageId);
        setSelectedId(null);
    }, [pages]);

    const addPage = useCallback(() => {
        const page = {
            id: `page-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
            title: `Страница ${pages.length + 1}`,
        };
        setPages((current) => [...current, page]);
        setActivePageId(page.id);
        setSelectedId(null);
    }, [pages.length]);

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
        setComponents((current) => current.filter(
            (component) => component.pageId !== pageId
        ));
        setActivePageId((current) => (
            current === pageId ? nextPages[0].id : current
        ));
        setSelectedId(null);
    }, [pages]);

    // Очистка холста целиком
    const clearCanvas = () => {
        if (pageComponents.length === 0) return;
        const confirmed = window.confirm(
            'Очистить текущую страницу? Все её компоненты будут удалены.'
        );
        if (!confirmed) {
            return;
        }
        setComponents((current) => current.filter(
            (component) => component.pageId !== activePageId
        ));
        setSelectedId(null);
    };

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
    };
};
