// Файл с созданием итоговой Json схемы для отправки на сервер

export const buildDashboardSchema = (
    components,
    availableFields = [],
    datasetMeta = null
) => {
    // Тестовая версия схемы с разделением на фильтры и графики, для более удобного рендера в backend
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

            return;
        }

        if (component.type === 'line_chart') {
            views.push({
                ...base,
                title: component.config?.title || 'Линейный график',
                x: component.bindings?.xField || '',
                y: component.bindings?.yField || '',
            });

            return;
        }

        if (component.type === 'bar_chart') {
            views.push({
                ...base,
                title: component.config?.title || 'Столбчатый график',
                x: component.bindings?.xField || '',
                y: component.bindings?.yField || '',
            });

            return;
        }

        if (component.type === 'metric') {
            views.push({
                ...base,
                title: component.config?.title || 'Метрика',
                description: component.config?.description || '',
                field: component.bindings?.valueField || '',
                aggregation: 'sum',
            });
        }
    });

    return {
        version: 1,
        dashboard: {
            title: 'Untitled dashboard',
        },
        dataSource: {
            type: 'backend_dataset',
            datasetId: datasetMeta?.datasetId || null,
            name: datasetMeta?.name || 'data.csv',
            fields: availableFields,
        },
        filters,
        views,
    };
};

// Проверка JSON-схемы на правильность
export const validateSchema = (components) => {
    const errors = [];

    if (!components.length) {
        errors.push('Холст пуст. Добавьте хотя бы один компонент.');
    }

    // Проверка заполненности полей и свойств каждого компонента
    components.forEach((component, index) => {
        const name = component.props?.title || component.type || `component-${index + 1}`;

        if (component.type === 'selectbox') {
            if (!component.bindings?.field) {
                errors.push(`Компонент "${name}": не выбрано поле данных для фильтра.`);
            }
        }

        if (component.type === 'line_chart' || component.type === 'bar_chart') {
            if (!component.bindings?.xField) {
                errors.push(`Компонент "${name}": не выбрано поле X.`);
            }

            if (!component.bindings?.yField) {
                errors.push(`Компонент "${name}": не выбрано поле Y.`);
            }
        }

        if (component.type === 'metric') {
            if (!component.bindings?.valueField) {
                errors.push(`Компонент "${name}": не выбрано поле значения.`);
            }
        }
    });

    return errors;
};