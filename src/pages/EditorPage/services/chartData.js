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

            const numbers = values
                .map(numericValue)
                .filter((value) => value != null);

            if (!numbers.length) return null;

            const sum = numbers.reduce((total, value) => total + value, 0);
            const aggregatedValues = {
                sum,
                mean: sum / numbers.length,
                min: Math.min(...numbers),
                max: Math.max(...numbers),
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

    return chartData;
};

export const calculateMetric = (rows, item) => {
    const field = item.bindings?.valueField;
    const aggregation = item.config?.aggregation || 'sum';

    if (!field) return null;

    if (aggregation === 'count') {
        return rows.filter((row) => row[field] != null).length;
    }

    const numbers = rows
        .map((row) => numericValue(row[field]))
        .filter((value) => value != null);

    if (!numbers.length) return null;

    const sum = numbers.reduce((total, value) => total + value, 0);
    const values = {
        sum,
        mean: sum / numbers.length,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
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
