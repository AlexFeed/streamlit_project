import EmptyPreview from "./EmptyPreview.jsx";
import {useMemo} from "react";

const LiveFilter = ({
                        item,
                        rows,
                        value,
                        onChange,
                        height,
                        t,
                        language,
                        theme,
                    }) => {
    const field = item.bindings?.field;
    const options = useMemo(() => {
        if (!field) return [];

        return Array.from(new Set(
            rows
                .map((row) => row[field])
                .filter((option) => option != null)
                .map(String)
        )).sort((left, right) => left.localeCompare(right, language, {numeric: true}));
    }, [field, rows, language]);

    if (!field) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.filterNeedField')}
            </EmptyPreview>
        );
    }

    const widget = item.config?.widget || 'selectbox';
    const singleValue = Array.isArray(value) ? '' : (value || '');
    const allOptions = [{label: t('editor.allValues'), value: ''}, ...options.map((option) => ({
        label: option,
        value: option
    }))];

    const control = widget === 'radio' ? (
        <div className="live-preview-options">
            {allOptions.map((option) => (
                <label key={option.value || 'all'} className="live-preview-radio">
                    <input type="radio" checked={singleValue === option.value} onChange={() => onChange(option.value)}
                           onClick={(event) => event.stopPropagation()}/>
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    ) : ['segmented', 'pills'].includes(widget) ? (
        <div className="live-preview-options">
            {allOptions.map((option) => (
                <button
                    key={option.value || 'all'}
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onChange(option.value);
                    }}
                    className={`live-preview-option ${widget === 'pills' ? 'is-pill' : ''} ${singleValue === option.value ? 'is-active' : ''}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    ) : widget === 'multiselect' ? (
        <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))}
            onClick={(event) => event.stopPropagation()}
            className="live-preview-select min-h-16 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{backgroundColor: theme.background, borderColor: theme.border, color: theme.foreground}}
        >
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
    ) : (
        <select
            value={singleValue}
            onChange={(event) => onChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            className="live-preview-select w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
            style={{backgroundColor: theme.background, borderColor: theme.border, color: theme.foreground}}
        >
            {allOptions.map((option) => <option key={option.value || 'all'}
                                                value={option.value}>{option.label}</option>)}
        </select>
    );

    return (
        <div
            className={`live-preview-filter flex w-full min-w-0 flex-col ${item.layout?.manualHeight ? 'is-manual-height justify-start' : 'justify-center'}`}
            style={{
                height,
                color: item.config?.elementTextColor && item.config.elementTextColor !== '#d4d4d8'
                    ? item.config.elementTextColor
                    : theme.foreground,
                fontSize: item.config?.elementFontSize && item.config.elementFontSize !== 'auto'
                    ? `${item.config.elementFontSize}px`
                    : undefined,
                fontWeight: item.config?.elementFontWeight || 'normal',
                fontStyle: item.config?.elementFontStyle || 'normal',
            }}
        >
            {item.config?.title?.trim() && (
                <label className="mb-1.5 text-xs font-medium" style={{color: theme.muted}}>
                    {item.config.title}
                </label>
            )}
            {control}
        </div>
    );
};

export default LiveFilter;