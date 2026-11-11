import {
    useCallback,
    useEffect,
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
import useTranslation from '../../../shared/translation/useTranslation.js';
import { calculateMetric, formatMetricValue } from '../services/chartData.js';

const clampAutoWidth = (value) => Math.max(2, Math.min(4, value));

const getDataDrivenWidth = (component, rows) => {
    if (component.layout?.manualWidth) return null;

    if (component.type === 'metric') {
        if (!component.bindings?.valueField) return 2;
        const value = formatMetricValue(calculateMetric(rows, component));
        const estimatedPixels = Math.max(120, value.length * 16 + 32);
        return clampAutoWidth(Math.ceil(estimatedPixels / 80));
    }

    if (component.type === 'selectbox') {
        const field = component.bindings?.field;
        if (!field) return 2;
        const longestValue = rows.reduce((longest, row) => (
            Math.max(longest, String(row[field] ?? '').length)
        ), 0);
        const titleLength = String(component.config?.title || '').length;
        const estimatedPixels = Math.max(120, Math.max(longestValue, titleLength) * 7 + 64);
        return clampAutoWidth(Math.ceil(estimatedPixels / 80));
    }

    return null;
};

// Constant for proper UseMemo work
const NO_CHILDREN = [];

const Canvas = ({
                    components,
                    selectedId,
                    onSelect,
                    onDelete,
                    onDuplicate,
                    onLayoutChange,
                    onMoveToContainer,
                    onReorderComponent,
                    isDragging,
                    datasets = [],
                    previewRowsByDataset = {},
                    isDataLoading = false,
                    canvasRef,
                    pages = [],
                }) => {
    const { t } = useTranslation();
    const [filterValues, setFilterValues] = useState({});
    const [dropPreview, setDropPreview] = useState(null);
    const layoutComponents = useMemo(
        () => components.filter((component) => !component.parentId),
        [components]
    );
    const defaultDatasetId = datasets[0]?.datasetId || '';
    const resolveDatasetId = useCallback(
        (component) => {
            if (
                component?.datasetId
                && datasets.some((ds) => ds.datasetId === component.datasetId)
            ) {
                return component.datasetId;
            }
            return defaultDatasetId;
        },
        [datasets, defaultDatasetId]
    );
    const autoSizedLayoutComponents = useMemo(
        () => layoutComponents.map((component) => {
            const rows = previewRowsByDataset[resolveDatasetId(component)] || [];
            const autoWidth = getDataDrivenWidth(component, rows);
            if (autoWidth == null) return component;
            return {
                ...component,
                layout: { ...component.layout, autoWidth },
            };
        }),
        [layoutComponents, previewRowsByDataset, resolveDatasetId]
    );

    const {
        gridWidth,
        gridLayout,
        gridHeight,
        setGridNode,
        beginInteraction,
        handleItemSelect,
        getPaletteDropLayout,
        insertionPreview,
        containerDropTargetId,
    } = useCanvasGrid({
        components: autoSizedLayoutComponents,
        onLayoutChange,
        onSelect,
        onMoveToContainer,
    });
    useEffect(() => {
        const layoutById = new Map(
            layoutComponents.map((component) => [component.id, component])
        );
        const needsSynchronization = gridLayout.some((item) => {
            const component = layoutById.get(item.i) || {};
            const current = component.layout || {};
            return current.x !== item.x
                || current.y !== item.y
                || current.width !== item.w
                || contentHeightToGridUnits(current.height, component.type) !== item.h;
        });
        if (needsSynchronization) onLayoutChange(gridLayout);
    }, [gridLayout, layoutComponents, onLayoutChange]);
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

    const activeFilters = useMemo(
        () => components.filter((component) => component.type === 'selectbox'),
        [components]
    );

    // Skip iterating through thousands of rows when no filters have values selected.
    const hasActiveFilterValues = useMemo(() => (
        activeFilters.some((filter) => {
            const value = filterValues[filter.id];
            return Array.isArray(value) ? value.length > 0 : Boolean(value);
        })
    ), [activeFilters, filterValues]);

    const filteredRowsByDataset = useMemo(() => {
        if (!hasActiveFilterValues) {
            return previewRowsByDataset;
        }

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
                    if (Array.isArray(selectedValue)) {
                        return selectedValue.length === 0
                            || selectedValue.includes(String(row[field]));
                    }
                    return String(row[field]) === selectedValue;
                })
            );
        });

        return result;
    }, [hasActiveFilterValues, datasets, previewRowsByDataset, activeFilters, filterValues, resolveDatasetId]);

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
                ? (visibleDropPreview.axis === 'x'
                    ? (visibleDropPreview.h || visibleDropPreview.gridHeight || 1)
                    : 1)
                : visibleDropPreview.gridHeight ?? contentHeightToGridUnits(
                    visibleDropPreview.height,
                    visibleDropPreview.type
                ),
        }, gridWidth);
        return visibleDropPreview.insert
            ? visibleDropPreview.axis === 'x'
                ? {
                    ...style,
                    left: style.left - 2,
                    width: 4,
                }
                : {
                ...style,
                left: style.left + (visibleDropPreview.displayLeftOffset ?? 0),
                top: style.top - 2,
                width: visibleDropPreview.displayWidth ?? style.width,
                height: 4,
                }
            : style;
    }, [visibleDropPreview, gridWidth]);

    return (
        <section
            ref={(node) => {
                setNodeRef(node);
                if (canvasRef) {
                    canvasRef.current = node;
                }
            }}
            data-dashboard-canvas
            onClick={(event) => {
                if (!event.target.closest('[data-canvas-item]')) {
                    onSelect(null);
                }
            }}
            className={`dashboard-canvas${isOver ? ' is-over' : ''}`}
        >
            <div className="dashboard-canvas-header">
                <div>
                    <div className="dashboard-canvas-heading">
                        <h2>
                            {t('editor.canvasTitle')}
                        </h2>
                    </div>
                    <p className="dashboard-canvas-description">
                        {t('editor.canvasDescription')}
                    </p>
                </div>

                <div className="dashboard-canvas-stats">
                    <span className="dashboard-stat">
                        {t('editor.columns', { count: GRID_COLUMNS })}
                    </span>
                    {isDataLoading ? (
                        <span className="dashboard-stat is-loading">
                            {t('editor.loadingData')}
                        </span>
                    ) : (
                        <span className="dashboard-stat">
                            {datasets.length > 1
                                ? t('editor.datasetRows', {
                                    count: datasets.length,
                                    rows: Object.values(filteredRowsByDataset).reduce((acc, rows) => acc + rows.length, 0),
                                })
                                : t('editor.rowRange', {
                                    shown: (filteredRowsByDataset[defaultDatasetId] || []).length,
                                    total: (previewRowsByDataset[defaultDatasetId] || []).length,
                                })}
                        </span>
                    )}
                </div>
            </div>

            {layoutComponents.length === 0 ? (
                <div className={`dashboard-canvas-empty${isOver ? ' is-over' : ''}`}>
                    <div>
                        <h3>
                            {t('editor.canvasEmptyTitle')}
                        </h3>
                        <p>
                            {t('editor.canvasEmptyDescription')}
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    ref={setGridNode}
                    className="dashboard-layout-grid dashboard-grid"
                    style={{ height: gridHeight }}
                >
                    {visibleDropPreview && (
                        <div
                            className={`dashboard-drop-preview${visibleDropPreview.insert ? ' is-insertion' : ''}`}
                            style={dropPreviewStyle}
                        >
                            {!visibleDropPreview.insert && (
                                <div className="dashboard-drop-label">
                                    {t('editor.dropHere')}
                                </div>
                            )}
                        </div>
                    )}
                    {gridLayout.map((layoutItem) => {
                        const item = layoutComponents.find(
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
                                className="dashboard-grid-item"
                                style={{
                                    ...getGridItemStyle(layoutItem, gridWidth),
                                    boxSizing: 'border-box',
                                    padding: Number(item.config?.spacing || 0),
                                }}
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
                                    pages={pages}
                                    children={item.type === 'layout_group'
                                        ? components
                                            .filter((component) => component.parentId === item.id)
                                            .map((component) => {
                                                const datasetId = resolveDatasetId(component);
                                                return {
                                                    item: component,
                                                    rows: component.type === 'selectbox'
                                                        ? (previewRowsByDataset[datasetId] || [])
                                                        : (filteredRowsByDataset[datasetId] || []),
                                                    filterValue: filterValues[component.id] || '',
                                                };
                                            })
                                        : NO_CHILDREN}
                                    selectedId={selectedId}
                                    isContainerDropTarget={containerDropTargetId === item.id}
                                    onMoveChild={(childId, targetContainerId, dragRect, childMeta) => {
                                        const targetLayout = targetContainerId
                                            ? null
                                            : getPaletteDropLayout(dragRect, childMeta);
                                        onMoveToContainer?.(childId, targetContainerId, targetLayout);
                                    }}
                                    onReorderChild={onReorderComponent}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {isDragging && layoutComponents.length > 0 && (
                <div className="dashboard-drop-hint">
                    {t('editor.dropHint')}
                </div>
            )}
        </section>
    );
};

export default Canvas;
