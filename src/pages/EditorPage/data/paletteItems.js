export const paletteItems = [
    {
        type: 'selectbox',
        label: 'Filter / Selectbox',
        description: 'Фильтр по одному полю',
        defaultProps: {
            title: 'Выберите значение',
            field: '',
            placeholder: 'Выберите значение',
        },
    },
    {
        type: 'line_chart',
        label: 'Line Chart',
        description: 'Линейный график',
        defaultProps: {
            title: 'Линейный график',
            xField: '',
            yField: '',
        },
    },
    {
        type: 'bar_chart',
        label: 'Bar Chart',
        description: 'Столбчатый график',
        defaultProps: {
            title: 'Столбчатый график',
            xField: '',
            yField: '',
        },
    },
    {
        type: 'metric',
        label: 'Metric',
        description: 'Карточка метрики',
        defaultProps: {
            title: 'KPI',
            valueField: '',
            description: '',
        },
    },
];