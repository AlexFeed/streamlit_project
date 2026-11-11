const numericValue = (value) => {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? number : null;
};

const compareValues = (left, right) => {
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }

    return String(left).localeCompare(String(right), 'ru', {
        numeric: true,
        sensitivity: 'base',
    });
};

const evenlySample = (data, limit) => {
    if (data.length <= limit) return data;
    if (limit <= 2) return [data[0], data[data.length - 1]];
    const lastIndex = data.length - 1;
    return Array.from({ length: limit }, (_, index) => (
        data[Math.round(index * lastIndex / (limit - 1))]
    ));
};

const minMaxSample = (data, limit) => {
    if (data.length <= limit) return data;
    const interior = data.slice(1, -1);
    const bucketCount = Math.max(1, Math.floor((limit - 2) / 2));
    const bucketSize = interior.length / bucketCount;
    const sampled = [data[0]];

    for (let bucketIndex = 0; bucketIndex < bucketCount; bucketIndex += 1) {
        const start = Math.floor(bucketIndex * bucketSize);
        const end = Math.min(
            interior.length,
            Math.ceil((bucketIndex + 1) * bucketSize)
        );
        if (start >= end) continue;

        let minimumIndex = start;
        let maximumIndex = start;
        for (let index = start + 1; index < end; index += 1) {
            if (interior[index].y < interior[minimumIndex].y) minimumIndex = index;
            if (interior[index].y > interior[maximumIndex].y) maximumIndex = index;
        }
        [...new Set([minimumIndex, maximumIndex])]
            .sort((left, right) => left - right)
            .forEach((index) => sampled.push(interior[index]));
    }

    sampled.push(data[data.length - 1]);
    return sampled;
};

export const limitChartDataForPreview = (data, chartType) => {
    if (chartType === 'bar_chart') return evenlySample(data, 120);
    if (chartType === 'scatter_plot') return evenlySample(data, 800);
    return minMaxSample(data, 600);
};

export const prepareChartData = (rows, item) => {
    const xField = item.bindings?.xField;
    const yField = item.bindings?.yField;
    const aggregation = item.config?.aggregation || 'none';
    const sort = item.config?.sort || 'none';
    const sortBy = item.config?.sortBy || 'x';

    if (!xField || !yField) return [];

    let chartData;

    if (aggregation === 'none') {
        chartData = rows
            .map((row) => ({
                x: row[xField],
                y: numericValue(row[yField]),
            }))
            .filter((point) => point.x != null && point.y != null);
    } else {
        const groups = new Map();

        rows.forEach((row) => {
            const xValue = row[xField];
            if (xValue == null) return;

            const current = groups.get(xValue) || [];
            current.push(row[yField]);
            groups.set(xValue, current);
        });

        chartData = Array.from(groups, ([x, values]) => {
            if (aggregation === 'count') {
                return {
                    x,
                    y: values.filter((value) => value != null).length,
                };
            }

            let sum = 0;
            let min = Infinity;
            let max = -Infinity;
            let validCount = 0;

            for (let index = 0; index < values.length; index += 1) {
                const numeric = numericValue(values[index]);
                if (numeric != null) {
                    sum += numeric;
                    if (numeric < min) min = numeric;
                    if (numeric > max) max = numeric;
                    validCount += 1;
                }
            }

            if (!validCount) return null;

            const aggregatedValues = {
                sum,
                mean: sum / validCount,
                min,
                max,
            };

            return {
                x,
                y: aggregatedValues[aggregation],
            };
        }).filter(Boolean);
    }

    if (sort !== 'none') {
        chartData.sort((left, right) => {
            const primaryResult = compareValues(
                sortBy === 'y' ? left.y : left.x,
                sortBy === 'y' ? right.y : right.x
            );
            const result = primaryResult || compareValues(left.x, right.x);
            return sort === 'asc' ? result : -result;
        });
    }

    return limitChartDataForPreview(chartData, item.type);
};

export const calculateMetric = (rows, item) => {
    const field = item.bindings?.valueField;
    const aggregation = item.config?.aggregation || 'sum';

    if (!field) return null;

    if (aggregation === 'count') {
        return rows.filter((row) => row[field] != null).length;
    }

    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let validCount = 0;

    for (let index = 0; index < rows.length; index += 1) {
        const numeric = numericValue(rows[index][field]);
        if (numeric != null) {
            sum += numeric;
            if (numeric < min) min = numeric;
            if (numeric > max) max = numeric;
            validCount += 1;
        }
    }

    if (!validCount) return null;

    const values = {
        sum,
        mean: sum / validCount,
        min,
        max,
    };

    return values[aggregation] ?? null;
};

export const formatMetricValue = (value) => {
    if (value == null) return '—';

    return new Intl.NumberFormat('ru-RU', {
        notation: Math.abs(value) >= 100000 ? 'compact' : 'standard',
        maximumFractionDigits: 2,
    }).format(value);
};
