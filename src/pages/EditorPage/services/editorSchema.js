// Файл с созданием итоговой Json схемы для отправки на сервер
import { getPaletteColors } from '../data/chartPalettes.js';

export const buildDashboardSchema = (snapshot) => {
    // Извлекаем все нужные данные из единого слепка состояния
    const {
        components = [],
        availableFields = [],
        dataset = null,
        title = 'Untitled dashboard'
    } = snapshot;

    const filters = [];
    const views = [];
    const chartTypes = ['line_chart', 'bar_chart', 'area_chart', 'scatter_plot'];
    const defaultWidthByType = {
        selectbox: 4,
        metric: 3,
    };
    const defaultHeightByType = {
        selectbox: 120,
        metric: 140,
    };

    components.forEach((component, index) => {
        const base = {
            id: component.id,
            type: component.type,
            order: index + 1,
            layout: {
                x: component.layout?.x || 0,
                y: component.layout?.y || 0,
                width: component.layout?.width || defaultWidthByType[component.type] || 6,
                height: component.layout?.height || defaultHeightByType[component.type] || 320,
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
        else if (chartTypes.includes(component.type)) {
            const supportsPaletteModes = ['bar_chart', 'scatter_plot']
                .includes(component.type);
            views.push({
                ...base,
                title: component.config?.title || 'График',
                x: component.bindings?.xField || '',
                y: component.bindings?.yField || '',
                aggregation: component.config?.aggregation || 'none',
                sort: component.config?.sort || 'none',
                sortBy: component.config?.sortBy || 'x',
                color: component.config?.color || '#3b82f6',
                colorMode: supportsPaletteModes
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
    });

    return {
        version: 2,
        dashboard: {
            title: title || 'Untitled dashboard',
            grid: {
                columns: 12,
            },
        },
        dataSource: {
            type: 'backend_dataset',
            datasetId: dataset?.datasetId || null,
            name: dataset?.name || 'data.csv',
            fields: availableFields,
        },
        filters,
        views,
    };
};

// Проверка JSON-схемы на правильность
export const validateSchema = (snapshot) => {
    const { components = [], availableFields = [], dataset = null } = snapshot;
    const errors = [];
    const chartTypes = ['line_chart', 'bar_chart', 'area_chart', 'scatter_plot'];
    const supportedTypes = new Set(['selectbox', 'metric', ...chartTypes]);
    const allowedAggregations = new Set(['none', 'sum', 'mean', 'count', 'min', 'max']);
    const allowedColorModes = new Set(['solid', 'gradient', 'categorical']);
    const allowedSortFields = new Set(['x', 'y']);

    if (!components.length) {
        errors.push('Холст пуст. Добавьте хотя бы один компонент.');
    }

    if (!dataset?.datasetId) {
        errors.push('Не загружен CSV-файл.');
    }

    // Проверка того, что поле реально есть в availableFields
    const hasField = (field) => availableFields.includes(field);

    // Проверка заполненности полей и свойств каждого компонента
    components.forEach((component, index) => {
        const name = component.config?.title || component.type || `component-${index + 1}`;
        const width = component.layout?.width;
        const height = component.layout?.height;

        if (!supportedTypes.has(component.type)) {
            errors.push(`Компонент "${name}": тип "${component.type}" не поддерживается.`);
            return;
        }

        if (width && (width < 2 || width > 12)) {
            errors.push(`Компонент "${name}": ширина должна быть 3, 4, 6, 8 или 12 колонок.`);
        }

        if (height && (height < 120 || height > 720)) {
            errors.push(`Компонент "${name}": высота должна быть от 120 до 720 пикселей.`);
        }

        if (component.type === 'selectbox') {
            const field = component.bindings?.field;
            if (!field) {
                errors.push(`Компонент "${name}": не выбрано поле данных для фильтра.`);
            } else if (!hasField(field)) {
                errors.push(`Компонент "${name}": поле "${field}" отсутствует в текущем датасете.`);
            }
        }
        else if (chartTypes.includes(component.type)) {
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
                !['bar_chart', 'scatter_plot'].includes(component.type)
                && colorMode !== 'solid'
            ) {
                errors.push(`Компонент "${name}": палитры по данным доступны для столбчатого и точечного графиков.`);
            }

            if (!xField) {
                errors.push(`Компонент "${name}": не выбрано поле X.`);
            } else if (!hasField(xField)) {
                errors.push(`Компонент "${name}": поле X "${xField}" отсутствует в текущем датасете.`);
            }

            if (!yField) {
                errors.push(`Компонент "${name}": не выбрано поле Y.`);
            } else if (!hasField(yField)) {
                errors.push(`Компонент "${name}": поле Y "${yField}" отсутствует в текущем датасете.`);
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
                errors.push(`Компонент "${name}": поле "${valueField}" отсутствует в текущем датасете.`);
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
