import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useDroppable } from '@dnd-kit/core';
import CanvasItem from './CanvasItem';
import {
    GRID_COLUMNS,
    GRID_GAP,
    GRID_ROW_HEIGHT,
    moveGridItem,
    resizeGridItem,
    toReactGridLayout,
} from '../services/gridLayout.js';

const MIN_GRID_HEIGHT = 560;

const getGridItemStyle = (item, gridWidth) => {
    const safeGridWidth = Math.max(
        gridWidth,
        GRID_GAP * (GRID_COLUMNS - 1) + GRID_COLUMNS
    );
    const columnWidth = (
        safeGridWidth - GRID_GAP * (GRID_COLUMNS - 1)
    ) / GRID_COLUMNS;
    const unitWidth = columnWidth + GRID_GAP;
    const unitHeight = GRID_ROW_HEIGHT + GRID_GAP;

    return {
        left: item.x * unitWidth,
        top: item.y * unitHeight,
        width: item.w * columnWidth + (item.w - 1) * GRID_GAP,
        height: item.h * GRID_ROW_HEIGHT + (item.h - 1) * GRID_GAP,
    };
};

const Canvas = ({
                    components,
                    selectedId,
                    onSelect,
                    onDelete,
                    onDuplicate,
                    onLayoutChange,
                    isDragging,
                    dataRows = [],
                    isDataLoading = false,
                }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'dashboard-canvas',
        data: { source: 'canvas' },
    });
    const [filterValues, setFilterValues] = useState({});
    const gridRef = useRef(null);
    const interactionRef = useRef(null);
    const suppressSelectionRef = useRef(null);
    const [gridWidth, setGridWidth] = useState(0);
    const activeFilters = components.filter(
        (component) => component.type === 'selectbox'
    );
    const filteredRows = useMemo(() => (
        dataRows.filter((row) => activeFilters.every((filter) => {
            const selectedValue = filterValues[filter.id];
            const field = filter.bindings?.field;

            if (!selectedValue || !field) return true;
            return String(row[field]) === selectedValue;
        }))
    ), [activeFilters, dataRows, filterValues]);
    const gridLayout = useMemo(
        () => toReactGridLayout(components),
        [components]
    );

    useEffect(() => {
        const node = gridRef.current;
        if (!node) return undefined;

        const measure = () => {
            setGridWidth(node.getBoundingClientRect().width);
        };
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const beginInteraction = useCallback((event, id, mode) => {
        if (event.button !== 0 || !gridWidth || interactionRef.current) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const gridNode = gridRef.current;
        const sourceNode = gridNode?.querySelector(
            `[data-grid-item="${CSS.escape(id)}"]`
        );
        if (!gridNode || !sourceNode) return;

        const ghostNode = sourceNode.cloneNode(true);
        ghostNode.removeAttribute('data-grid-item');
        ghostNode.setAttribute('aria-hidden', 'true');
        ghostNode.classList.add('dashboard-interaction-ghost');
        sourceNode.classList.add('dashboard-interaction-source');
        gridNode.appendChild(ghostNode);

        const previousUserSelect = document.body.style.userSelect;
        const previousCursor = document.body.style.cursor;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = mode === 'drag'
            ? 'grabbing'
            : 'se-resize';

        const nextInteraction = {
            id,
            mode,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLayout: gridLayout.map((item) => ({ ...item })),
            currentLayout: gridLayout.map((item) => ({ ...item })),
            didMove: false,
            sourceNode,
            ghostNode,
        };

        const handlePointerMove = (event) => {
            if (event.pointerId !== nextInteraction.pointerId) return;

            event.preventDefault();
            if (
                Math.abs(event.clientX - nextInteraction.startX) > 3
                || Math.abs(event.clientY - nextInteraction.startY) > 3
            ) {
                nextInteraction.didMove = true;
            }
            const columnWidth = (
                gridWidth - GRID_GAP * (GRID_COLUMNS - 1)
            ) / GRID_COLUMNS;
            const deltaColumns = (
                event.clientX - nextInteraction.startX
            ) / (columnWidth + GRID_GAP);
            const deltaRows = (
                event.clientY - nextInteraction.startY
            ) / (GRID_ROW_HEIGHT + GRID_GAP);
            const nextLayout = nextInteraction.mode === 'drag'
                ? moveGridItem(
                    nextInteraction.startLayout,
                    nextInteraction.id,
                    deltaColumns,
                    deltaRows
                )
                : resizeGridItem(
                    nextInteraction.startLayout,
                    nextInteraction.id,
                    deltaColumns,
                    deltaRows
                );
            const activeItem = nextLayout.find((item) => item.i === id);
            if (!activeItem) return;

            const style = getGridItemStyle(activeItem, gridWidth);
            Object.assign(ghostNode.style, {
                left: `${style.left}px`,
                top: `${style.top}px`,
                width: `${style.width}px`,
                height: `${style.height}px`,
            });
            nextInteraction.currentLayout = nextLayout;
        };

        const finishInteraction = (finishEvent) => {
            if (finishEvent.pointerId !== nextInteraction.pointerId) return;

            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', finishInteraction);
            window.removeEventListener('pointercancel', finishInteraction);
            ghostNode.remove();
            sourceNode.classList.remove('dashboard-interaction-source');
            document.body.style.userSelect = previousUserSelect;
            document.body.style.cursor = previousCursor;

            if (nextInteraction.didMove) {
                onLayoutChange(nextInteraction.currentLayout);
                suppressSelectionRef.current = nextInteraction.id;
                window.setTimeout(() => {
                    if (suppressSelectionRef.current === nextInteraction.id) {
                        suppressSelectionRef.current = null;
                    }
                }, 0);
            }
            interactionRef.current = null;
        };

        window.addEventListener('pointermove', handlePointerMove, {
            passive: false,
        });
        window.addEventListener('pointerup', finishInteraction);
        window.addEventListener('pointercancel', finishInteraction);
        interactionRef.current = {
            cancel: () => {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', finishInteraction);
                window.removeEventListener('pointercancel', finishInteraction);
                ghostNode.remove();
                sourceNode.classList.remove('dashboard-interaction-source');
                document.body.style.userSelect = previousUserSelect;
                document.body.style.cursor = previousCursor;
            },
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }, [gridLayout, gridWidth, onLayoutChange]);

    useEffect(() => () => {
        interactionRef.current?.cancel?.();
        interactionRef.current = null;
    }, []);

    const handleFilterChange = (id, value) => {
        setFilterValues((current) => ({
            ...current,
            [id]: value,
        }));
    };

    const handleItemSelect = useCallback((id) => {
        if (suppressSelectionRef.current === id) {
            suppressSelectionRef.current = null;
            return;
        }
        onSelect(id);
    }, [onSelect]);

    const gridHeight = Math.max(
        MIN_GRID_HEIGHT,
        ...gridLayout.map((item) => (
            (item.y + item.h) * (GRID_ROW_HEIGHT + GRID_GAP) - GRID_GAP
        ))
    );

    return (
        <section
            ref={setNodeRef}
            onClick={(event) => {
                if (!event.target.closest('[data-canvas-item]')) {
                    onSelect(null);
                }
            }}
            style={{
                backgroundImage: 'radial-gradient(rgba(113, 113, 122, 0.16) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }}
            className={`min-h-[calc(100vh-98px)] w-full rounded-3xl border bg-zinc-950 p-5 shadow-2xl shadow-black/20 transition ${
                isOver
                    ? 'border-blue-500 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]'
                    : 'border-zinc-800'
            }`}
        >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/80 pb-5">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-white">
                            Холст дашборда
                        </h2>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                            Live
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                        Перетаскивайте карточки и тяните за угол — размер каждого элемента независим
                    </p>
                </div>

                <div className="flex items-center gap-2 text-right text-xs text-zinc-500">
                    <span className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5">
                        {GRID_COLUMNS} колонок
                    </span>
                    {isDataLoading ? (
                        <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-blue-300">
                            Загрузка данных…
                        </span>
                    ) : (
                        <span className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5">
                            {filteredRows.length} из {dataRows.length} строк
                        </span>
                    )}
                </div>
            </div>

            {components.length === 0 ? (
                <div className={`flex min-h-[560px] items-center justify-center rounded-2xl border border-dashed bg-zinc-900/40 transition ${
                    isOver ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800'
                }`}>
                    <div className="text-center">
                        <h3 className="mb-2 text-lg font-medium text-white">
                            Холст пока пуст
                        </h3>
                        <p className="text-sm text-zinc-400">
                            Перетащите элемент из библиотеки или добавьте его кликом
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    ref={gridRef}
                    className="dashboard-layout-grid relative w-full"
                    style={{ height: gridHeight }}
                >
                    {gridLayout.map((layoutItem) => {
                        const item = components.find(
                            (component) => component.id === layoutItem.i
                        );
                        if (!item) return null;

                        return (
                        <div
                            key={item.id}
                            data-grid-item={item.id}
                            className="absolute z-0"
                            style={getGridItemStyle(layoutItem, gridWidth)}
                        >
                            <CanvasItem
                                item={item}
                                isSelected={selectedId === item.id}
                                onSelect={handleItemSelect}
                                onDelete={onDelete}
                                onDuplicate={onDuplicate}
                                rows={item.type === 'selectbox'
                                    ? dataRows
                                    : filteredRows}
                                filterValue={filterValues[item.id] || ''}
                                onFilterChange={(value) => (
                                    handleFilterChange(item.id, value)
                                )}
                                onDragPointerDown={(event) => (
                                    beginInteraction(event, item.id, 'drag')
                                )}
                                onResizePointerDown={(event) => (
                                    beginInteraction(event, item.id, 'resize')
                                )}
                                isInteracting={false}
                            />
                        </div>
                        );
                    })}
                </div>
            )}

            {isDragging && components.length > 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-3 text-center text-xs text-blue-200">
                    Отпустите новый компонент над холстом
                </div>
            )}
        </section>
    );
};

export default Canvas;
