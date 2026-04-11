// Стили
const inputClassName =
    'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const selectClassName =
    'w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const labelClassName = 'mb-1.5 block text-sm font-medium text-zinc-200';

const helperClassName = 'mt-1 text-xs text-zinc-500';

const panelSectionClassName = 'rounded-xl border border-zinc-800 bg-zinc-950/50 p-3';

// Поле выбора значения для компонента
const FieldSelect = ({
                         label,
                         value,
                         onChange,
                         options,
                         placeholder,
                         helperText,
                     }) => {
    return (
        <div className={panelSectionClassName}>
            <label className={labelClassName}>{label}</label>

            <div className="relative">
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={selectClassName}
                >
                    <option value="" disabled className="text-zinc-500">
                        {placeholder}
                    </option>

                    {options.map((field) => (
                        <option key={field} value={field}>
                            {field}
                        </option>
                    ))}
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

            {helperText && <p className={helperClassName}>{helperText}</p>}
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
            <label className={labelClassName}>{label}</label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={inputClassName}
                placeholder={placeholder}
            />
            {helperText && <p className={helperClassName}>{helperText}</p>}
        </div>
    );
};

const PropertiesPanel = ({
                             selectedComponent,
                             onUpdateComponent,
                             onDeleteSelected,
                             availableFields = [],
                         }) => {
    if (!selectedComponent) {
        return (
            <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 p-4">
                    <h2 className="mb-2 text-lg font-semibold text-white">Свойства</h2>
                    <p className="text-sm leading-6 text-zinc-400">
                        Выберите элемент на холсте, чтобы изменить его настройки и привязать поля данных.
                    </p>
                </div>
            </aside>
        );
    }

    const { type, props } = selectedComponent;

    // Обновление данных в компоненте
    const updateProp = (key, value) => {
        onUpdateComponent(selectedComponent.id, {
            ...props,
            [key]: value,
        });
    };

    return (
        <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-white">Свойства</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Тип элемента: <span className="font-medium text-zinc-200">{type}</span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onDeleteSelected}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                >
                    Удалить
                </button>
            </div>

            <div className="space-y-3">
                <TextField
                    label="Заголовок"
                    value={props.title || ''}
                    onChange={(value) => updateProp('title', value)}
                    placeholder="Введите заголовок элемента"
                    helperText="Этот текст будет отображаться на карточке или графике."
                />

                {type === 'selectbox' && (
                    <>
                        <FieldSelect
                            label="Поле данных"
                            value={props.field || ''}
                            onChange={(value) => updateProp('field', value)}
                            options={availableFields}
                            placeholder="Выберите поле"
                            helperText="По этому полю будет формироваться список значений для фильтра."
                        />

                        <TextField
                            label="Подсказка"
                            value={props.placeholder || ''}
                            onChange={(value) => updateProp('placeholder', value)}
                            placeholder="Например: Выберите отдел"
                            helperText="Этот текст увидит пользователь до выбора значения."
                        />
                    </>
                )}

                {(type === 'line_chart' || type === 'bar_chart') && (
                    <>
                        <FieldSelect
                            label="Поле X"
                            value={props.xField || ''}
                            onChange={(value) => updateProp('xField', value)}
                            options={availableFields}
                            placeholder="Выберите поле X"
                            helperText="Поле, которое будет использоваться как горизонтальная ось графика."
                        />

                        <FieldSelect
                            label="Поле Y"
                            value={props.yField || ''}
                            onChange={(value) => updateProp('yField', value)}
                            options={availableFields}
                            placeholder="Выберите поле Y"
                            helperText="Поле, значения которого будут построены на графике."
                        />
                    </>
                )}

                {type === 'metric' && (
                    <>
                        <FieldSelect
                            label="Поле значения"
                            value={props.valueField || ''}
                            onChange={(value) => updateProp('valueField', value)}
                            options={availableFields}
                            placeholder="Выберите поле"
                            helperText="Из этого поля будет рассчитываться или отображаться метрика."
                        />

                        <TextField
                            label="Описание"
                            value={props.description || ''}
                            onChange={(value) => updateProp('description', value)}
                            placeholder="Например: Общая выручка"
                            helperText="Короткое пояснение для пользователя."
                        />
                    </>
                )}
            </div>
        </aside>
    );
};

export default PropertiesPanel;