import { useDeferredValue, useMemo } from 'react';
import {
    formatMetricValue,
    prepareChartData,
} from '../../../services/chartData.js';
import {
    getChartColor,
    getPaletteColors,
    interpolatePaletteColor,
} from '../../../data/chartPalettes.js';
import EmptyPreview from './EmptyPreview.jsx';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Rectangle,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const CHART_MARGIN = { top: 16, right: 16, left: 24, bottom: 40 };

const LiveChart = ({ item, rows, height, t, theme }) => {
    const deferredRows = useDeferredValue(rows);
    const deferredItem = useDeferredValue(item);

    const chartType = deferredItem.type;
    const xField = deferredItem.bindings?.xField;
    const yField = deferredItem.bindings?.yField;
    const aggregation = deferredItem.config?.aggregation;
    const sort = deferredItem.config?.sort;
    const sortBy = deferredItem.config?.sortBy;

    // Only recompute dataset points when fields or aggregation settings change.
    const chartData = useMemo(
        () => prepareChartData(deferredRows, {
            type: chartType,
            bindings: { xField, yField },
            config: { aggregation, sort, sortBy },
        }),
        [deferredRows, chartType, xField, yField, aggregation, sort, sortBy]
    );

    const availableFields = rows[0] ? new Set(Object.keys(rows[0])) : new Set();
    const fieldsExist = Boolean(
        xField
        && yField
        && availableFields.has(xField)
        && availableFields.has(yField)
    );
    const validAggregation = ['none', 'sum', 'mean', 'count', 'min', 'max']
        .includes(item.config?.aggregation || 'none');

    const configuredColor = item.config?.color;
    const color = getChartColor(item.type, configuredColor)
        || '#3478c8';
    const colorMode = item.config?.colorMode || 'solid';
    const isMultiColor = colorMode === 'gradient' || colorMode === 'categorical';
    const paletteColors = getPaletteColors(
        item.config?.palette,
        item.config?.reversePalette
    );
    const yValues = chartData.map((point) => point.y);
    const minValue = yValues.length ? Math.min(...yValues) : 0;
    const maxValue = yValues.length ? Math.max(...yValues) : 0;
    const axisTick = {
        fill: item.config?.axisLabelColor || theme.muted,
        fontSize: item.config?.axisLabelFontSize || 11,
    };
    const axisTitle = {
        fill: item.config?.axisTitleColor || theme.muted,
        fontSize: item.config?.axisTitleFontSize || 12,
        fontWeight: 600,
    };
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

    if (!fieldsExist || !validAggregation) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.chartNeedFields')}
            </EmptyPreview>
        );
    }

    if (!rows.length) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.chartNoRows')}
            </EmptyPreview>
        );
    }

    if (!chartData.length) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.chartNoNumeric')}
            </EmptyPreview>
        );
    }

    const common = (
        <>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
                dataKey="x"
                type={item.type === 'scatter_plot' ? 'number' : 'category'}
                tick={axisTick}
                tickLine={false}
                tickMargin={8}
                axisLine={{ stroke: theme.border }}
                minTickGap={24}
                label={{ value: xField, position: 'insideBottom', offset: -18, style: axisTitle }}
            />
            <YAxis
                dataKey={item.type === 'scatter_plot' ? 'y' : undefined}
                type="number"
                tick={axisTick}
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                width={68}
                label={{
                    value: yField,
                    angle: -90,
                    position: 'insideLeft',
                    offset: -12,
                    style: axisTitle,
                }}
            />
            <Tooltip
                isAnimationActive={false}
                contentStyle={{
                    backgroundColor: theme.tooltip,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    color: theme.foreground,
                    boxShadow: theme.tooltipShadow,
                }}
                labelStyle={item.type === 'scatter_plot'
                    ? { display: 'none' }
                    : { color: theme.muted, marginBottom: 4 }}
                cursor={{ fill: 'rgba(102, 135, 154, 0.12)' }}
                wrapperStyle={{ outline: 'none' }}
                formatter={(value, _name, entry) => [
                    formatMetricValue(value),
                    entry?.dataKey === 'x' ? xField : yField,
                ]}
                labelFormatter={item.type === 'scatter_plot'
                    ? () => ''
                    : (value) => `${xField}: ${value}`}
            />
        </>
    );

    return (
        <div
            className="live-preview-chart w-full rounded-xl"
            style={{ height, backgroundColor: theme.background, color: theme.foreground }}
        >
            <ResponsiveContainer debounce={50} width="100%" height="100%">
                {item.type === 'line_chart' ? (
                    <LineChart data={chartData} margin={CHART_MARGIN}>
                        {common}
                        <Line
                            type="monotone"
                            dataKey="y"
                            stroke={color}
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                ) : item.type === 'bar_chart' ? (
                    <BarChart data={chartData} margin={CHART_MARGIN}>
                        {common}
                        <Bar
                            dataKey="y"
                            fill={color}
                            radius={[6, 6, 2, 2]}
                            maxBarSize={56}
                            isAnimationActive={false}
                            shape={isMultiColor ? (props) => (
                                <Rectangle
                                    {...props}
                                    fill={getPointColor(props.payload || props, props.index)}
                                />
                            ) : undefined}
                        />
                    </BarChart>
                ) : item.type === 'area_chart' ? (
                    <AreaChart data={chartData} margin={CHART_MARGIN}>
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
                            isAnimationActive={false}
                        />
                    </AreaChart>
                ) : (
                    <ScatterChart margin={CHART_MARGIN}>
                        {common}
                        <Scatter
                            data={chartData}
                            fill={color}
                            isAnimationActive={false}
                            shape={isMultiColor ? (props) => (
                                <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={3}
                                    fill={getPointColor(props.payload || props, props.index)}
                                />
                            ) : undefined}
                        />
                    </ScatterChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default LiveChart;