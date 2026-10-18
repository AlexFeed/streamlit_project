import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import CanvasItem from './canvas/CanvasItem';
import {
    GRID_COLUMNS,
    contentHeightToGridUnits,
} from '../services/gridLayout.js';
import {
    getGridItemStyle,
    useCanvasGrid,
} from '../hooks/useCanvasGrid.js';

const Canvas = ({
                    components,
                    selectedId,
                    onSelect,
                    onDelete,
                    onDuplicate,
                    onLayoutChange,
                    isDragging,
                    datasets = [],
                    previewRowsByDataset = {},
                    isDataLoading = false,
                }) => {
    const [filterValues, setFilterValues] = useState({});
    const [dropPreview, setDropPreview] = useState(null);

    const {
        gridWidth,
        gridLayout,
        gridHeight,
        setGridNode,
        beginInteraction,
        handleItemSelect,
        getPaletteDropLayout,
        insertionPreview,
    } = useCanvasGrid({
        components,
        onLayoutChange,
        onSelect,
    });
    const { setNodeRef, isOver } = useDroppable({
        id: 'dashboard-canvas',
        data: {
            source: 'canvas',
            getPaletteDropLayout,
        },
    });

    useDndMonitor({
        onDragMove: ({ active, over }) => {
            const dragData = active.data.current;
            if (dragData?.source !== 'palette' || over?.id !== 'dashboard-canvas') {
                setDropPreview(null);
                return;
            }
            const layout = getPaletteDropLayout(
                active.rect.current.translated,
                dragData.paletteItem
            );
            setDropPreview(layout
                ? { ...layout, type: dragData.paletteItem.type }
                : null);
        },
        onDragCancel: () => setDropPreview(null),
        onDragEnd: () => setDropPreview(null),
    });

    const defaultDatasetId = datasets[0]?.datasetId || '';

    const resolveDatasetId = useCallback(
        (component) => {
            if (
                component?.datasetId &&
                datasets.some((ds) => ds.datasetId === component.datasetId)
            ) {
                return component.datasetId;
            }
            return defaultDatasetId;
        },
        [datasets, defaultDatasetId]
    );

    const activeFilters = useMemo(
        () => components.filter((component) => component.type === 'selectbox'),
        [components]
    );

    const filteredRowsByDataset = useMemo(() => {
        const result = {};

        datasets.forEach((ds) => {
            const rawRows = previewRowsByDataset[ds.datasetId] || [];
            const datasetFilters = activeFilters.filter(
                (filter) => resolveDatasetId(filter) === ds.datasetId
            );

            result[ds.datasetId] = rawRows.filter((row) =>
                datasetFilters.every((filter) => {
                    const selectedValue = filterValues[filter.id];
                    const field = filter.bindings?.field;

                    if (!selectedValue || !field) return true;
                    return String(row[field]) === selectedValue;
                })
            );
        });

        return result;
    }, [datasets, previewRowsByDataset, activeFilters, filterValues, resolveDatasetId]);

    const handleFilterChange = useCallback((id, value) => {
        setFilterValues((current) => ({
            ...current,
            [id]: value,
        }));
    }, []);

    const visibleDropPreview = (
        insertionPreview
        || (isDragging ? dropPreview : null)
    );

    const dropPreviewStyle = useMemo(() => {
        if (!visibleDropPreview) return null;
        const style = getGridItemStyle({
            x: visibleDropPreview.x,
            y: visibleDropPreview.y,
            w: visibleDropPreview.width ?? visibleDropPreview.w,
            h: visibleDropPreview.insert
                ? 1
                : contentHeightToGridUnits(
                    visibleDropPreview.height,
                    visibleDropPreview.type
                ),
        }, gridWidth);
        return visibleDropPreview.insert
            ? { ...style, top: style.top - 2, height: 4 }
            : style;
    }, [visibleDropPreview, gridWidth]);

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
                            {datasets.length > 1
                                ? `${datasets.length} CSV · ${Object.values(filteredRowsByDataset).reduce((acc, rows) => acc + rows.length, 0)} строк`
                                : `${(filteredRowsByDataset[defaultDatasetId] || []).length} из ${(previewRowsByDataset[defaultDatasetId] || []).length} строк`}
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
                    ref={setGridNode}
                    className="dashboard-layout-grid relative w-full"
                    style={{ height: gridHeight }}
                >
                    {visibleDropPreview && (
                        <div
                            className={`pointer-events-none absolute z-20 ${
                                visibleDropPreview.insert
                                    ? 'rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.9)]'
                                    : 'rounded-2xl border-2 border-dashed border-blue-400 bg-blue-500/15 shadow-[0_0_32px_rgba(59,130,246,0.18)]'
                            }`}
                            style={dropPreviewStyle}
                        >
                            {!visibleDropPreview.insert && (
                                <div className="flex h-full items-center justify-center px-3 text-center text-xs font-medium text-blue-200">
                                    Разместить здесь
                                </div>
                            )}
                        </div>
                    )}
                    {gridLayout.map((layoutItem) => {
                        const item = components.find(
                            (component) => component.id === layoutItem.i
                        );
                        if (!item) return null;

                        const itemDatasetId = resolveDatasetId(item);
                        const itemRawRows = previewRowsByDataset[itemDatasetId] || [];
                        const itemFilteredRows = filteredRowsByDataset[itemDatasetId] || [];

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
                                        ? itemRawRows
                                        : itemFilteredRows}
                                    filterValue={filterValues[item.id] || ''}
                                    onFilterChange={handleFilterChange}
                                    onBeginInteraction={beginInteraction}
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
