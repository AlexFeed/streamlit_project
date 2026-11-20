import {useMemo} from "react";
import {calculateMetric, formatMetricValue} from "../../../services/chartData.js";
import EmptyPreview from "./EmptyPreview.jsx";

const LiveProgress = ({ item, rows, height, t, theme }) => {
    const value = useMemo(() => calculateMetric(rows, item), [rows, item]);
    if (!item.bindings?.valueField) return <EmptyPreview height={height} theme={theme}>{t('editor.metricNeedField')}</EmptyPreview>;
    const minimum = Number(item.config?.minimum ?? 0);
    const maximum = Number(item.config?.maximum ?? 100);
    const ratio = maximum > minimum && Number.isFinite(value)
        ? Math.max(0, Math.min(1, (value - minimum) / (maximum - minimum)))
        : 0;
    return (
        <div className="flex w-full flex-col justify-center gap-2" style={{ height }}>
            {item.config?.title && <div className="text-xs" style={{ color: theme.muted }}>{item.config.title}</div>}
            <div className="h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.grid }}>
                <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, backgroundColor: item.config?.color || '#10b981' }} />
            </div>
            {item.config?.showValue !== false && <div className="text-xs" style={{ color: theme.muted }}>{formatMetricValue(value)}</div>}
        </div>
    );
};

export default LiveProgress;