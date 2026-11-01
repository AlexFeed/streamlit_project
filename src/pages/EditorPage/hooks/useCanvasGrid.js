import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    GRID_COLUMNS,
    GRID_COLUMN_GAP,
    GRID_ROW_GAP,
    GRID_ROW_HEIGHT,
    findGridInsertionPosition,
    findNearestGridPosition,
    getComponentGridHeight,
    gridUnitsToContentHeight,
    moveGridItem,
    rectanglesOverlap,
    resolveGridCollisions,
    resizeGridItem,
    toReactGridLayout,
} from '../services/gridLayout.js';

const MIN_GRID_HEIGHT = 560;

export const getInteractionGhostSize = ({
    mode,
    activeItem,
    sourceItem,
    gridStyle,
    sourceCardWidth,
    sourceCardHeight,
}) => {
    const dragWidthChanged = mode === 'drag'
        && activeItem.w !== sourceItem?.w;
    const dragHeightChanged = mode === 'drag'
        && activeItem.h !== sourceItem?.h;

    return {
        width: (
            (mode === 'drag' && !dragWidthChanged)
            || (mode === 'resize' && !activeItem.manualWidth)
        ) ? sourceCardWidth : gridStyle.width,
        height: (
            (mode === 'drag' && !dragHeightChanged)
            || (mode === 'resize' && !activeItem.manualHeight)
        ) ? sourceCardHeight : gridStyle.height,
    };
};

export const getGridItemStyle = (item, gridWidth) => {
    const safeGridWidth = Math.max(
        gridWidth,
        GRID_COLUMN_GAP * (GRID_COLUMNS - 1) + GRID_COLUMNS
    );
    const columnWidth = (
        safeGridWidth - GRID_COLUMN_GAP * (GRID_COLUMNS - 1)
    ) / GRID_COLUMNS;
    const unitWidth = columnWidth + GRID_COLUMN_GAP;
    const unitHeight = GRID_ROW_HEIGHT + GRID_ROW_GAP;

    return {
        left: item.x * unitWidth,
        top: item.y * unitHeight,
        width: item.w * columnWidth + (item.w - 1) * GRID_COLUMN_GAP,
        height: item.h * GRID_ROW_HEIGHT + (item.h - 1) * GRID_ROW_GAP,
    };
};

// Хук управления сеткой холста, измерением ширины и императивным перетаскиванием/ресайзом карточек
export const useCanvasGrid = ({
    components,
    onLayoutChange,
    onSelect,
    onMoveToContainer,
}) => {
    const gridRef = useRef(null);
    const gridResizeObserverRef = useRef(null);
    const interactionRef = useRef(null);
    const suppressSelectionRef = useRef(null);
    const [gridWidth, setGridWidth] = useState(0);
    const [insertionPreview, setInsertionPreview] = useState(null);
    const [containerDropTargetId, setContainerDropTargetId] = useState(null);

    const findContainerAtPoint = useCallback((clientX, clientY, sourceId) => {
        const target = document.elementsFromPoint(clientX, clientY)
            .map((node) => node.closest?.('[data-layout-group-id]'))
            .find((node) => (
                node?.dataset?.layoutGroupId
                && node.dataset.layoutGroupId !== sourceId
            ));
        return target?.dataset?.layoutGroupId || null;
    }, []);

    const gridLayout = useMemo(
        () => toReactGridLayout(components),
        [components]
    );

    const setGridNode = useCallback((node) => {
        gridResizeObserverRef.current?.disconnect();
        gridResizeObserverRef.current = null;
        gridRef.current = node;
        if (!node) return;

        const measure = () => {
            setGridWidth(node.getBoundingClientRect().width);
        };
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(node);
        gridResizeObserverRef.current = observer;
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
        const sourceNodeRect = sourceNode.getBoundingClientRect();
        const sourceCard = sourceNode.querySelector('[data-canvas-item]');
        const sourceCardRect = sourceCard?.getBoundingClientRect()
            || sourceNodeRect;
        ghostNode.removeAttribute('data-grid-item');
        ghostNode.setAttribute('aria-hidden', 'true');
        ghostNode.classList.add('dashboard-interaction-ghost');
        Object.assign(ghostNode.style, {
            width: `${sourceCardRect.width}px`,
            height: `${sourceCardRect.height}px`,
        });
        if (mode === 'resize') {
            ghostNode.classList.add('dashboard-resize-ghost');
            const ghostCard = ghostNode.querySelector('[data-canvas-item]');
            if (ghostCard) {
                Object.assign(ghostCard.style, {
                    width: '100%',
                    maxWidth: 'none',
                    height: '100%',
                });
            }
        }
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
            lastRoundedCols: 0,
            lastRoundedRows: 0,
            startLayout: gridLayout.map((item) => ({ ...item })),
            currentLayout: gridLayout.map((item) => ({ ...item })),
            didMove: false,
            sourceNode,
            ghostNode,
            sourceCardWidth: sourceCardRect.width,
            sourceCardHeight: sourceCardRect.height,
            sourceCardOffsetLeft: sourceCardRect.left - sourceNodeRect.left,
        };

        const handlePointerMove = (moveEvent) => {
            if (moveEvent.pointerId !== nextInteraction.pointerId) return;

            moveEvent.preventDefault();
            if (
                Math.abs(moveEvent.clientX - nextInteraction.startX) > 3
                || Math.abs(moveEvent.clientY - nextInteraction.startY) > 3
            ) {
                nextInteraction.didMove = true;
            }
            if (nextInteraction.mode === 'drag') {
                setContainerDropTargetId(findContainerAtPoint(
                    moveEvent.clientX,
                    moveEvent.clientY,
                    nextInteraction.id
                ));
            }
            const columnWidth = (
                gridWidth - GRID_COLUMN_GAP * (GRID_COLUMNS - 1)
            ) / GRID_COLUMNS;
            const deltaColumns = (
                moveEvent.clientX - nextInteraction.startX
            ) / (columnWidth + GRID_COLUMN_GAP);
            const deltaRows = (
                moveEvent.clientY - nextInteraction.startY
            ) / (GRID_ROW_HEIGHT + GRID_ROW_GAP);

            const roundedCols = Math.round(deltaColumns);
            const roundedRows = Math.round(deltaRows);

            if (
                roundedCols === nextInteraction.lastRoundedCols
                && roundedRows === nextInteraction.lastRoundedRows
            ) {
                return;
            }
            nextInteraction.lastRoundedCols = roundedCols;
            nextInteraction.lastRoundedRows = roundedRows;

            let nextLayout;
            if (nextInteraction.mode === 'drag') {
                const source = nextInteraction.startLayout.find(
                    (item) => item.i === nextInteraction.id
                );
                const otherItems = nextInteraction.startLayout.filter(
                    (item) => item.i !== nextInteraction.id
                );
                // Existing canvas items keep their current footprint while
                // being inserted next to another item. Shrinking to minW/minH
                // made wide containers miss neighbouring boundaries and left
                // an apparently immovable empty row between the cards.
                const insertionWidth = source?.w || source?.minW || 2;
                const insertionHeight = source?.h || source?.minH || 1;
                // Keep the dragged element's top-left corner attached to the
                // pointer. Recentring a component while reducing it to its
                // minimum size introduced one or two invisible grid rows,
                // so taller charts could not be placed directly below text.
                const compactX = (source?.x || 0) + roundedCols;
                const compactY = (source?.y || 0) + roundedRows;
                const requestedCandidate = source ? {
                    ...source,
                    x: Math.max(
                        0,
                        Math.min(
                            GRID_COLUMNS - insertionWidth,
                            Math.round(compactX)
                        )
                    ),
                    y: Math.max(0, Math.round(compactY)),
                    w: insertionWidth,
                    h: insertionHeight,
                } : null;
                const requestedSpaceIsFree = requestedCandidate
                    && !otherItems.some((item) => (
                        rectanglesOverlap(requestedCandidate, item)
                    ));
                const insertion = requestedSpaceIsFree
                    ? null
                    : findGridInsertionPosition(
                        otherItems,
                        compactX,
                        compactY + insertionHeight / 2,
                        insertionWidth,
                        insertionHeight
                    );

                if (insertion && source) {
                    const activeItem = {
                        ...source,
                        x: insertion.x,
                        y: insertion.y,
                        w: insertion.w,
                        h: insertion.h,
                    };
                    nextLayout = resolveGridCollisions(
                        nextInteraction.startLayout,
                        nextInteraction.id,
                        activeItem
                    );
                    setInsertionPreview({
                        ...insertion,
                        displayWidth: nextInteraction.sourceCardWidth,
                        displayLeftOffset: nextInteraction.sourceCardOffsetLeft,
                    });
                } else {
                    nextLayout = moveGridItem(
                        nextInteraction.startLayout,
                        nextInteraction.id,
                        roundedCols,
                        roundedRows
                    );
                    setInsertionPreview(null);
                }
            } else {
                setInsertionPreview(null);
                nextLayout = resizeGridItem(
                    nextInteraction.startLayout,
                    nextInteraction.id,
                    roundedCols,
                    roundedRows
                );
            }
            const activeItem = nextLayout.find((item) => item.i === id);
            if (!activeItem) return;

            const style = getGridItemStyle(activeItem, gridWidth);
            const sourceItem = nextInteraction.startLayout.find(
                (item) => item.i === id
            );
            const ghostSize = getInteractionGhostSize({
                mode: nextInteraction.mode,
                activeItem,
                sourceItem,
                gridStyle: style,
                sourceCardWidth: nextInteraction.sourceCardWidth,
                sourceCardHeight: nextInteraction.sourceCardHeight,
            });
            Object.assign(ghostNode.style, {
                left: `${style.left}px`,
                top: `${style.top}px`,
                width: `${ghostSize.width}px`,
                height: `${ghostSize.height}px`,
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
            window.getSelection()?.removeAllRanges();

            if (nextInteraction.didMove) {
                const targetGroupId = findContainerAtPoint(
                    finishEvent.clientX,
                    finishEvent.clientY,
                    nextInteraction.id
                );
                if (
                    nextInteraction.mode === 'drag'
                    && targetGroupId
                    && targetGroupId !== nextInteraction.id
                ) {
                    onMoveToContainer?.(nextInteraction.id, targetGroupId);
                } else {
                    onLayoutChange(nextInteraction.currentLayout);
                }
                suppressSelectionRef.current = nextInteraction.id;
                window.setTimeout(() => {
                    if (suppressSelectionRef.current === nextInteraction.id) {
                        suppressSelectionRef.current = null;
                    }
                }, 0);
            }
            interactionRef.current = null;
            setInsertionPreview(null);
            setContainerDropTargetId(null);
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
                setInsertionPreview(null);
                setContainerDropTargetId(null);
            },
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    }, [findContainerAtPoint, gridLayout, gridWidth, onLayoutChange, onMoveToContainer]);

    useEffect(() => () => {
        gridResizeObserverRef.current?.disconnect();
        gridResizeObserverRef.current = null;
        interactionRef.current?.cancel?.();
        interactionRef.current = null;
    }, []);

    const handleItemSelect = useCallback((id) => {
        if (suppressSelectionRef.current === id) {
            suppressSelectionRef.current = null;
            return;
        }
        onSelect(id);
    }, [onSelect]);

    const getPaletteDropLayout = useCallback((dragRect, paletteItem) => {
        const gridNode = gridRef.current;
        if (!gridNode || !gridWidth || !dragRect || !paletteItem) return null;

        const bounds = gridNode.getBoundingClientRect();
        const columnWidth = (
            gridWidth - GRID_COLUMN_GAP * (GRID_COLUMNS - 1)
        ) / GRID_COLUMNS;
        const unitWidth = columnWidth + GRID_COLUMN_GAP;
        const unitHeight = GRID_ROW_HEIGHT + GRID_ROW_GAP;
        const minWidth = Math.max(1, Number(paletteItem.minWidth || 2));
        const minHeight = getComponentGridHeight({
            type: paletteItem.type,
            config: paletteItem.defaultConfig || {},
            layout: {
                width: paletteItem.defaultWidth,
                height: paletteItem.defaultHeight,
            },
        });
        const centerX = dragRect.left + dragRect.width / 2;
        const centerY = dragRect.top + dragRect.height / 2;
        const requestedX = (
            (centerX - bounds.left) / unitWidth - minWidth / 2
        );
        const requestedY = (
            (centerY - bounds.top) / unitHeight - minHeight / 2
        );
        const nearestPosition = findNearestGridPosition(
            gridLayout,
            requestedX,
            requestedY,
            minWidth,
            minHeight
        );
        const roundedX = Math.max(
            0,
            Math.min(GRID_COLUMNS - minWidth, Math.round(requestedX))
        );
        const roundedY = Math.max(0, Math.round(requestedY));
        const position = (
            nearestPosition
            && nearestPosition.x === roundedX
            && nearestPosition.y === roundedY
        )
            ? nearestPosition
            : findGridInsertionPosition(
                gridLayout,
                requestedX,
                (centerY - bounds.top) / unitHeight,
                minWidth,
                minHeight
            ) || nearestPosition;
        if (!position) return null;

        return {
            x: position.x,
            y: position.y,
            width: position.w,
            height: gridUnitsToContentHeight(position.h, paletteItem.type),
            gridHeight: position.h,
            insert: Boolean(position.insert),
        };
    }, [gridLayout, gridWidth]);

    const gridHeight = Math.max(
        MIN_GRID_HEIGHT,
        ...gridLayout.map((item) => (
            (item.y + item.h) * (GRID_ROW_HEIGHT + GRID_ROW_GAP) - GRID_ROW_GAP
        ))
    );

    return {
        gridWidth,
        gridLayout,
        gridHeight,
        setGridNode,
        beginInteraction,
        handleItemSelect,
        getPaletteDropLayout,
        insertionPreview,
        containerDropTargetId,
    };
};
