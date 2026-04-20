export const buildDashboardSchema = (components, availableFields = []) => {
    return {
        version: 1,
        dashboard: {
            title: 'Untitled dashboard',
        },
        dataSource: {
            type: 'csv_upload',
            name: 'main_dataset',
            fields: availableFields,
        },
        components: components.map((component, index) => ({
            id: component.id,
            type: component.type,
            order: index + 1,
            config: component.config,
            bindings: component.bindings,
        })),
    };
};

export const validateSchema = (components) => {
    const errors = [];

    if (!components.length) {
        errors.push('Холст пуст. Добавьте хотя бы один компонент.');
    }

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