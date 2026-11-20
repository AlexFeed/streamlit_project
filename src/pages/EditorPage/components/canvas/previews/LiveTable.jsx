import EmptyPreview from "./EmptyPreview.jsx";

const LiveTable = ({item, rows, height, t, theme}) => {
    const selectedColumns = item.bindings?.columns || [];
    const availableColumns = rows[0] ? Object.keys(rows[0]) : [];
    let columns = selectedColumns.length > 0
        ? selectedColumns.filter((column) => availableColumns.includes(column))
        : availableColumns;
    let tableRows = rows;

    if ((item.config?.tableMode || 'data') === 'pivot') {
        const indexField = item.config?.pivotIndex;
        const valueField = item.config?.pivotValue;
        const aggregation = item.config?.pivotAggregation || 'sum';
        if (!availableColumns.includes(indexField) || !availableColumns.includes(valueField)) {
            return <EmptyPreview height={height} theme={theme}>{t('editor.tableNoData')}</EmptyPreview>;
        }
        const groups = new Map();
        rows.forEach((row) => {
            const key = String(row[indexField] ?? '');
            const numeric = Number(row[valueField]);
            const group = groups.get(key) || {values: [], count: 0};
            group.count += 1;
            if (Number.isFinite(numeric)) group.values.push(numeric);
            groups.set(key, group);
        });
        tableRows = Array.from(groups, ([key, group]) => {
            let value = group.count;
            if (aggregation !== 'count') {
                const values = group.values;
                if (!values.length) value = '';
                else if (aggregation === 'mean') value = values.reduce((sum, itemValue) => sum + itemValue, 0) / values.length;
                else if (aggregation === 'min') value = Math.min(...values);
                else if (aggregation === 'max') value = Math.max(...values);
                else value = values.reduce((sum, itemValue) => sum + itemValue, 0);
            }
            return {[indexField]: key, [valueField]: value};
        });
        columns = [indexField, valueField];
    }
    const requestedLimit = item.config?.rowMode === 'all'
        ? tableRows.length
        : Number(item.config?.rowLimit || 50);
    const canvasLimit = Math.min(requestedLimit, 200);
    const visibleRows = tableRows.slice(0, canvasLimit);

    if (!columns.length) return <EmptyPreview height={height} theme={theme}>{t('editor.tableNoData')}</EmptyPreview>;

    return (
        <div className="live-preview-table-wrap"
             style={{height, borderColor: theme.border, backgroundColor: theme.background}}>
            <table className="live-preview-table">
                <thead style={{backgroundColor: theme.background, color: theme.foreground}}>
                    <tr>{columns.map((column) => <th key={column}
                                                     style={{borderColor: theme.border}}>{column}</th>)}</tr>
                </thead>
                <tbody>
                    {visibleRows.map((row, index) => (
                        <tr key={index} style={{borderColor: theme.border}}>
                            {columns.map((column) => <td key={column}
                                                         title={String(row[column] ?? '')}>{String(row[column] ?? '')}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
            {requestedLimit > canvasLimit && (
                <div className="px-2 py-1 text-xs" style={{color: theme.muted}}>
                    {t('editor.tableCanvasLimit', {count: canvasLimit, total: requestedLimit})}
                </div>
            )}
        </div>
    );
};

export default LiveTable;