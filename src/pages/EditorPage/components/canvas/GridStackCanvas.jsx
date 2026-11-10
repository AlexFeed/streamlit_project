import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';

import CanvasItem from './CanvasItem.jsx';
import { paletteItems } from '../../data/paletteItems.js';
import {
    GRID_COLUMNS,
    GRID_ROW_HEIGHT,
    contentHeightToGridUnits,
    getComponentGridWidth,
} from '../../services/gridLayout.js';

const compactTypes = new Set(['text', 'metric', 'selectbox', 'page_link']);
const compactMinimumWidths = {
    metric: 2,
    page_link: 2,
    selectbox: 3,
    text: 2,
};

const getMinimumGridWidth = (type) => (
    compactMinimumWidths[type]
    || paletteItems[type]?.minWidth
    || 1
);

const getGridWidth = (item, components) => Math.max(
    getMinimumGridWidth(item.type),
    getComponentGridWidth(item, components)
);

const GridStackCanvas = ({
    components,
    allComponents,
    selectedId,
    onSelect,
    onDelete,
    onDuplicate,
    onLayoutChange,
    rowsForComponent,
    filterValues,
    onFilterChange,
    pages,
    onMoveToContainer,
    onReorderComponent,
    legacyGridRef,
}) => {
    const rootRef = useRef(null);
    const gridRef = useRef(null);
    const resizeStartRef = useRef(null);
    const componentsRef = useRef(components);
    const onLayoutChangeRef = useRef(onLayoutChange);
    const onMoveToContainerRef = useRef(onMoveToContainer);

    useEffect(() => {
        componentsRef.current = components;
        onLayoutChangeRef.current = onLayoutChange;
        onMoveToContainerRef.current = onMoveToContainer;
    }, [components, onLayoutChange, onMoveToContainer]);

    const options = useMemo(() => ({
        column: GRID_COLUMNS,
        cellHeight: GRID_ROW_HEIGHT + 8,
        margin: 4,
        minRow: 20,
        animate: true,
        float: true,
        alwaysShowResizeHandle: true,
        draggable: {
            handle: '.canvas-item-card',
            cancel: 'button,input,textarea,select,option,a,[data-no-canvas-drag],[data-container-child],.recharts-wrapper',
            scroll: true,
        },
        resizable: {
            handles: 'e,s,se',
        },
    }), []);

    const commitLayout = useCallback((resize = null) => {
        const grid = gridRef.current;
        if (!grid) return;

        const componentById = new Map(
            componentsRef.current.map((component) => [component.id, component])
        );
        const layout = grid.engine.nodes
            .filter((node) => node.id && componentById.has(String(node.id)))
            .map((node) => {
                const id = String(node.id);
                const component = componentById.get(id);
                return {
                    i: id,
                    x: node.x || 0,
                    y: node.y || 0,
                    w: node.w || 1,
                    h: node.h || 1,
                    manualWidth: (id === resize?.id && resize.manualWidth)
                        || Boolean(component.layout?.manualWidth),
                    manualHeight: (id === resize?.id && resize.manualHeight)
                        || Boolean(component.layout?.manualHeight),
                };
            });

        onLayoutChangeRef.current(layout);
    }, []);

    useLayoutEffect(() => {
        if (!rootRef.current) return undefined;

        const grid = GridStack.init(options, rootRef.current);
        gridRef.current = grid;

        const beginResize = (_event, element) => {
            grid.el.classList.add('is-gridstack-resizing');
            const node = element?.gridstackNode;
            resizeStartRef.current = node ? {
                id: String(node.id),
                width: node.w,
                height: node.h,
            } : null;
        };
        const finishResize = (_event, element) => {
            grid.el.classList.remove('is-gridstack-resizing');
            const node = element?.gridstackNode;
            const start = resizeStartRef.current;
            commitLayout(node?.id ? {
                id: String(node.id),
                manualWidth: !start || node.w !== start.width,
                manualHeight: !start || node.h !== start.height,
            } : null);
            resizeStartRef.current = null;
        };
        const snapResizePreview = (_event, element) => {
            const node = element?.gridstackNode;
            if (!node) return;

            // GridStack calculates the destination in grid cells, while its
            // native resize helper follows every mouse pixel. Keep the visible
            // card on the same snapped dimensions that will be saved on drop,
            // otherwise the card appears to jump to the placeholder size.
            element.style.width = `${node.w * grid.cellWidth()}px`;
            element.style.height = `${node.h * grid.getCellHeight(true)}px`;
        };

        const finishDrag = (event, element) => {
            commitLayout();

            const draggedId = String(element?.gridstackNode?.id || '');
            if (!draggedId || !Number.isFinite(event?.clientX) || !Number.isFinite(event?.clientY)) {
                return;
            }

            const target = componentsRef.current.find((component) => {
                if (component.id === draggedId || component.type !== 'layout_group') return false;
                const targetElement = rootRef.current?.querySelector(
                    `[data-gridstack-id="${CSS.escape(component.id)}"]`
                );
                if (!targetElement) return false;
                const rect = targetElement.getBoundingClientRect();
                return event.clientX >= rect.left
                    && event.clientX <= rect.right
                    && event.clientY >= rect.top
                    && event.clientY <= rect.bottom;
            });

            if (target) {
                onMoveToContainerRef.current?.(draggedId, target.id, null);
            }
        };

        grid.on('dragstop', finishDrag);
        grid.on('resizestart', beginResize);
        grid.on('resize', snapResizePreview);
        grid.on('resizestop', finishResize);

        return () => {
            grid.el.classList.remove('is-gridstack-resizing');
            resizeStartRef.current = null;
            grid.offAll();
            grid.destroy(false);
            gridRef.current = null;
        };
    }, [commitLayout, options]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root || typeof ResizeObserver === 'undefined') return undefined;

        let frameId = 0;
        const observer = new ResizeObserver(([entry]) => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(() => {
                gridRef.current?.onResize(entry.contentRect.width);
            });
        });
        observer.observe(root);

        return () => {
            observer.disconnect();
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    const widgetSignature = components.map((item) => [
        item.id,
        item.layout?.x,
        item.layout?.y,
        item.layout?.width,
        item.layout?.height,
        item.layout?.autoWidth,
    ].join(':')).join('|');

    useLayoutEffect(() => {
        const grid = gridRef.current;
        const root = rootRef.current;
        if (!grid || !root) return;

        const componentIds = new Set(components.map((item) => item.id));
        grid.batchUpdate();

        [...grid.engine.nodes].forEach((node) => {
            if (node.id && !componentIds.has(String(node.id)) && node.el) {
                grid.removeWidget(node.el, false);
            }
        });

        components.forEach((item) => {
            const element = root.querySelector(
                `[data-gridstack-id="${CSS.escape(item.id)}"]`
            );
            if (!element) return;

            const widget = {
                id: item.id,
                x: Number.isFinite(item.layout?.x) ? item.layout.x : undefined,
                y: Number.isFinite(item.layout?.y) ? item.layout.y : undefined,
                w: getGridWidth(item, allComponents),
                h: contentHeightToGridUnits(item.layout?.height, item.type),
                minW: getMinimumGridWidth(item.type),
                minH: compactTypes.has(item.type) ? 2 : 4,
                autoPosition: !Number.isFinite(item.layout?.x)
                    || !Number.isFinite(item.layout?.y),
            };

            if (element.gridstackNode) {
                grid.update(element, widget);
            } else {
                grid.makeWidget(element, widget);
            }
        });

        grid.batchUpdate(false);
    }, [allComponents, components, widgetSignature]);

    const setRootNode = useCallback((node) => {
        rootRef.current = node;
        legacyGridRef?.(node);
    }, [legacyGridRef]);

    return (
        <div className="gridstack-canvas-shell">
            <div
                ref={setRootNode}
                className="grid-stack gridstack-dashboard-grid"
            >
                {components.map((item) => {
                    const { rows, rawRows } = rowsForComponent(item);
                    return (
                        <div
                            key={item.id}
                            className="grid-stack-item"
                            data-canvas-grid-item
                            data-gridstack-id={item.id}
                            gs-id={item.id}
                            gs-x={item.layout?.x}
                            gs-y={item.layout?.y}
                            gs-w={getGridWidth(item, allComponents)}
                            gs-h={contentHeightToGridUnits(item.layout?.height, item.type)}
                        >
                            <div className="grid-stack-item-content">
                                <CanvasItem
                                    item={item}
                                    isSelected={selectedId === item.id}
                                    onSelect={onSelect}
                                    onDelete={onDelete}
                                    onDuplicate={onDuplicate}
                                    rows={item.type === 'selectbox' ? rawRows : rows}
                                    filterValue={filterValues[item.id] || ''}
                                    onFilterChange={onFilterChange}
                                    onBeginInteraction={() => {}}
                                    pages={pages}
                                    children={allComponents
                                        .filter((component) => component.parentId === item.id)
                                        .map((component) => {
                                            const childRows = rowsForComponent(component);
                                            return {
                                                item: component,
                                                rows: component.type === 'selectbox'
                                                    ? childRows.rawRows
                                                    : childRows.rows,
                                                filterValue: filterValues[component.id] || '',
                                            };
                                        })}
                                    selectedId={selectedId}
                                    onMoveChild={(childId, targetContainerId) => {
                                        onMoveToContainer?.(childId, targetContainerId, null);
                                    }}
                                    onReorderChild={onReorderComponent}
                                    managedByGridStack
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GridStackCanvas;
