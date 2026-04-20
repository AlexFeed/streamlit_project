export const paletteItems = [
    {
        type: 'selectbox',
        label: 'Фильтр',
        description: 'Фильтрация данных по выбранному полю',
        defaultConfig: {
            title: 'Фильтр',
            placeholder: 'Выберите значение',
        },
        defaultBindings: {
            field: '',
        },
    },
    {
        type: 'line_chart',
        label: 'Линейный график',
        description: 'Отображение изменения показателя во времени',
        defaultConfig: {
            title: 'Линейный график',
        },
        defaultBindings: {
            xField: '',
            yField: '',
        },
    },
    {
        type: 'bar_chart',
        label: 'Столбчатый график',
        description: 'Сравнение значений между категориями',
        defaultConfig: {
            title: 'Столбчатый график',
        },
        defaultBindings: {
            xField: '',
            yField: '',
        },
    },
    {
        type: 'metric',
        label: 'Метрика',
        description: 'Отображение агрегированного значения',
        defaultConfig: {
            title: 'Метрика',
            description: '',
        },
        defaultBindings: {
            valueField: '',
        },
    },
];