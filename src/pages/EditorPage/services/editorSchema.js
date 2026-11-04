import { getPaletteColors } from '../data/chartPalettes.js';
import { paletteItems } from '../data/paletteItems.js';
import { DEFAULT_PAGE_ID, normalizePages } from './pageState.js';

export const buildDashboardSchema = (snapshot, t = (key) => key) => {
    const {
        components = [],
        datasets = [],
        pages = [],
        title = 'Untitled dashboard'
    } = snapshot;
    const normalizedPages = normalizePages(pages);

    const defaultDatasetId = datasets[0]?.datasetId || null;
    const resolveDatasetId = (component) => {
        if (
            component?.datasetId &&
            datasets.some((ds) => ds.datasetId === component.datasetId)
        ) {
            return component.datasetId;
        }
        return defaultDatasetId;
    };

    const filters = [];
    const views = [];

    components.forEach((component, index) => {
        const meta = paletteItems[component.type];
        const base = {
            id: component.id,
            type: component.type,
            pageId: component.pageId || DEFAULT_PAGE_ID,
            parentId: component.parentId || null,
            surface: component.config?.surface || meta?.defaultConfig?.surface || 'card',
            showBorder: component.config?.showBorder,
            showBackground: component.config?.showBackground,
            contentAlignment: component.config?.contentAlignment || 'left',
            verticalAlignment: component.config?.verticalAlignment || 'top',
            padding: Number(component.config?.padding ?? 12),
            contentWidth: component.config?.contentWidth || 'stretch',
            heightMode: component.config?.heightMode || (
                ['text', 'metric', 'selectbox', 'page_link'].includes(component.type)
                    ? 'auto'
                    : 'fixed'
            ),
            elementFontSize: component.config?.elementFontSize || 'auto',
            elementTextColor: component.config?.elementTextColor || '#d4d4d8',
            elementFontWeight: component.config?.elementFontWeight || 'normal',
            elementFontStyle: component.config?.elementFontStyle || 'normal',
            datasetId: ['text', 'page_link', 'layout_group'].includes(component.type)
                ? null
                : resolveDatasetId(component),
            order: index + 1,
            layout: {
                x: component.layout?.x || 0,
                y: component.layout?.y || 0,
                width: component.layout?.width || meta?.defaultWidth || 6,
                height: Math.max(
                    meta?.minHeight || 1,
                    Number(component.layout?.height || meta?.defaultHeight || 320)
                ),
            },
        };

        if (component.type === 'selectbox') {
            filters.push({
                ...base,
                title: component.config?.title || t(meta.labelKey),
                field: component.bindings?.field || '',
                scope: 'global',
                widget: component.config?.widget || 'selectbox',
            });
        }
        else if (meta?.isChart) {
            views.push({
                ...base,
                title: component.config?.title || t(meta.labelKey),
                x: component.bindings?.xField || '',
                y: component.bindings?.yField || '',
                aggregation: component.config?.aggregation || 'none',
                sort: component.config?.sort || 'none',
                sortBy: component.config?.sortBy || 'x',
                color: component.config?.color || '#3b82f6',
                colorMode: meta.supportsPaletteModes
                    ? component.config?.colorMode || 'solid'
                    : 'solid',
                palette: getPaletteColors(
                    component.config?.palette,
                    component.config?.reversePalette
                ),
                axisLabelFontSize: component.config?.axisLabelFontSize || 11,
                axisLabelColor: component.config?.axisLabelColor || '#94a3b8',
                axisTitleFontSize: component.config?.axisTitleFontSize || 12,
                axisTitleColor: component.config?.axisTitleColor || '#94a3b8',
            });
        }
        else if (component.type === 'metric') {
            views.push({
                ...base,
                title: component.config?.title || t(meta.labelKey),
                description: component.config?.description || '',
                field: component.bindings?.valueField || '',
                aggregation: component.config?.aggregation || 'sum',
            });
        }
        else if (component.type === 'text') {
            views.push({
                ...base,
                title: component.config?.title || '',
                content: component.config?.content || (
                    component.config?.contentKey ? t(component.config.contentKey) : ''
                ),
                fontSize: component.config?.fontSize || 16,
                fontWeight: component.config?.fontWeight || 'normal',
                fontStyle: component.config?.fontStyle || 'normal',
                color: component.config?.color || '#d4d4d8',
                textAlign: component.config?.textAlign || 'left',
            });
        }
        else if (component.type === 'page_link') {
            views.push({
                ...base,
                title: component.config?.title || t('palette.pageLink.defaultTitle'),
                targetPageId: component.config?.targetPageId || '',
                displayStyle: component.config?.displayStyle || 'button',
            });
        }
        else if (component.type === 'table') {
            views.push({
                ...base,
                title: component.config?.title || t('palette.table.label'),
                columns: component.bindings?.columns || [],
                rowLimit: component.config?.rowLimit || 50,
                hideIndex: component.config?.hideIndex !== false,
            });
        }
        else if (component.type === 'layout_group') {
            views.push({
                ...base,
                title: component.config?.title || '',
                direction: component.config?.direction || 'vertical',
                gap: Number(component.config?.gap ?? 8),
                padding: Number(component.config?.padding ?? 8),
                horizontalAlignment: component.config?.horizontalAlignment || 'left',
                verticalAlignment: component.config?.verticalAlignment || 'top',
                wrap: component.config?.wrap !== false,
            });
        }
    });

    return {
        version: 2,
        dashboard: {
            title: title || 'Untitled dashboard',
            grid: {
                columns: 12,
            },
        },
        pages: normalizedPages.map((page, index) => ({
            ...page,
            order: index + 1,
        })),
        dataSources: datasets.map((ds) => ({
            type: 'backend_dataset',
            datasetId: ds.datasetId || null,
            name: ds.name || 'data.csv',
            format: ds.format || 'csv',
            delimiter: ds.delimiter || null,
            encoding: ds.encoding || null,
            sheetName: ds.sheetName || null,
            fields: ds.fields || [],
        })),
        filters,
        views,
    };
};

export const validateSchema = (snapshot, t = (key) => key) => {
    const { components = [], datasets = [], pages = [] } = snapshot;
    const errors = [];
    const normalizedPages = normalizePages(pages);
    const pageIds = new Set(normalizedPages.map((page) => page.id));
    const allowedAggregations = new Set(['none', 'sum', 'mean', 'count', 'min', 'max']);
    const allowedColorModes = new Set(['solid', 'gradient', 'categorical']);
    const allowedSortFields = new Set(['x', 'y']);
    const groupsById = new Map(
        components
            .filter((component) => component.type === 'layout_group')
            .map((component) => [component.id, component])
    );

    if (!components.length) {
        errors.push(t('editor.validation.emptyCanvas'));
    }

    if (!datasets.length || datasets.some((ds) => !ds?.datasetId)) {
        errors.push(t('editor.validation.missingDataset'));
    }

    components.forEach((component, index) => {
        const meta = paletteItems[component.type];
        const name = component.config?.title || component.type || `component-${index + 1}`;
        const width = component.layout?.width;
        const height = component.layout?.height;

        const targetDataset =
            datasets.find((ds) => ds.datasetId === component.datasetId) ||
            datasets[0] ||
            null;
        const availableFields = targetDataset?.fields || [];
        const hasField = (field) => availableFields.includes(field);

        if (!pageIds.has(component.pageId || DEFAULT_PAGE_ID)) {
            errors.push(t('editor.validation.pageMissing', { name }));
            return;
        }

        if (!meta) {
            errors.push(t('editor.validation.unsupportedType', { name, type: component.type }));
            return;
        }

        if (component.type === 'layout_group' && component.parentId) {
            errors.push(t('editor.validation.nestedContainer', { name }));
        }
        if (component.parentId) {
            const parent = groupsById.get(component.parentId);
            if (!parent || parent.pageId !== component.pageId) {
                errors.push(t('editor.validation.containerMissing', { name }));
            }
        }

        if (width && (width < 1 || width > 12)) {
            errors.push(t('editor.validation.width', { name }));
        }

        const minimumHeight = meta?.minHeight || 120;
        const usesAutomaticCompactHeight = (
            ['text', 'metric', 'selectbox', 'page_link'].includes(component.type)
            && (component.config?.heightMode || 'auto') === 'auto'
        );
        if (height && ((!usesAutomaticCompactHeight && height < minimumHeight) || height > 720)) {
            errors.push(t('editor.validation.height', { name, min: minimumHeight }));
        }

        if (component.type === 'selectbox') {
            const field = component.bindings?.field;
            const widget = component.config?.widget || 'selectbox';
            if (!['selectbox', 'radio', 'segmented', 'pills', 'multiselect'].includes(widget)) {
                errors.push(t('editor.validation.filterWidget', { name }));
            }
            if (!field) {
                errors.push(t('editor.validation.filterField', { name }));
            } else if (!hasField(field)) {
                errors.push(t('editor.validation.fieldMissing', { name, field }));
            }
        }
        else if (meta.isChart) {
            const xField = component.bindings?.xField;
            const yField = component.bindings?.yField;
            const aggregation = component.config?.aggregation || 'none';
            const color = component.config?.color || '#3b82f6';
            const colorMode = component.config?.colorMode || 'solid';
            const sortBy = component.config?.sortBy || 'x';

            if (!allowedAggregations.has(aggregation)) {
                errors.push(t('editor.validation.aggregation', { name, value: aggregation }));
            }

            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
                errors.push(t('editor.validation.color', { name }));
            }

            if (!allowedColorModes.has(colorMode)) {
                errors.push(t('editor.validation.colorMode', { name, value: colorMode }));
            }

            if (!allowedSortFields.has(sortBy)) {
                errors.push(t('editor.validation.sortField', { name }));
            }

            if (
                !meta.supportsPaletteModes
                && colorMode !== 'solid'
            ) {
                errors.push(t('editor.validation.paletteMode', { name }));
            }

            if (!xField) {
                errors.push(t('editor.validation.missingX', { name }));
            } else if (!hasField(xField)) {
                errors.push(t('editor.validation.fieldMissing', { name, field: xField }));
            }

            if (!yField) {
                errors.push(t('editor.validation.missingY', { name }));
            } else if (!hasField(yField)) {
                errors.push(t('editor.validation.fieldMissing', { name, field: yField }));
            }
        }
        else if (component.type === 'metric') {
            const valueField = component.bindings?.valueField;
            const aggregation = component.config?.aggregation || 'sum';

            if (!allowedAggregations.has(aggregation) || aggregation === 'none') {
                errors.push(t('editor.validation.metricAggregation', { name }));
            }

            if (!valueField) {
                errors.push(t('editor.validation.metricField', { name }));
            } else if (!hasField(valueField)) {
                errors.push(t('editor.validation.fieldMissing', { name, field: valueField }));
            }
        }
        else if (component.type === 'text') {
            const fontSize = Number(component.config?.fontSize || 16);
            const fontWeight = component.config?.fontWeight || 'normal';
            const fontStyle = component.config?.fontStyle || 'normal';
            const color = component.config?.color || '#d4d4d8';
            const textAlign = component.config?.textAlign || 'left';

            if (!component.config?.content?.trim() && !component.config?.contentKey) {
                errors.push(t('editor.validation.textEmpty', { name }));
            }
            if (fontSize < 12 || fontSize > 32) {
                errors.push(t('editor.validation.fontSize', { name }));
            }
            if (!['normal', 'bold'].includes(fontWeight)) {
                errors.push(t('editor.validation.fontWeight', { name }));
            }
            if (!['normal', 'italic'].includes(fontStyle)) {
                errors.push(t('editor.validation.fontStyle', { name }));
            }
            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
                errors.push(t('editor.validation.color', { name }));
            }
            if (!['left', 'center', 'right'].includes(textAlign)) {
                errors.push(t('editor.validation.alignment', { name }));
            }
        }
        else if (component.type === 'page_link') {
            const targetPageId = component.config?.targetPageId;
            const displayStyle = component.config?.displayStyle || 'button';
            if (!targetPageId || !pageIds.has(targetPageId)) {
                errors.push(t('editor.validation.pageTarget', { name }));
            }
            if (!['button', 'link'].includes(displayStyle)) {
                errors.push(t('editor.validation.pageLinkStyle', { name }));
            }
        }
        else if (component.type === 'table') {
            const columns = component.bindings?.columns || [];
            const rowLimit = Number(component.config?.rowLimit || 50);
            if (!Array.isArray(columns) || columns.some((field) => !hasField(field))) {
                errors.push(t('editor.validation.tableColumns', { name }));
            }
            if (rowLimit < 1 || rowLimit > 500) {
                errors.push(t('editor.validation.tableRows', { name }));
            }
        }
    });

    return errors;
};

export const compileDashboardSchema = (snapshot, t) => {
    const errors = validateSchema(snapshot, t);

    if (errors.length > 0) {
        return { schema: null, errors };
    }

    return {
        schema: buildDashboardSchema(snapshot, t),
        errors: [],
    };
};
