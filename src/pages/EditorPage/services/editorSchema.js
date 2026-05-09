// Файл с созданием итоговой Json схемы для отправки на сервер

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

    components.forEach((component, index) => {
        const base = {
            id: component.id,
            type: component.type,
            order: index + 1,
        };

        if (component.type === 'selectbox') {
            filters.push({
                ...base,
                title: component.config?.title || 'Фильтр',
                field: component.bindings?.field || '',
                scope: 'global',
            });
        }
        else if (component.type === 'line_chart') {
            views.push({
                ...base,
                title: component.config?.title || 'Линейный график',
                x: component.bindings?.xField || '',
                y: component.bindings?.yField || '',
            });
        }
        else if (component.type === 'bar_chart') {
            views.push({
                ...base,
                title: component.config?.title || 'Столбчатый график',
                x: component.bindings?.xField || '',
                y: component.bindings?.yField || '',
            });
        }
        else if (component.type === 'metric') {
            views.push({
                ...base,
                title: component.config?.title || 'Метрика',
                description: component.config?.description || '',
                field: component.bindings?.valueField || '',
                aggregation: 'sum', // Задел на будущее для выбора агрегации
            });
        }
    });

    return {
        version: 1,
        dashboard: {
            title: title || 'Untitled dashboard' // Используем заголовок из слепка
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

        if (component.type === 'selectbox') {
            const field = component.bindings?.field;
            if (!field) {
                errors.push(`Компонент "${name}": не выбрано поле данных для фильтра.`);
            } else if (!hasField(field)) {
                errors.push(`Компонент "${name}": поле "${field}" отсутствует в текущем датасете.`);
            }
        }
        else if (component.type === 'line_chart' || component.type === 'bar_chart') {
            const xField = component.bindings?.xField;
            const yField = component.bindings?.yField;

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