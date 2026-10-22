// Файл с созданием итоговой Json схемы для отправки на сервер
import { getPaletteColors } from '../data/chartPalettes.js';
import { paletteItems } from '../data/paletteItems.js';

export const buildDashboardSchema = (snapshot) => {
    // Извлекаем все нужные данные из единого слепка состояния
    const {
        components = [],
        datasets = [],
        title = 'Untitled dashboard'
    } = snapshot;

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
            datasetId: component.type === 'text'
                ? null
                : resolveDatasetId(component),
            order: index + 1,
            layout: {
                x: component.layout?.x || 0,
                y: component.layout?.y || 0,
                width: component.layout?.width || meta?.defaultWidth || 6,
                height: component.layout?.height || meta?.defaultHeight || 320,
            },
        };

        if (component.type === 'selectbox') {
            filters.push({
                ...base,
                title: component.config?.title || 'Фильтр',
                field: component.bindings?.field || '',
                scope: 'global',
            });
        }
        else if (meta?.isChart) {
            views.push({
                ...base,
                title: component.config?.title || 'График',
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
            });
        }
        else if (component.type === 'metric') {
            views.push({
                ...base,
                title: component.config?.title || 'Метрика',
                description: component.config?.description || '',
                field: component.bindings?.valueField || '',
                aggregation: component.config?.aggregation || 'sum',
            });
        }
        else if (component.type === 'text') {
            views.push({
                ...base,
                title: component.config?.title || '',
                content: component.config?.content || '',
                fontSize: component.config?.fontSize || 16,
                fontWeight: component.config?.fontWeight || 'normal',
                fontStyle: component.config?.fontStyle || 'normal',
                color: component.config?.color || '#d4d4d8',
                textAlign: component.config?.textAlign || 'left',
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
        dataSources: datasets.map((ds) => ({
            type: 'backend_dataset',
            datasetId: ds.datasetId || null,
            name: ds.name || 'data.csv',
            format: ds.format || 'csv',
            delimiter: ds.delimiter || null,
            sheetName: ds.sheetName || null,
            fields: ds.fields || [],
        })),
        filters,
        views,
    };
};

// Проверка JSON-схемы на правильность
export const validateSchema = (snapshot) => {
    const { components = [], datasets = [] } = snapshot;
    const errors = [];
    const allowedAggregations = new Set(['none', 'sum', 'mean', 'count', 'min', 'max']);
    const allowedColorModes = new Set(['solid', 'gradient', 'categorical']);
    const allowedSortFields = new Set(['x', 'y']);

    if (!components.length) {
        errors.push('Холст пуст. Добавьте хотя бы один компонент.');
    }

    if (!datasets.length || datasets.some((ds) => !ds?.datasetId)) {
        errors.push('Не загружен CSV-файл.');
    }

    // Проверка заполненности полей и свойств каждого компонента
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
        // Проверка того, что поле реально есть в выбранном датасете компонента
        const hasField = (field) => availableFields.includes(field);

        if (!meta) {
            errors.push(`Компонент "${name}": тип "${component.type}" не поддерживается.`);
            return;
        }

        if (width && (width < 2 || width > 12)) {
            errors.push(`Компонент "${name}": ширина должна быть 3, 4, 6, 8 или 12 колонок.`);
        }

        const minimumHeight = meta?.minHeight || 120;
        if (height && (height < minimumHeight || height > 720)) {
            errors.push(`Компонент "${name}": высота должна быть от ${minimumHeight} до 720 пикселей.`);
        }

        if (component.type === 'selectbox') {
            const field = component.bindings?.field;
            if (!field) {
                errors.push(`Компонент "${name}": не выбрано поле данных для фильтра.`);
            } else if (!hasField(field)) {
                errors.push(`Компонент "${name}": поле "${field}" отсутствует в выбранном датасете.`);
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
                errors.push(`Компонент "${name}": неизвестная агрегация "${aggregation}".`);
            }

            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
                errors.push(`Компонент "${name}": цвет должен быть в формате #RRGGBB.`);
            }

            if (!allowedColorModes.has(colorMode)) {
                errors.push(`Компонент "${name}": неизвестный цветовой режим "${colorMode}".`);
            }

            if (!allowedSortFields.has(sortBy)) {
                errors.push(`Компонент "${name}": сортировать можно только по X или Y.`);
            }

            if (
                !meta.supportsPaletteModes
                && colorMode !== 'solid'
            ) {
                errors.push(`Компонент "${name}": палитры по данным доступны для столбчатого и точечного графиков.`);
            }

            if (!xField) {
                errors.push(`Компонент "${name}": не выбрано поле X.`);
            } else if (!hasField(xField)) {
                errors.push(`Компонент "${name}": поле X "${xField}" отсутствует в выбранном датасете.`);
            }

            if (!yField) {
                errors.push(`Компонент "${name}": не выбрано поле Y.`);
            } else if (!hasField(yField)) {
                errors.push(`Компонент "${name}": поле Y "${yField}" отсутствует в выбранном датасете.`);
            }
        }
        else if (component.type === 'metric') {
            const valueField = component.bindings?.valueField;
            const aggregation = component.config?.aggregation || 'sum';

            if (!allowedAggregations.has(aggregation) || aggregation === 'none') {
                errors.push(`Компонент "${name}": выберите агрегацию метрики.`);
            }

            if (!valueField) {
                errors.push(`Компонент "${name}": не выбрано поле значения.`);
            } else if (!hasField(valueField)) {
                errors.push(`Компонент "${name}": поле "${valueField}" отсутствует в выбранном датасете.`);
            }
        }
        else if (component.type === 'text') {
            const fontSize = Number(component.config?.fontSize || 16);
            const fontWeight = component.config?.fontWeight || 'normal';
            const fontStyle = component.config?.fontStyle || 'normal';
            const color = component.config?.color || '#d4d4d8';
            const textAlign = component.config?.textAlign || 'left';

            if (!component.config?.content?.trim()) {
                errors.push(`Компонент "${name}": добавьте текст.`);
            }
            if (fontSize < 12 || fontSize > 32) {
                errors.push(`Компонент "${name}": размер текста должен быть от 12 до 32 пикселей.`);
            }
            if (!['normal', 'bold'].includes(fontWeight)) {
                errors.push(`Компонент "${name}": неизвестное начертание текста.`);
            }
            if (!['normal', 'italic'].includes(fontStyle)) {
                errors.push(`Компонент "${name}": неизвестный стиль текста.`);
            }
            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
                errors.push(`Компонент "${name}": цвет должен быть в формате #RRGGBB.`);
            }
            if (!['left', 'center', 'right'].includes(textAlign)) {
                errors.push(`Компонент "${name}": неизвестное выравнивание текста.`);
            }
        }
    });

    return errors;
};

// Объединяет проверку и создание схемы дашборда
export const compileDashboardSchema = (snapshot) => {
    const errors = validateSchema(snapshot);

    // Если есть ошибки, возвращаем их и пустую схему
    if (errors.length > 0) {
        return { schema: null, errors };
    }

    // Если ошибок нет, компилируем схему
    return {
        schema: buildDashboardSchema(snapshot),
        errors: [],
    };
};
