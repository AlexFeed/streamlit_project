import { paletteItems } from '../data/paletteItems.js';
import { withAppearanceDefaults } from './componentAppearance.js';

export const GRID_COLUMNS = 12;
export const GRID_ROW_HEIGHT = 20;
export const GRID_COLUMN_GAP = 16;
export const GRID_ROW_GAP = 8;
export const CARD_CHROME_HEIGHT = 96;

export const getCardChromeHeight = (type) => (
    ['text', 'metric', 'selectbox', 'page_link', 'layout_group'].includes(type)
        ? 0
        : CARD_CHROME_HEIGHT
);

export const getMinimumContentHeight = (type) => (
    paletteItems[type]?.minHeight || 220
);

export const normalizeGridWidth = (value, type) => {
    const fallback = paletteItems[type]?.defaultWidth || 6;
    const minimum = paletteItems[type]?.minWidth || 2;
    const numeric = Math.round(Number(value) || fallback);
    return Math.max(minimum, Math.min(GRID_COLUMNS, numeric));
};

const compactWidthTypes = new Set(['text', 'metric', 'selectbox', 'page_link']);

const getRequiredContainerGridWidth = (container, components) => {
    const children = (components || []).filter(
        (item) => item.parentId === container.id
    );
    if (children.length === 0) {
        return normalizeGridWidth(container.layout?.width, container.type);
    }

    const childWidths = children.map((child) => (
        getComponentGridWidth(child, components)
    ));
    const direction = container.config?.direction || 'vertical';
    const contentWidth = direction === 'horizontal'
        ? childWidths.reduce((total, width) => total + width, 0)
        : Math.max(...childWidths);
    const hasHorizontalSpacing = (
        Number(container.config?.padding ?? 8) > 0
        || (direction === 'horizontal'
            && Number(container.config?.gap ?? 8) > 0
            && children.length > 1)
    );

    return Math.max(
        1,
        Math.min(GRID_COLUMNS, contentWidth + (hasHorizontalSpacing ? 1 : 0))
    );
};

export const getComponentGridWidth = (component, components = []) => {
    const normalized = normalizeGridWidth(
        component.layout?.width,
        component.type
    );
    const config = withAppearanceDefaults(
        component.type,
        component.config || {}
    );

    if (
        component.type === 'layout_group'
        && !component.layout?.manualWidth
    ) {
        return getRequiredContainerGridWidth(component, components);
    }

    if (
        !component.layout?.manualWidth
        &&
        compactWidthTypes.has(component.type)
        && config.contentWidth === 'content'
    ) {
        if (
            component.type === 'selectbox'
            && ['selectbox', 'multiselect'].includes(config.widget || 'selectbox')
        ) {
            return 3;
        }
        return paletteItems[component.type]?.minWidth || 2;
    }

    return normalized;
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
        Math.ceil((totalHeight + GRID_ROW_GAP) / (GRID_ROW_HEIGHT + GRID_ROW_GAP))
    );
};

const getAutomaticContentHeight = (component) => {
    const config = withAppearanceDefaults(component.type, component.config || {});
    const padding = Number(config.padding || 0) * 2;

    if (component.type === 'text') {
        const fontSize = Number(config.fontSize || 16);
        const width = getComponentGridWidth({
            ...component,
            config,
        });
        const charactersPerLine = Math.max(18, width * 10);
        const contentLines = String(config.content || '')
            .split('\n')
            .reduce((total, line) => (
                total + Math.max(1, Math.ceil(line.length / charactersPerLine))
            ), 0);
        const titleLines = config.title ? 1 : 0;
        return Math.ceil(
            contentLines * fontSize * 1.5
            + titleLines * 20
            + padding
        );
    }
    if (component.type === 'page_link') return 40 + padding;
    if (component.type === 'metric') {
        return 58 + (config.description ? 18 : 0) + padding;
    }
    if (component.type === 'selectbox') {
        return (config.widget === 'radio' ? 72 : 56) + padding;
    }
    return normalizeContentHeight(component.layout?.height, component.type);
};

const getRequiredContainerHeight = (container, components) => {
    const children = components.filter((item) => item.parentId === container.id);
    if (children.length === 0) {
        return paletteItems.layout_group.defaultHeight;
    }

    const gap = Math.max(0, Number(container.config?.gap ?? 8));
    const padding = Math.max(0, Number(container.config?.padding ?? 8)) * 2;
    const childHeights = children.map((child) => {
        const childConfig = withAppearanceDefaults(child.type, {
            ...(paletteItems[child.type]?.defaultConfig || {}),
            ...child.config,
        });
        if (['text', 'metric', 'selectbox', 'page_link'].includes(child.type)) {
            return Math.max(40, getAutomaticContentHeight({
                ...child,
                config: childConfig,
            }));
        }
        return normalizeContentHeight(child.layout?.height, child.type) + 40;
    });
    const contentHeight = container.config?.direction === 'horizontal'
        ? Math.max(...childHeights)
        : childHeights.reduce((total, height) => total + height, 0)
            + gap * Math.max(0, children.length - 1);

    return Math.min(720, Math.ceil(contentHeight + padding));
};

export const getComponentGridHeight = (component) => {
    const config = withAppearanceDefaults(component.type, component.config || {});
    if (
        ['text', 'metric', 'selectbox', 'page_link'].includes(component.type)
        && config.heightMode === 'auto'
        && !component.layout?.manualHeight
    ) {
        const height = getAutomaticContentHeight({ ...component, config });
        return Math.max(
            1,
            Math.ceil(
                (height + GRID_ROW_GAP)
                / (GRID_ROW_HEIGHT + GRID_ROW_GAP)
            )
        );
    }
    return contentHeightToGridUnits(component.layout?.height, component.type);
};

export const gridUnitsToContentHeight = (units, type) => {
    const safeUnits = Math.max(1, Math.round(Number(units) || 1));
    const totalHeight = (
        safeUnits * GRID_ROW_HEIGHT
        + Math.max(0, safeUnits - 1) * GRID_ROW_GAP
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
    const safeWidth = Math.max(1, Math.min(GRID_COLUMNS, Math.round(width)));
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
    const safeWidth = Math.max(1, Math.min(GRID_COLUMNS, Math.round(width)));
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
    if (Math.abs(boundary - y) > 3) return null;

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

    const isWidthResize = Math.round(deltaWidth) !== 0;
    const isHeightResize = Math.round(deltaHeight) !== 0;

    return resolveGridCollisions(layout, id, {
        ...item,
        minH: isHeightResize ? (item.resizeMinH || 1) : item.minH,
        maxH: isHeightResize
            ? (item.resizeMaxH || Number.POSITIVE_INFINITY)
            : item.maxH,
        w: Math.min(
            GRID_COLUMNS - item.x,
            item.w + Math.round(deltaWidth)
        ),
        h: item.h + Math.round(deltaHeight),
        manualWidth: item.manualWidth || isWidthResize,
        manualHeight: item.manualHeight || isHeightResize,
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

const pushBelowOverlaps = (candidate, placed) => {
    let next = { ...candidate };
    let guard = 0;

    while (guard < placed.length + 1) {
        const overlaps = placed.filter((item) => rectanglesOverlap(next, item));
        if (overlaps.length === 0) break;
        next = {
            ...next,
            y: Math.max(...overlaps.map((item) => item.y + item.h)),
        };
        guard += 1;
    }

    return next;
};

export const normalizeComponentLayouts = (components) => {
    if (!Array.isArray(components)) return [];
    const placed = [];

    return components.map((component) => {
        const defaultConfig = paletteItems[component.type]?.defaultConfig || {};
        const normalizedConfig = withAppearanceDefaults(component.type, {
            ...defaultConfig,
            ...component.config,
            sortBy: component.config?.sortBy
                || (component.type === 'bar_chart' ? 'y' : 'x'),
        });
        const width = getComponentGridWidth({
            ...component,
            config: normalizedConfig,
        }, components);
        const requestedHeight = component.type === 'layout_group'
            ? Math.max(
                Number(component.layout?.height || 0),
                getRequiredContainerHeight(component, components)
            )
            : component.layout?.height;
        const height = normalizeContentHeight(
            requestedHeight,
            component.type
        );
        const gridHeight = getComponentGridHeight({
            ...component,
            config: normalizedConfig,
            layout: {
                ...component.layout,
                width,
                height,
            },
        });
        const hasPosition = (
            Number.isInteger(component.layout?.x)
            && Number.isInteger(component.layout?.y)
        );
        if (component.parentId) {
            return {
                ...component,
                config: normalizedConfig,
                bindings: { ...component.bindings },
                layout: {
                    ...component.layout,
                    width,
                    height,
                },
            };
        }
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
            ? pushBelowOverlaps(requested, placed)
            : {
                ...findFreePosition(placed, width, gridHeight),
                w: width,
                h: gridHeight,
            };

        placed.push(position);

        return {
            ...component,
            config: normalizedConfig,
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

export const toReactGridLayout = (components) => {
    const placed = [];

    return components.map((component) => {
    const height = getComponentGridHeight(component);
    const config = withAppearanceDefaults(component.type, component.config || {});
    const usesAutomaticHeight = (
        ['text', 'metric', 'selectbox', 'page_link'].includes(component.type)
        && config.heightMode === 'auto'
        && !component.layout?.manualHeight
    );

    const requested = {
        i: component.id,
        x: component.layout?.x || 0,
        y: component.layout?.y || 0,
        w: getComponentGridWidth(component, components),
        h: height,
        minW: paletteItems[component.type]?.minWidth || 2,
        maxW: GRID_COLUMNS,
        minH: usesAutomaticHeight
            ? height
            : contentHeightToGridUnits(
                getMinimumContentHeight(component.type),
                component.type
            ),
        maxH: usesAutomaticHeight
            ? height
            : contentHeightToGridUnits(720, component.type),
        resizeMinH: contentHeightToGridUnits(
            getMinimumContentHeight(component.type),
            component.type
        ),
        resizeMaxH: contentHeightToGridUnits(720, component.type),
        manualWidth: Boolean(component.layout?.manualWidth),
        manualHeight: Boolean(component.layout?.manualHeight),
    };
    const resolved = pushBelowOverlaps(requested, placed);
    placed.push(resolved);
    return resolved;
    });
};
