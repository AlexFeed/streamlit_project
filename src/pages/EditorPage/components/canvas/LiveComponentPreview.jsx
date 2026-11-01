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

const axisTick = {
    fill: '#71717a',
    fontSize: 11,
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
            />
            <YAxis
                dataKey={item.type === 'scatter_plot' ? 'y' : undefined}
                type="number"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={46}
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
                    <LineChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
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
                    <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
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
                    <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
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
                    <ScatterChart margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
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
            className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-blue-500/15 via-zinc-950/80 to-violet-500/10 px-4 py-3"
            style={{ height }}
        >
            <p className="mb-1 text-xs font-medium text-zinc-400">
                {item.config?.title || 'Метрика'}
            </p>
            <p className="text-3xl font-semibold tracking-tight text-white">
                {formatMetricValue(value)}
            </p>
            {item.config?.description?.trim() && (
                <p className="mt-1 text-xs text-zinc-400">
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
            className="overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950/40 px-3 py-2 text-sm leading-6 text-zinc-300"
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

    return (
        <div
            className="flex flex-col justify-center rounded-xl bg-zinc-950/60 px-3 py-2"
            style={{ height }}
        >
            {item.config?.title?.trim() && (
                <label className="mb-1.5 text-xs font-medium text-zinc-400">
                    {item.config.title}
                </label>
            )}
            <select
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
                <option value="">Все значения</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
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

    return <EmptyPreview>Неизвестный тип компонента.</EmptyPreview>;
};

export default LiveComponentPreview;
