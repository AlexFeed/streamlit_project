import { Info } from 'lucide-react';

// Стили
const inputClassName =
    'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const selectClassName =
    'w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

const panelSectionClassName = 'rounded-xl border border-zinc-800 bg-zinc-950/50 p-3';

// Заголовок поля с иконкой-подсказкой (i) справа сверху
const LabelWithTooltip = ({ label, helperText }) => (
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
export const FieldSelect = ({
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
            <LabelWithTooltip  label={label} helperText={helperText} />
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
export const TextField = ({
    label,
    value,
    onChange,
    placeholder,
    helperText,
}) => {
    return (
        <div className={panelSectionClassName}>
            <LabelWithTooltip  label={label} helperText={helperText} />
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

export const OptionSelect = ({
    label,
    value,
    onChange,
    options,
    helperText,
}) => (
    <div className={panelSectionClassName}>
        <LabelWithTooltip  label={label} helperText={helperText} />
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
