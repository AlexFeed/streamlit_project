import { useMemo } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    getPaletteColors,
    interpolatePaletteColor,
} from '../../data/chartPalettes.js';
import {
    calculateMetric,
    formatMetricValue,
    prepareChartData,
} from '../../services/chartData';
import { paletteItems } from '../../data/paletteItems.js';

const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '12px',
    color: '#fafafa',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
};

const EmptyPreview = ({ children, height = 240 }) => (
    <div
        className="flex items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 px-6 text-center"
        style={{ height }}
    >
        <p className="max-w-xs text-sm leading-6 text-zinc-500">{children}</p>
    </div>
);

const LiveChart = ({ item, rows, height }) => {
    const chartData = useMemo(
        () => prepareChartData(rows, item),
        [rows, item]
    );
    const xField = item.bindings?.xField;
    const yField = item.bindings?.yField;
    const color = item.config?.color || '#3b82f6';
    const colorMode = item.config?.colorMode || 'solid';
    const paletteColors = getPaletteColors(
        item.config?.palette,
        item.config?.reversePalette
    );
    const axisTick = {
        fill: item.config?.axisLabelColor || '#94a3b8',
        fontSize: item.config?.axisLabelFontSize || 11,
    };
    const axisTitle = {
        fill: item.config?.axisTitleColor || '#94a3b8',
        fontSize: item.config?.axisTitleFontSize || 12,
    };
    const yValues = chartData.map((point) => point.y);
    const minValue = yValues.length ? Math.min(...yValues) : 0;
    const maxValue = yValues.length ? Math.max(...yValues) : 0;
    const getPointColor = (point, index) => {
        if (colorMode === 'gradient') {
            return interpolatePaletteColor(
                point.y,
                minValue,
                maxValue,
                paletteColors
            );
        }
        if (colorMode === 'categorical') {
            return paletteColors[index % paletteColors.length];
        }
        return color;
    };

    if (!xField || !yField) {
        return (
            <EmptyPreview height={height}>
                Выберите поля X и Y в панели свойств — график появится сразу.
            </EmptyPreview>
        );
    }

    if (!rows.length) {
        return (
            <EmptyPreview height={height}>
                В выбранном датасете нет данных (0 строк). Заполните строки файла или выберите другой лист Excel при загрузке.
            </EmptyPreview>
        );
    }

    if (!chartData.length) {
        return (
            <EmptyPreview height={height}>
                Для выбранных полей нет числовых данных. Попробуйте изменить Y или агрегацию.
            </EmptyPreview>
        );
    }

    const common = (
        <>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
                dataKey="x"
                type={item.type === 'scatter_plot' ? 'number' : 'category'}
                tick={axisTick}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                minTickGap={24}
                label={{
                    value: xField,
                    position: 'insideBottom',
                    offset: -2,
                    style: axisTitle,
                }}
            />
            <YAxis
                dataKey={item.type === 'scatter_plot' ? 'y' : undefined}
                type="number"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={46}
                label={{
                    value: yField,
                    angle: -90,
                    position: 'insideLeft',
                    style: axisTitle,
                }}
            />
            <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: '#a1a1aa', marginBottom: 4 }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                formatter={(value) => [
                    formatMetricValue(value),
                    yField,
                ]}
                labelFormatter={(value) => `${xField}: ${value}`}
            />
        </>
    );

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                {item.type === 'line_chart' ? (
                    <LineChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 24 }}>
                        {common}
                        <Line
                            type="monotone"
                            dataKey="y"
                            stroke={color}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
                        />
                    </LineChart>
                ) : item.type === 'bar_chart' ? (
                    <BarChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 24 }}>
                        {common}
                        <Bar
                            dataKey="y"
                            fill={color}
                            radius={[6, 6, 2, 2]}
                            maxBarSize={56}
                        >
                            {chartData.map((point, index) => (
                                <Cell
                                    key={`${point.x}-${index}`}
                                    fill={getPointColor(point, index)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                ) : item.type === 'area_chart' ? (
                    <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 24 }}>
                        <defs>
                            <linearGradient id={`area-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        {common}
                        <Area
                            type="monotone"
                            dataKey="y"
                            stroke={color}
                            strokeWidth={3}
                            fill={`url(#area-${item.id})`}
                        />
                    </AreaChart>
                ) : (
                    <ScatterChart margin={{ top: 12, right: 12, left: 8, bottom: 24 }}>
                        {common}
                        <Scatter data={chartData} fill={color}>
                            {chartData.map((point, index) => (
                                <Cell
                                    key={`${point.x}-${index}`}
                                    fill={getPointColor(point, index)}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

const LiveMetric = ({ item, rows, height }) => {
    const value = useMemo(
        () => calculateMetric(rows, item),
        [rows, item]
    );

    if (!item.bindings?.valueField) {
        return (
            <EmptyPreview height={height}>
                Выберите поле метрики в панели свойств.
            </EmptyPreview>
        );
    }

    return (
        <div
            className="flex flex-col justify-center"
            style={{
                height,
                color: item.config?.elementTextColor || '#d4d4d8',
                fontStyle: item.config?.elementFontStyle || 'normal',
            }}
        >
            <p className="mb-1 text-xs font-medium opacity-70">
                {item.config?.title || 'Метрика'}
            </p>
            <p
                className="text-3xl tracking-tight"
                style={{ fontWeight: item.config?.elementFontWeight || 'bold' }}
            >
                {formatMetricValue(value)}
            </p>
            {item.config?.description?.trim() && (
                <p className="mt-1 text-xs opacity-70">
                    {item.config.description}
                </p>
            )}
        </div>
    );
};

const LiveText = ({ item, height }) => {
    const content = item.config?.content?.trim();

    if (!content) {
        return (
            <EmptyPreview height={height}>
                Введите текст в панели свойств.
            </EmptyPreview>
        );
    }

    return (
        <div
            className="overflow-auto whitespace-pre-wrap text-sm leading-6 text-zinc-300"
            style={{
                height,
                fontSize: `${item.config?.fontSize || 16}px`,
                fontWeight: item.config?.fontWeight || 'normal',
                fontStyle: item.config?.fontStyle || 'normal',
                color: item.config?.color || '#d4d4d8',
                textAlign: item.config?.textAlign || 'left',
            }}
        >
            {item.config?.title && (
                <div className="mb-1 text-xs font-semibold not-italic text-zinc-400">
                    {item.config.title}
                </div>
            )}
            <div>{item.config.content}</div>
        </div>
    );
};

const LiveFilter = ({
                        item,
                        rows,
                        value,
                        onChange,
                        height,
                    }) => {
    const field = item.bindings?.field;
    const options = useMemo(() => {
        if (!field) return [];

        return Array.from(new Set(
            rows
                .map((row) => row[field])
                .filter((option) => option != null)
                .map(String)
        )).sort((left, right) => left.localeCompare(right, 'ru', { numeric: true }));
    }, [field, rows]);

    if (!field) {
        return (
            <EmptyPreview height={height}>
                Выберите поле фильтра в панели свойств.
            </EmptyPreview>
        );
    }

    const widget = item.config?.widget || 'selectbox';
    const singleValue = Array.isArray(value) ? '' : (value || '');
    const allOptions = ['Все значения', ...options];

    const renderControl = () => {
        if (widget === 'radio') {
            return (
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 overflow-auto text-sm">
                    {allOptions.map((option) => {
                        const optionValue = option === 'Все значения' ? '' : option;
                        return (
                            <label key={option} className="flex items-center gap-1.5">
                                <input
                                    type="radio"
                                    checked={singleValue === optionValue}
                                    onChange={() => onChange(optionValue)}
                                    onClick={(event) => event.stopPropagation()}
                                />
                                {option}
                            </label>
                        );
                    })}
                </div>
            );
        }

        if (['segmented', 'pills'].includes(widget)) {
            return (
                <div className="flex flex-wrap gap-1.5 overflow-auto">
                    {allOptions.map((option) => {
                        const optionValue = option === 'Все значения' ? '' : option;
                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onChange(optionValue);
                                }}
                                className={`${widget === 'pills' ? 'rounded-full' : 'rounded-lg'} px-2.5 py-1.5 text-xs transition ${
                                    singleValue === optionValue
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-zinc-800 text-zinc-300'
                                }`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            );
        }

        if (widget === 'multiselect') {
            const selected = Array.isArray(value) ? value : [];
            return (
                <select
                    multiple
                    value={selected}
                    onChange={(event) => onChange(
                        Array.from(event.target.selectedOptions, (option) => option.value)
                    )}
                    onClick={(event) => event.stopPropagation()}
                    className="min-h-16 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                >
                    {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            );
        }

        return (
            <select
                value={singleValue}
                onChange={(event) => onChange(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
                <option value="">Все значения</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        );
    };

    return (
        <div
            className="flex flex-col justify-center"
            style={{ height }}
        >
            {item.config?.title?.trim() && (
                <label className="mb-1.5 text-xs font-medium opacity-70">
                    {item.config.title}
                </label>
            )}
            {renderControl()}
        </div>
    );
};

const LivePageLink = ({ item, pages, height }) => {
    const target = pages?.find((page) => page.id === item.config?.targetPageId);
    const label = item.config?.title || 'Открыть страницу';
    const isLink = item.config?.displayStyle === 'link';

    return (
        <div
            data-canvas-drag-surface
            className="flex cursor-grab touch-none items-center active:cursor-grabbing"
            style={{ height }}
        >
            <span
                className={isLink
                    ? 'text-sm font-medium text-blue-400 underline decoration-blue-400/40 underline-offset-4'
                    : 'rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white'}
            >
                {label}
            </span>
            {!target && (
                <span className="ml-3 text-xs text-amber-400">Выберите страницу</span>
            )}
        </div>
    );
};

const LiveTable = ({ item, rows, height }) => {
    const selectedColumns = item.bindings?.columns || [];
    const availableColumns = rows[0] ? Object.keys(rows[0]) : [];
    const columns = selectedColumns.length > 0
        ? selectedColumns.filter((column) => availableColumns.includes(column))
        : availableColumns;
    const visibleRows = rows.slice(0, item.config?.rowLimit || 50);

    if (columns.length === 0) {
        return <EmptyPreview height={height}>Нет данных для таблицы.</EmptyPreview>;
    }

    return (
        <div className="h-full overflow-auto rounded-xl border border-zinc-800 bg-zinc-950/60">
            <table className="min-w-full border-collapse text-left text-xs text-zinc-300">
                <thead className="sticky top-0 bg-zinc-900 text-zinc-100">
                    <tr>
                        {columns.map((column) => (
                            <th key={column} className="border-b border-zinc-700 px-3 py-2 font-semibold">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.map((row, index) => (
                        <tr key={index} className="border-b border-zinc-800/80">
                            {columns.map((column) => (
                                <td key={column} className="max-w-52 truncate px-3 py-2">
                                    {String(row[column] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const LiveComponentPreview = (props) => {
    const { item, height } = props;

    if (paletteItems[item.type]?.isChart) {
        return <LiveChart item={item} rows={props.rows} height={height} />;
    }
    if (item.type === 'metric') {
        return <LiveMetric item={item} rows={props.rows} height={height} />;
    }
    if (item.type === 'text') {
        return <LiveText item={item} height={height} />;
    }
    if (item.type === 'selectbox') {
        return <LiveFilter {...props} />;
    }
    if (item.type === 'page_link') {
        return <LivePageLink item={item} pages={props.pages} height={height} />;
    }
    if (item.type === 'table') {
        return <LiveTable item={item} rows={props.rows} height={height} />;
    }

    return <EmptyPreview>Неизвестный тип компонента.</EmptyPreview>;
};

export default LiveComponentPreview;
