import {useMemo} from "react";
import {calculateMetric, formatMetricValue} from "../../../services/chartData.js";
import EmptyPreview from "./EmptyPreview.jsx";

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

    const formattedValue = formatMetricValue(value);
    const automaticFontSize = formattedValue.length <= 6
        ? 30
        : formattedValue.length <= 9
            ? 26
            : formattedValue.length <= 12
                ? 22
                : 18;

    return (
        <div
            className="live-preview-metric flex flex-col justify-center px-1"
            style={{
                height,
                color: item.config?.elementTextColor && item.config.elementTextColor !== '#d4d4d8'
                    ? item.config.elementTextColor
                    : theme.foreground,
                fontStyle: item.config?.elementFontStyle || 'normal',
            }}
        >
            {item.config?.title?.trim() && (
                <p className="mb-1 text-xs font-medium" style={{ color: theme.muted }}>
                    {item.config.title}
                </p>
            )}
            <p
                className="text-3xl tracking-tight"
                style={{
                    fontSize: item.config?.elementFontSize && item.config.elementFontSize !== 'auto'
                        ? `${item.config.elementFontSize}px`
                        : `${automaticFontSize}px`,
                    fontWeight: item.config?.elementFontWeight || 600,
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {formattedValue}
            </p>
            {item.config?.description?.trim() && (
                <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                    {item.config.description}
                </p>
            )}
        </div>
    );
};

export default LiveMetric;