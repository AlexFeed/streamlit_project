import { paletteItems } from '../data/paletteItems.js';

export const GRID_COLUMNS = 12;
export const GRID_ROW_HEIGHT = 20;
export const GRID_GAP = 16;
export const CARD_CHROME_HEIGHT = 96;

export const getCardChromeHeight = (type) => (
    ['text', 'metric', 'selectbox'].includes(type) ? 0 : CARD_CHROME_HEIGHT
);

export const getMinimumContentHeight = (type) => (
    paletteItems[type]?.minHeight || 220
);

export const normalizeGridWidth = (value, type) => {
    const fallback = paletteItems[type]?.defaultWidth || 6;
    const numeric = Math.round(Number(value) || fallback);
    return Math.max(2, Math.min(GRID_COLUMNS, numeric));
};

export const normalizeContentHeight = (value, type) => {
    const fallback = paletteItems[type]?.defaultHeight || 320;
    const minimum = getMinimumContentHeight(type);
    const numeric = Math.round(Number(value) || fallback);
    return Math.max(minimum, Math.min(720, numeric));
};

export const contentHeightToGridUnits = (height, type) => {
    const totalHeight = normalizeContentHeight(height, type) + getCardChromeHeight(type);
    return Math.max(
        1,
        Math.ceil((totalHeight + GRID_GAP) / (GRID_ROW_HEIGHT + GRID_GAP))
    );
};

export const gridUnitsToContentHeight = (units, type) => {
    const safeUnits = Math.max(1, Math.round(Number(units) || 1));
    const totalHeight = (
        safeUnits * GRID_ROW_HEIGHT
        + Math.max(0, safeUnits - 1) * GRID_GAP
    );
    return normalizeContentHeight(totalHeight - getCardChromeHeight(type), type);
};

export const rectanglesOverlap = (left, right) => (
    left.x < right.x + right.w
    && left.x + left.w > right.x
    && left.y < right.y + right.h
    && left.y + left.h > right.y
);

const clampGridItem = (item) => {
    const width = Math.max(
        item.minW || 2,
        Math.min(item.maxW || GRID_COLUMNS, Math.round(item.w))
    );
    const x = Math.max(
        0,
        Math.min(GRID_COLUMNS - width, Math.round(item.x))
    );
    const minHeight = item.minH || 1;
    const maxHeight = item.maxH || Number.POSITIVE_INFINITY;

    return {
        ...item,
        x,
        y: Math.max(0, Math.round(item.y)),
        w: width,
        h: Math.max(
            minHeight,
            Math.min(maxHeight, Math.round(item.h))
        ),
    };
};

export const resolveGridCollisions = (layout, activeId, activeItem) => {
    const nextLayout = layout.map((item) => (
        item.i === activeId ? clampGridItem(activeItem) : { ...item }
    ));
    const queue = [activeId];
    let guard = 0;

    while (queue.length > 0 && guard < nextLayout.length * nextLayout.length) {
        guard += 1;
        const sourceId = queue.shift();
        const source = nextLayout.find((item) => item.i === sourceId);

        if (!source) continue;

        nextLayout.forEach((item, index) => {
            if (item.i === source.i || item.i === activeId) return;
            if (!rectanglesOverlap(source, item)) return;

            const pushed = {
                ...item,
                y: source.y + source.h,
            };
            nextLayout[index] = pushed;
            queue.push(pushed.i);
        });
    }

    return nextLayout;
};

export const moveGridItem = (layout, id, deltaX, deltaY) => {
    const item = layout.find((entry) => entry.i === id);
    if (!item) return layout;

    const requested = clampGridItem({
        ...item,
        x: item.x + Math.round(deltaX),
        y: item.y + Math.round(deltaY),
    });
    const otherItems = layout.filter((entry) => entry.i !== id);
    const fitsWithoutMovingOthers = (candidate) => (
        !otherItems.some((entry) => rectanglesOverlap(candidate, entry))
    );

    if (fitsWithoutMovingOthers(requested)) {
        return layout.map((entry) => entry.i === id ? requested : { ...entry });
    }

    const compact = clampGridItem({
        ...requested,
        w: item.minW || 2,
        h: item.minH || 1,
    });
    if (fitsWithoutMovingOthers(compact)) {
        return layout.map((entry) => entry.i === id ? compact : { ...entry });
    }

    return resolveGridCollisions(layout, id, compact);
};

export const findNearestGridPosition = (
    layout,
    requestedX,
    requestedY,
    width,
    height,
) => {
    const safeWidth = Math.max(2, Math.min(GRID_COLUMNS, Math.round(width)));
    const safeHeight = Math.max(1, Math.round(height));
    const originX = Math.max(
        0,
        Math.min(GRID_COLUMNS - safeWidth, Math.round(requestedX))
    );
    const originY = Math.max(0, Math.round(requestedY));

    for (let radius = 0; radius <= 8; radius += 1) {
        const candidates = [];
        for (let deltaY = -radius; deltaY <= radius; deltaY += 1) {
            for (let deltaX = -radius; deltaX <= radius; deltaX += 1) {
                if (Math.abs(deltaX) + Math.abs(deltaY) !== radius) continue;
                candidates.push({
                    x: Math.max(
                        0,
                        Math.min(GRID_COLUMNS - safeWidth, originX + deltaX)
                    ),
                    y: Math.max(0, originY + deltaY),
                    w: safeWidth,
                    h: safeHeight,
                });
            }
        }

        const free = candidates.find((candidate) => (
            !layout.some((item) => rectanglesOverlap(candidate, item))
        ));
        if (free) return free;
    }

    return null;
};

export const findGridInsertionPosition = (
    layout,
    requestedX,
    requestedY,
    width,
    height,
) => {
    const safeWidth = Math.max(2, Math.min(GRID_COLUMNS, Math.round(width)));
    const safeHeight = Math.max(1, Math.round(height));
    const x = Math.max(
        0,
        Math.min(GRID_COLUMNS - safeWidth, Math.round(requestedX))
    );
    const y = Math.max(0, Math.round(requestedY));
    const horizontalMatches = layout.filter((item) => (
        x < item.x + item.w && x + safeWidth > item.x
    ));
    const boundaries = Array.from(new Set(
        horizontalMatches.flatMap((item) => [item.y, item.y + item.h])
    ));
    if (boundaries.length === 0) return null;

    const boundary = boundaries.reduce((nearest, current) => (
        Math.abs(current - y) < Math.abs(nearest - y) ? current : nearest
    ));
    if (Math.abs(boundary - y) > 2) return null;

    return {
        x,
        y: boundary,
        w: safeWidth,
        h: safeHeight,
        insert: true,
    };
};

export const resizeGridItem = (layout, id, deltaWidth, deltaHeight) => {
    const item = layout.find((entry) => entry.i === id);
    if (!item) return layout;

    return resolveGridCollisions(layout, id, {
        ...item,
        w: Math.min(
            GRID_COLUMNS - item.x,
            item.w + Math.round(deltaWidth)
        ),
        h: item.h + Math.round(deltaHeight),
    });
};

const findFreePosition = (placed, width, height) => {
    for (let y = 0; y < 10000; y += 1) {
        for (let x = 0; x <= GRID_COLUMNS - width; x += 1) {
            const candidate = { x, y, w: width, h: height };
            if (!placed.some((item) => rectanglesOverlap(candidate, item))) {
                return { x, y };
            }
        }
    }
    return { x: 0, y: 0 };
};

export const normalizeComponentLayouts = (components) => {
    if (!Array.isArray(components)) return [];
    const placed = [];

    return components.map((component) => {
        const width = normalizeGridWidth(component.layout?.width, component.type);
        const height = normalizeContentHeight(
            component.layout?.height,
            component.type
        );
        const gridHeight = contentHeightToGridUnits(height, component.type);
        const hasPosition = (
            Number.isInteger(component.layout?.x)
            && Number.isInteger(component.layout?.y)
        );
        const requested = hasPosition
            ? {
                x: Math.max(
                    0,
                    Math.min(GRID_COLUMNS - width, component.layout.x)
                ),
                y: Math.max(0, component.layout.y),
                w: width,
                h: gridHeight,
            }
            : null;
        // Координаты уже размещённых элементов являются пользовательскими
        // данными. При повторной загрузке их нельзя уплотнять или переносить:
        // свободную позицию ищем только для нового элемента без x/y.
        const position = requested
            ? requested
            : {
                ...findFreePosition(placed, width, gridHeight),
                w: width,
                h: gridHeight,
            };

        placed.push(position);

        return {
            ...component,
            config: {
                ...component.config,
                sortBy: component.config?.sortBy
                    || (component.type === 'bar_chart' ? 'y' : 'x'),
            },
            bindings: { ...component.bindings },
            layout: {
                ...component.layout,
                x: position.x,
                y: position.y,
                width,
                height,
            },
        };
    });
};

export const toReactGridLayout = (components) => components.map((component) => ({
    i: component.id,
    x: component.layout?.x || 0,
    y: component.layout?.y || 0,
    w: normalizeGridWidth(component.layout?.width, component.type),
    h: contentHeightToGridUnits(component.layout?.height, component.type),
    minW: 2,
    maxW: GRID_COLUMNS,
    minH: contentHeightToGridUnits(
        getMinimumContentHeight(component.type),
        component.type
    ),
    maxH: contentHeightToGridUnits(720, component.type),
}));
