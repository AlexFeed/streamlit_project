import EmptyPreview from "./EmptyPreview.jsx";

const LiveDataControl = ({item, rows, value, onChange, height, t, theme}) => {
    const field = item.bindings?.field;
    if (!field) return <EmptyPreview height={height} theme={theme}>{t('editor.filterNeedField')}</EmptyPreview>;
    const type = item.config?.controlType || 'range';
    const label = item.config?.title;

    if (type === 'toggle') {
        return <label className="flex items-center gap-2" style={{height}}>
            <input type="checkbox"
                   checked={Boolean(value)}
                   onChange={(event) => onChange(event.target.checked)}/>{label}
        </label>;
    }

    if (type === 'date') {
        const dates = rows.map((row) => new Date(row[field])).filter((date) => !Number.isNaN(date.getTime())).sort((a, b) => a - b);
        const range = Array.isArray(value) ? value : [dates[0]?.toISOString().slice(0, 10), dates.at(-1)?.toISOString().slice(0, 10)];

        return (
            <div className="flex w-full flex-col justify-center gap-1" style={{height}}>{label &&
                <span className="text-xs">{label}</span>}
                <div className="flex gap-2">
                    <input type="date" value={range[0] || ''}
                           onChange={(event) => onChange([event.target.value, range[1]])}
                           className="live-preview-select min-w-0 flex-1 rounded-lg border px-2 py-2"
                           style={{
                               backgroundColor: theme.background,
                               borderColor: theme.border
                           }}/>
                    <input type="date" value={range[1] || ''}
                           onChange={(event) => onChange([range[0], event.target.value])}
                           className="live-preview-select min-w-0 flex-1 rounded-lg border px-2 py-2"
                           style={{
                               backgroundColor: theme.background,
                               borderColor: theme.border
                           }}/>
                </div>
            </div>
        )
    }
    const values = rows.map((row) => Number(String(row[field] ?? '').replace(/\s/g, '').replace(',', '.'))).filter(Number.isFinite);
    const minimum = values.length ? Math.min(...values) : 0;
    const maximum = values.length ? Math.max(...values) : 100;
    const range = Array.isArray(value) ? value : [minimum, maximum];
    return (
        <div className="flex w-full flex-col justify-center gap-1" style={{height}}>
            {label && <span className="text-xs">{label}</span>}
            <div className="flex gap-2">
                <input type="number" value={range[0]} min={minimum} max={range[1]}
                       onChange={(event) => onChange([Number(event.target.value), range[1]])}
                       className="live-preview-select min-w-0 flex-1 rounded-lg border px-2 py-2"
                       style={{
                           backgroundColor: theme.background,
                           borderColor: theme.border
                       }}/>
                <input type="number" value={range[1]} min={range[0]} max={maximum}
                       onChange={(event) => onChange([range[0], Number(event.target.value)])}
                       className="live-preview-select min-w-0 flex-1 rounded-lg border px-2 py-2"
                       style={{
                           backgroundColor: theme.background,
                           borderColor: theme.border
                       }}/>
            </div>
        </div>
    )
};

export default LiveDataControl;