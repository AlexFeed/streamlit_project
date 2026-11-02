export const chartPalettes = [
    {
        id: 'ocean',
        name: 'Ocean',
        colors: ['#3478c8', '#4e78c7', '#7567c9', '#9b62b5'],
    },
    {
        id: 'sunset',
        name: 'Sunset',
        colors: ['#d99a2b', '#e8793b', '#d65f59', '#bc587f'],
    },
    {
        id: 'forest',
        name: 'Forest',
        colors: ['#829c3d', '#398b67', '#2f927a', '#277c70'],
    },
    {
        id: 'berry',
        name: 'Berry',
        colors: ['#c94f8a', '#b94f9a', '#9859b8', '#7656c8'],
    },
    {
        id: 'ice',
        name: 'Ice',
        colors: ['#49aeb8', '#369bb4', '#3486b8', '#3478c8'],
    },
    {
        id: 'mono',
        name: 'Mono',
        colors: ['#b7aaa0', '#978c85', '#786f69', '#5c5550'],
    },
];

export const defaultPaletteId = 'ocean';

const legacyDefaultChartColors = {
    line_chart: { '#60a5fa': '#3478c8', '#66879a': '#3478c8' },
    bar_chart: { '#3b82f6': '#3478c8', '#66879a': '#3478c8' },
    area_chart: { '#818cf8': '#c94f8a', '#b77f91': '#c94f8a' },
    scatter_plot: { '#38bdf8': '#2f91a0', '#718fa1': '#2f91a0' },
};

export const getChartColor = (type, color) => (
    legacyDefaultChartColors[type]?.[color] || color
);

export const getPaletteColors = (
    paletteId = defaultPaletteId,
    reverse = false
) => {
    const palette = chartPalettes.find((item) => item.id === paletteId)
        || chartPalettes[0];
    const colors = [...palette.colors];

    return reverse ? colors.reverse() : colors;
};

const hexToRgb = (hex) => {
    const value = hex.replace('#', '');
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
};

const rgbToHex = ({ r, g, b }) => {
    const channel = (value) => Math.round(value)
        .toString(16)
        .padStart(2, '0');

    return `#${channel(r)}${channel(g)}${channel(b)}`;
};

export const interpolatePaletteColor = (
    value,
    min,
    max,
    colors
) => {
    if (!colors?.length) return '#3478c8';
    if (colors.length === 1 || min === max) return colors[0];

    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const position = normalized * (colors.length - 1);
    const leftIndex = Math.floor(position);
    const rightIndex = Math.min(colors.length - 1, leftIndex + 1);
    const progress = position - leftIndex;
    const left = hexToRgb(colors[leftIndex]);
    const right = hexToRgb(colors[rightIndex]);

    return rgbToHex({
        r: left.r + (right.r - left.r) * progress,
        g: left.g + (right.g - left.g) * progress,
        b: left.b + (right.b - left.b) * progress,
    });
};
