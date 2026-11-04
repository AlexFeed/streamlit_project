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
    getChartColor,
    getPaletteColors,
    interpolatePaletteColor,
} from '../../data/chartPalettes.js';
import {
    calculateMetric,
    formatMetricValue,
    prepareChartData,
} from '../../services/chartData';
import { paletteItems } from '../../data/paletteItems.js';
import useTranslation from '../../../../shared/i18n/useTranslation.js';
import useTheme from '../../../../shared/useTheme.js';

const previewThemes = {
    light: {
        background: '#fbf7f0',
        foreground: '#342f2b',
        muted: '#766d66',
        border: '#dfd4c8',
        grid: '#e7ddd2',
        tooltip: 'rgba(255, 252, 247, 0.97)',
        tooltipShadow: '0 12px 30px rgba(93, 65, 54, 0.14)',
    },
    dark: {
        background: '#181614',
        foreground: '#e5ddd8',
        muted: '#b2a49d',
        border: '#39332e',
        grid: '#332f2c',
        tooltip: 'rgba(31, 28, 26, 0.97)',
        tooltipShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
    },
};

const EmptyPreview = ({ children, height = 240, theme }) => (
    <div
        className="live-preview-empty flex items-center justify-center rounded-xl border border-dashed px-6 text-center"
        style={{
            height,
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.muted,
        }}
    >
        <p className="max-w-xs text-sm leading-6">{children}</p>
    </div>
);

const LiveChart = ({ item, rows, height, t, theme }) => {
    const chartData = useMemo(
        () => prepareChartData(rows, item),
        [rows, item]
    );
    const xField = item.bindings?.xField;
    const yField = item.bindings?.yField;
    const configuredColor = item.config?.color;
    const color = getChartColor(item.type, configuredColor)
        || '#3478c8';
    const colorMode = item.config?.colorMode || 'solid';
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

    if (!xField || !yField) {
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
                axisLine={{ stroke: theme.border }}
                minTickGap={24}
                label={{ value: xField, position: 'insideBottom', offset: -5, style: axisTitle }}
            />
            <YAxis
                dataKey={item.type === 'scatter_plot' ? 'y' : undefined}
                type="number"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={46}
                label={{ value: yField, angle: -90, position: 'insideLeft', style: axisTitle }}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: theme.tooltip,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    color: theme.foreground,
                    boxShadow: theme.tooltipShadow,
                }}
                labelStyle={{ color: theme.muted, marginBottom: 4 }}
                cursor={{ fill: 'rgba(102, 135, 154, 0.12)' }}
                wrapperStyle={{ outline: 'none' }}
                formatter={(value) => [
                    formatMetricValue(value),
                    yField,
                ]}
                labelFormatter={(value) => `${xField}: ${value}`}
            />
        </>
    );

    return (
        <div
            className="live-preview-chart w-full rounded-xl"
            style={{ height, backgroundColor: theme.background, color: theme.foreground }}
        >
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

const LiveMetric = ({ item, rows, height, t, theme }) => {
    const value = useMemo(
        () => calculateMetric(rows, item),
        [rows, item]
    );

    if (!item.bindings?.valueField) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.metricNeedField')}
            </EmptyPreview>
        );
    }

    return (
        <div
            className="live-preview-metric flex flex-col justify-center px-2 py-1"
            style={{
                height,
                color: item.config?.elementTextColor && item.config.elementTextColor !== '#d4d4d8'
                    ? item.config.elementTextColor
                    : theme.foreground,
                fontStyle: item.config?.elementFontStyle || 'normal',
            }}
        >
            <p className="mb-1 text-xs font-medium" style={{ color: theme.muted }}>
                {item.config?.title || t(paletteItems.metric.labelKey)}
            </p>
            <p
                className="text-3xl tracking-tight"
                style={{
                    fontSize: item.config?.elementFontSize && item.config.elementFontSize !== 'auto'
                        ? `${item.config.elementFontSize}px`
                        : undefined,
                    fontWeight: item.config?.elementFontWeight || 600,
                }}
            >
                {formatMetricValue(value)}
            </p>
            {item.config?.description?.trim() && (
                <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                    {item.config.description}
                </p>
            )}
        </div>
    );
};

const LiveText = ({ item, height, t, theme }) => {
    const content = item.config?.content?.trim()
        || (item.config?.contentKey ? t(item.config.contentKey) : '');

    if (!content) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.textNeedContent')}
            </EmptyPreview>
        );
    }

    return (
        <div
            className="live-preview-text overflow-auto whitespace-pre-wrap text-sm leading-6"
            style={{
                height,
                fontSize: `${item.config?.fontSize || 16}px`,
                fontWeight: item.config?.fontWeight || 'normal',
                fontStyle: item.config?.fontStyle || 'normal',
                color: item.config?.color && item.config.color !== '#d4d4d8'
                    ? item.config.color
                    : theme.foreground,
                textAlign: item.config?.textAlign || 'left',
            }}
        >
            {item.config?.title && (
                <div className="mb-1 text-xs font-semibold not-italic" style={{ color: theme.muted }}>
                    {item.config.title}
                </div>
            )}
            <div>{content}</div>
        </div>
    );
};

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
        )).sort((left, right) => left.localeCompare(right, language, { numeric: true }));
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
    const allOptions = [{ label: t('editor.allValues'), value: '' }, ...options.map((option) => ({ label: option, value: option }))];

    const control = widget === 'radio' ? (
        <div className="live-preview-options">
            {allOptions.map((option) => (
                <label key={option.value || 'all'} className="live-preview-radio">
                    <input type="radio" checked={singleValue === option.value} onChange={() => onChange(option.value)} onClick={(event) => event.stopPropagation()} />
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
                    onClick={(event) => { event.stopPropagation(); onChange(option.value); }}
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
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.foreground }}
        >
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
    ) : (
        <select
            value={singleValue}
            onChange={(event) => onChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            className="live-preview-select w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.foreground }}
        >
            {allOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
        </select>
    );

    return (
        <div
            className="live-preview-filter flex flex-col justify-center"
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
                <label className="mb-1.5 text-xs font-medium" style={{ color: theme.muted }}>
                    {item.config.title}
                </label>
            )}
            {control}
        </div>
    );
};

const LivePageLink = ({ item, pages, height, t, theme }) => {
    const target = pages?.find((page) => page.id === item.config?.targetPageId);
    const label = item.config?.title || t('editor.pageLinkDefault');
    const isLink = item.config?.displayStyle === 'link';

    return (
        <div data-canvas-drag-surface className="live-preview-page-link" style={{ height }}>
            <span
                className={isLink ? 'live-preview-page-link-text' : 'live-preview-page-link-button'}
                style={{
                    color: isLink && item.config?.elementTextColor && item.config.elementTextColor !== '#d4d4d8'
                        ? item.config.elementTextColor
                        : undefined,
                    fontSize: item.config?.elementFontSize && item.config.elementFontSize !== 'auto'
                        ? `${item.config.elementFontSize}px`
                        : undefined,
                    fontWeight: item.config?.elementFontWeight || undefined,
                    fontStyle: item.config?.elementFontStyle || undefined,
                }}
            >
                {label}
            </span>
            {!target && <span className="live-preview-page-link-warning" style={{ color: theme.muted }}>{t('editor.choosePage')}</span>}
        </div>
    );
};

const LiveTable = ({ item, rows, height, t, theme }) => {
    const selectedColumns = item.bindings?.columns || [];
    const availableColumns = rows[0] ? Object.keys(rows[0]) : [];
    const columns = selectedColumns.length > 0
        ? selectedColumns.filter((column) => availableColumns.includes(column))
        : availableColumns;
    const visibleRows = rows.slice(0, item.config?.rowLimit || 50);

    if (!columns.length) return <EmptyPreview height={height} theme={theme}>{t('editor.tableNoData')}</EmptyPreview>;

    return (
        <div className="live-preview-table-wrap" style={{ height, borderColor: theme.border, backgroundColor: theme.background }}>
            <table className="live-preview-table">
                <thead style={{ backgroundColor: theme.background, color: theme.foreground }}>
                    <tr>{columns.map((column) => <th key={column} style={{ borderColor: theme.border }}>{column}</th>)}</tr>
                </thead>
                <tbody>
                    {visibleRows.map((row, index) => (
                        <tr key={index} style={{ borderColor: theme.border }}>
                            {columns.map((column) => <td key={column} title={String(row[column] ?? '')}>{String(row[column] ?? '')}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const LiveComponentPreview = (props) => {
    const { item, height } = props;
    const { t, language } = useTranslation();
    const { theme: activeTheme } = useTheme();
    const theme = previewThemes[activeTheme] || previewThemes.light;

    if (paletteItems[item.type]?.isChart) {
        return <LiveChart item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'metric') {
        return <LiveMetric item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'text') {
        return <LiveText item={item} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'selectbox') {
        return <LiveFilter {...props} t={t} language={language} theme={theme} />;
    }
    if (item.type === 'page_link') {
        return <LivePageLink item={item} pages={props.pages} height={height} t={t} theme={theme} />;
    }
    if (item.type === 'table') {
        return <LiveTable item={item} rows={props.rows} height={height} t={t} theme={theme} />;
    }

    return <EmptyPreview theme={theme}>{t('editor.unknownComponent')}</EmptyPreview>;
};

export default LiveComponentPreview;
