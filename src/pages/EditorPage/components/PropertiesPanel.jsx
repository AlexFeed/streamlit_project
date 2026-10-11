import { Trash2, X } from 'lucide-react';
import { paletteItems } from '../data/paletteItems.js';
import {
    FieldSelect,
    TextField,
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

const PropertiesPanel = ({
                             selectedComponent,
                             onUpdateComponent,
                             onDeleteSelected,
                             onClose,
                             availableFields = [],
                             fieldTypes = {},
                         }) => {
    if (!selectedComponent) {
        return null;
    }

    const { type, config, bindings } = selectedComponent;
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

    return (
        <>
        <button
            type="button"
            aria-label="Закрыть панель свойств"
            onClick={onClose}
            className="fixed inset-0 top-[65px] z-30 bg-transparent xl:hidden"
        />
        <aside className="fixed bottom-0 right-0 top-[65px] z-40 w-[360px] overflow-y-auto border-l border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 xl:static xl:z-20 xl:h-full xl:w-auto xl:min-w-0 xl:shadow-none">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-xl">
                <div>
                    <h2 className="text-base font-semibold text-white">
                        {config.title || 'Без названия'}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                >
                    <X className="h-3.5 w-3.5" />
                    Закрыть
                </button>
            </div>

            <div className="space-y-3 p-4">
                <TextField
                    label="Заголовок"
                    value={config.title || ''}
                    onChange={(value) => updateConfig('title', value)}
                    placeholder="Введите заголовок компонента"
                    helperText="Отображается над графиком или элементом"
                />

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
                            label="Описание"
                            value={config.description || ''}
                            onChange={(value) => updateConfig('description', value)}
                            placeholder="Например: Общая выручка"
                            helperText="Краткое пояснение для пользователя"
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

            <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-xl">
                <button
                    type="button"
                    onClick={onDeleteSelected}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                >
                    <Trash2 className="h-4 w-4" />
                    Удалить компонент
                </button>
            </div>
        </aside>
        </>
    );
};

export default PropertiesPanel;
