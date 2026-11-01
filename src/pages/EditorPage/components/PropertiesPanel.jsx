import { Trash2, X } from 'lucide-react';
import { paletteItems } from '../data/paletteItems.js';
import {
    FieldSelect,
    TextField,
    TextAreaField,
    ColorField,
    OptionSelect,
} from './properties/PropertyFields.jsx';
import ColorStyleField from './properties/ColorStyleField.jsx';

const aggregationOptions = [
    { value: 'none', label: 'Без агрегации' },
    { value: 'sum', label: 'Сумма' },
    { value: 'mean', label: 'Среднее' },
    { value: 'count', label: 'Количество' },
    { value: 'min', label: 'Минимум' },
    { value: 'max', label: 'Максимум' },
];

const sortOptions = [
    { value: 'none', label: 'Не сортировать' },
    { value: 'asc', label: 'По возрастанию' },
    { value: 'desc', label: 'По убыванию' },
];

const sortByOptions = [
    { value: 'x', label: 'По значениям X' },
    { value: 'y', label: 'По значениям Y' },
];

const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32].map((size) => ({
    value: String(size),
    label: `${size} px`,
}));

const fontWeightOptions = [
    { value: 'normal', label: 'Обычный' },
    { value: 'bold', label: 'Жирный' },
];

const fontStyleOptions = [
    { value: 'normal', label: 'Обычный' },
    { value: 'italic', label: 'Курсив' },
];

const textAlignOptions = [
    { value: 'left', label: 'Слева' },
    { value: 'center', label: 'По центру' },
    { value: 'right', label: 'Справа' },
];

const PropertiesPanel = ({
                             selectedComponent,
                             onUpdateComponent,
                             onDeleteSelected,
                             onClose,
                             datasets = [],
                         }) => {
    if (!selectedComponent) {
        return null;
    }

    const { type, config, bindings } = selectedComponent;

    const activeDataset =
        datasets.find((ds) => ds.datasetId === selectedComponent.datasetId) ||
        datasets[0] ||
        null;
    const availableFields = activeDataset?.fields || [];
    const fieldTypes = activeDataset?.fieldTypes || {};

    const datasetOptions = datasets.map((ds) => ({
        value: ds.datasetId,
        label: ds.name,
    }));

    const fieldOptions = availableFields.map((field) => ({
        value: field,
        label: fieldTypes[field] ? `${field} · ${fieldTypes[field]}` : field,
    }));
    const numericFieldOptions = fieldOptions.filter(
        (option) => fieldTypes[option.value] === 'number'
    );
    const valueFieldOptions = numericFieldOptions.length
        ? numericFieldOptions
        : fieldOptions;
    const xFieldOptions = type === 'scatter_plot'
        ? valueFieldOptions
        : fieldOptions;
    const aggregatedValueFieldOptions = config.aggregation === 'count'
        ? fieldOptions
        : valueFieldOptions;

    // Обновление значений конфига в схеме (название схемы)
    const updateConfig = (key, value) => {
        onUpdateComponent(selectedComponent.id, (component) => ({
            ...component,
            config: {
                ...component.config,
                [key]: value,
            },
        }));
    };

    // Обновление значений полей в схеме
    const updateBinding = (key, value) => {
        onUpdateComponent(selectedComponent.id, (component) => ({
            ...component,
            bindings: {
                ...component.bindings,
                [key]: value,
            },
        }));
    };

    // Смена источника данных (CSV) для компонента со сбросом отсутствующих полей
    const updateDataset = (nextDatasetId) => {
        const nextDataset = datasets.find((ds) => ds.datasetId === nextDatasetId);
        const nextFields = new Set(nextDataset?.fields || []);

        onUpdateComponent(selectedComponent.id, (component) => {
            const cleanedBindings = { ...component.bindings };

            Object.keys(cleanedBindings).forEach((key) => {
                if (cleanedBindings[key] && !nextFields.has(cleanedBindings[key])) {
                    cleanedBindings[key] = '';
                }
            });

            return {
                ...component,
                datasetId: nextDatasetId,
                bindings: cleanedBindings,
            };
        });
    };

    return (
        <>
            <button
                type="button"
                aria-label="Закрыть панель свойств"
                onClick={onClose}
                className="properties-backdrop"
            />
            <aside className="properties-panel">
                <div className="properties-panel-header">
                    <div>
                        <h2 className="properties-panel-title">
                            {config.title || 'Без названия'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary properties-close-button"
                    >
                        <X aria-hidden="true" />
                        Закрыть
                    </button>
                </div>

                <div className="properties-panel-fields">
                    <TextField
                        label={type === 'text' ? 'Заголовок (необязательно)' : 'Заголовок'}
                        value={config.title || ''}
                        onChange={(value) => updateConfig('title', value)}
                        placeholder={type === 'text'
                            ? 'Можно оставить пустым'
                            : 'Введите заголовок компонента'}
                        helperText={type === 'text'
                            ? 'Если поле пустое, в готовом приложении будет показан только текст'
                            : 'Отображается над графиком или элементом'}
                    />

                    {type !== 'text' && (
                        <FieldSelect
                            label="Источник данных (CSV)"
                            value={activeDataset?.datasetId || ''}
                            onChange={updateDataset}
                            options={datasetOptions}
                            placeholder="Выберите CSV-файл"
                            helperText="CSV-файл, из которого компонент берёт данные"
                        />
                    )}

                    {type === 'text' && (
                        <>
                            <TextAreaField
                                label="Текст"
                                value={config.content || ''}
                                onChange={(value) => updateConfig('content', value)}
                                placeholder="Введите пояснение для пользователя"
                                helperText="Этот текст будет показан на холсте и в готовом Streamlit-приложении"
                            />

                            <OptionSelect
                                label="Размер текста"
                                value={String(config.fontSize || 16)}
                                onChange={(value) => updateConfig('fontSize', Number(value))}
                                options={fontSizeOptions}
                            />

                            <OptionSelect
                                label="Начертание"
                                value={config.fontWeight || 'normal'}
                                onChange={(value) => updateConfig('fontWeight', value)}
                                options={fontWeightOptions}
                            />

                            <OptionSelect
                                label="Стиль"
                                value={config.fontStyle || 'normal'}
                                onChange={(value) => updateConfig('fontStyle', value)}
                                options={fontStyleOptions}
                            />

                            <ColorField
                                label="Цвет текста"
                                value={config.color || '#d4d4d8'}
                                onChange={(value) => updateConfig('color', value)}
                            />

                            <OptionSelect
                                label="Выравнивание"
                                value={config.textAlign || 'left'}
                                onChange={(value) => updateConfig('textAlign', value)}
                                options={textAlignOptions}
                            />
                        </>
                    )}

                    {type === 'selectbox' && (
                        <>
                            <FieldSelect
                                label="Поле данных"
                                value={bindings.field || ''}
                                onChange={(value) => updateBinding('field', value)}
                                options={fieldOptions}
                                placeholder="Выберите поле"
                                helperText="Поле, по которому строится список значений"
                            />

                            <TextField
                                label="Подсказка"
                                value={config.placeholder || ''}
                                onChange={(value) => updateConfig('placeholder', value)}
                                placeholder="Например: Выберите отдел"
                                helperText="Отображается до выбора значения"
                            />
                        </>
                    )}

                    {paletteItems[type]?.isChart && (
                        <>
                            <FieldSelect
                                label="Поле X"
                                value={bindings.xField || ''}
                                onChange={(value) => updateBinding('xField', value)}
                                options={xFieldOptions}
                                placeholder="Выберите поле X"
                                helperText="Горизонтальная ось графика"
                            />

                            <FieldSelect
                                label="Поле Y"
                                value={bindings.yField || ''}
                                onChange={(value) => updateBinding('yField', value)}
                                options={aggregatedValueFieldOptions}
                                placeholder="Выберите поле Y"
                                helperText="Значения, отображаемые на графике"
                            />

                            <OptionSelect
                                label="Агрегация"
                                value={config.aggregation || 'none'}
                                onChange={(value) => updateConfig('aggregation', value)}
                                options={aggregationOptions}
                                helperText="Как объединять несколько значений для одной точки X"
                            />

                            <OptionSelect
                                label="Сортировка"
                                value={config.sort || 'none'}
                                onChange={(value) => updateConfig('sort', value)}
                                options={sortOptions}
                                helperText="Направление сортировки"
                            />

                            {config.sort !== 'none' && (
                                <OptionSelect
                                    label="Сортировать"
                                    value={config.sortBy || 'x'}
                                    onChange={(value) => updateConfig('sortBy', value)}
                                    options={sortByOptions}
                                    helperText="X — порядок категорий или дат, Y — рейтинг по величине"
                                />
                            )}

                            <ColorStyleField
                                type={type}
                                config={config}
                                onUpdate={updateConfig}
                            />
                        </>
                    )}

                    {type === 'metric' && (
                        <>
                            <FieldSelect
                                label="Поле значения"
                                value={bindings.valueField || ''}
                                onChange={(value) => updateBinding('valueField', value)}
                                options={aggregatedValueFieldOptions}
                                placeholder="Выберите поле"
                                helperText="Поле, из которого берётся значение метрики"
                            />

                            <TextField
                                label="Описание (необязательно)"
                                value={config.description || ''}
                                onChange={(value) => updateConfig('description', value)}
                                placeholder="Например: Общая выручка"
                                helperText="Если оставить пустым, под метрикой ничего не появится"
                            />

                            <OptionSelect
                                label="Агрегация"
                                value={config.aggregation || 'sum'}
                                onChange={(value) => updateConfig('aggregation', value)}
                                options={aggregationOptions.filter((option) => option.value !== 'none')}
                                helperText="Способ вычисления итогового значения"
                            />
                        </>
                    )}
                </div>

                <div className="properties-panel-footer">
                    <button
                        type="button"
                        onClick={onDeleteSelected}
                        className="btn properties-delete-button"
                    >
                        <Trash2 aria-hidden="true" />
                        Удалить компонент
                    </button>
                </div>
            </aside>
        </>
    );
};

export default PropertiesPanel;
