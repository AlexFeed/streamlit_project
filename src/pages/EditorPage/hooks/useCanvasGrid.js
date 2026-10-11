import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    GRID_COLUMNS,
    GRID_GAP,
    GRID_ROW_HEIGHT,
    moveGridItem,
    resizeGridItem,
    toReactGridLayout,
} from '../services/gridLayout.js';

const MIN_GRID_HEIGHT = 560;

export const getGridItemStyle = (item, gridWidth) => {
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

// Хук управления сеткой холста, измерением ширины и императивным перетаскиванием/ресайзом карточек
export const useCanvasGrid = ({
    components,
    onLayoutChange,
    onSelect,
}) => {
    const gridRef = useRef(null);
    const gridResizeObserverRef = useRef(null);
    const interactionRef = useRef(null);
    const suppressSelectionRef = useRef(null);
    const [gridWidth, setGridWidth] = useState(0);

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
            lastRoundedCols: 0,
            lastRoundedRows: 0,
            startLayout: gridLayout.map((item) => ({ ...item })),
            currentLayout: gridLayout.map((item) => ({ ...item })),
            didMove: false,
            sourceNode,
            ghostNode,
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
            const columnWidth = (
                gridWidth - GRID_GAP * (GRID_COLUMNS - 1)
            ) / GRID_COLUMNS;
            const deltaColumns = (
                moveEvent.clientX - nextInteraction.startX
            ) / (columnWidth + GRID_GAP);
            const deltaRows = (
                moveEvent.clientY - nextInteraction.startY
            ) / (GRID_ROW_HEIGHT + GRID_GAP);

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

            const nextLayout = nextInteraction.mode === 'drag'
                ? moveGridItem(
                    nextInteraction.startLayout,
                    nextInteraction.id,
                    roundedCols,
                    roundedRows
                )
                : resizeGridItem(
                    nextInteraction.startLayout,
                    nextInteraction.id,
                    roundedCols,
                    roundedRows
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

    const gridHeight = Math.max(
        MIN_GRID_HEIGHT,
        ...gridLayout.map((item) => (
            (item.y + item.h) * (GRID_ROW_HEIGHT + GRID_GAP) - GRID_GAP
        ))
    );

    return {
        gridWidth,
        gridLayout,
        gridHeight,
        setGridNode,
        beginInteraction,
        handleItemSelect,
    };
};
