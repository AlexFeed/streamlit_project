import { Trash2, X, Info} from 'lucide-react';
import {
    chartPalettes,
    getPaletteColors,
} from '../data/chartPalettes.js';
import { getComponentMeta } from '../data/paletteItems.js';

// Стили
const inputClassName =
    'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const selectClassName =
    'w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const labelClassName = 'mb-1.5 block text-sm font-medium text-zinc-200';

const panelSectionClassName = 'rounded-xl border border-zinc-800 bg-zinc-950/50 p-3';

// Заголовок поля с иконкой-подсказкой (i) справа сверху
const FieldLabel = ({ label, helperText }) => (
    <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-zinc-200">
            {label}
        </label>

        {helperText && (
            <div className="group relative flex items-center">
                <button
                    type="button"
                    aria-label="Подсказка"
                    className="rounded-md p-0.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 focus:bg-zinc-800 focus:text-blue-400 focus:outline-none"
                >
                    <Info className="h-3.5 w-3.5" />
                </button>

                <div
                    role="tooltip"
                    className="pointer-events-none invisible absolute right-full top-1/2 z-30 mr-1.5 w-max max-w-[200px] -translate-y-1/2 rounded-lg border border-zinc-700 bg-zinc-900/95 px-2 py-1 text-[10px] leading-tight text-zinc-300 opacity-0 shadow-lg shadow-black/60 backdrop-blur-md transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                >
                    {helperText}
                </div>
            </div>
        )}
    </div>
);
// Поле выбора значения для компонента
const FieldSelect = ({
                         label,
                         value,
                         onChange,
                         options = [],
                         placeholder = 'Выберите значение',
                         helperText,
                     }) => {
    const isDisabled = !options.length;
    return (
        <div className={panelSectionClassName}>
            <FieldLabel label={label} helperText={helperText} />
            <div className="relative">
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${selectClassName} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isDisabled}
                >
                    <option value="" disabled className="text-zinc-500">
                        {isDisabled ? 'Нет доступных полей' : placeholder}
                    </option>
                    {options.map((field) => {
                        const option = typeof field === 'string'
                            ? { value: field, label: field }
                            : field;
                        return (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        );
                    })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};


// Текстовое поле
const TextField = ({
                       label,
                       value,
                       onChange,
                       placeholder,
                       helperText,
                   }) => {
    return (
        <div className={panelSectionClassName}>
            <FieldLabel label={label} helperText={helperText} />
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={inputClassName}
                placeholder={placeholder}
            />
        </div>
    );
};

const OptionSelect = ({
                          label,
                          value,
                          onChange,
                          options,
                          helperText,
                      }) => (
    <div className={panelSectionClassName}>
        <FieldLabel label={label} helperText={helperText} />
        <select
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            className={selectClassName}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

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

const colorPresets = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
];

const ColorStyleField = ({
                             type,
                             config,
                             onUpdate,
                         }) => {
    const supportsPaletteModes = Boolean(
        getComponentMeta(type)?.supportsPaletteModes
    );
    const colorMode = supportsPaletteModes
        ? config.colorMode || 'solid'
        : 'solid';
    const paletteColors = getPaletteColors(
        config.palette,
        config.reversePalette
    );
    const modeOptions = [
        { value: 'solid', label: 'Один цвет' },
        { value: 'gradient', label: 'По значению' },
        { value: 'categorical', label: 'Категории X' },
    ];

    return (
    <div className={panelSectionClassName}>
        <div className="mb-3">
            <label className="text-sm font-medium text-zinc-200">Цветовая схема</label>
        </div>

        <div className={`mb-4 grid gap-1 rounded-xl bg-zinc-900 p-1 ${
            supportsPaletteModes ? 'grid-cols-3' : 'grid-cols-1'
        }`}>
            {modeOptions
                .filter((option) => supportsPaletteModes || option.value === 'solid')
                .map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onUpdate('colorMode', option.value)}
                        className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                            colorMode === option.value
                                ? 'bg-zinc-700 text-white shadow'
                                : 'text-zinc-500 hover:text-zinc-200'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
        </div>

        {colorMode === 'solid' ? (
            <>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-500">Основной цвет</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={config.color || '#3b82f6'}
                            onChange={(event) => onUpdate('color', event.target.value)}
                            className="h-8 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-0.5"
                            aria-label="Выбрать произвольный цвет"
                        />
                        <span className="font-mono text-xs uppercase text-zinc-400">
                            {config.color || '#3b82f6'}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {colorPresets.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => onUpdate('color', color)}
                            className={`aspect-square rounded-lg border-2 transition hover:scale-110 ${
                                config.color === color ? 'border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Выбрать цвет ${color}`}
                            title={color}
                        />
                    ))}
                </div>
            </>
        ) : (
            <>
                <div className="grid grid-cols-2 gap-2">
                    {chartPalettes.map((palette) => {
                        const colors = config.reversePalette
                            ? [...palette.colors].reverse()
                            : palette.colors;

                        return (
                            <button
                                key={palette.id}
                                type="button"
                                onClick={() => onUpdate('palette', palette.id)}
                                className={`rounded-xl border p-2 text-left transition ${
                                    (config.palette || 'ocean') === palette.id
                                        ? 'border-blue-400 bg-blue-500/10'
                                        : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                                }`}
                            >
                                <span
                                    className="block h-7 rounded-lg"
                                    style={{
                                        background: `linear-gradient(90deg, ${colors.join(', ')})`,
                                    }}
                                />
                                <span className="mt-1.5 block text-xs text-zinc-400">
                                    {palette.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => onUpdate('reversePalette', !config.reversePalette)}
                    className="mt-3 flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-300 transition hover:border-zinc-700"
                >
                    <span>Развернуть палитру</span>
                    <span
                        className="h-3 w-20 rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${paletteColors.join(', ')})`,
                        }}
                    />
                </button>
            </>
        )}
    </div>
    );
};

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

                {getComponentMeta(type)?.isChart && (
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
