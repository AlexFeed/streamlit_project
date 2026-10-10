export const chartPalettes = [
    {
        id: 'ocean',
        name: 'Ocean',
        colors: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'],
    },
    {
        id: 'sunset',
        name: 'Sunset',
        colors: ['#fbbf24', '#f97316', '#ef4444', '#db2777'],
    },
    {
        id: 'forest',
        name: 'Forest',
        colors: ['#a3e635', '#22c55e', '#10b981', '#0f766e'],
    },
    {
        id: 'berry',
        name: 'Berry',
        colors: ['#f472b6', '#ec4899', '#a855f7', '#6366f1'],
    },
    {
        id: 'ice',
        name: 'Ice',
        colors: ['#cffafe', '#67e8f9', '#22d3ee', '#0284c7'],
    },
    {
        id: 'mono',
        name: 'Mono',
        colors: ['#e4e4e7', '#a1a1aa', '#71717a', '#3f3f46'],
    },
];

export const defaultPaletteId = 'ocean';

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
    if (!colors?.length) return '#3b82f6';
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
