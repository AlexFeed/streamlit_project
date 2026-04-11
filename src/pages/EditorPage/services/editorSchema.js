export const buildDashboardSchema = (components, availableFields = []) => {
    return {
        version: 1,
        title: 'Untitled dashboard',
        exportedAt: new Date().toISOString(),
        dataSource: {
            type: 'csv_upload',
            name: 'main_dataset',
            fields: availableFields,
        },
        components,
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
            if (!component.props?.field) {
                errors.push(`Компонент "${name}": не выбрано поле данных для фильтра.`);
            }
        }

        if (component.type === 'line_chart' || component.type === 'bar_chart') {
            if (!component.props?.xField) {
                errors.push(`Компонент "${name}": не выбрано поле X.`);
            }

            if (!component.props?.yField) {
                errors.push(`Компонент "${name}": не выбрано поле Y.`);
            }
        }

        if (component.type === 'metric') {
            if (!component.props?.valueField) {
                errors.push(`Компонент "${name}": не выбрано поле значения.`);
            }
        }
    });

    return errors;
};