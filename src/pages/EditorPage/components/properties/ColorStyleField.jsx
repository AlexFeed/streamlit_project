import {
    chartPalettes,
    getPaletteColors,
} from '../../data/chartPalettes.js';
import { paletteItems } from '../../data/paletteItems.js';

const colorPresets = [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
];

const ColorStyleField = ({
    type,
    config,
    onUpdate,
}) => {
    const supportsPaletteModes = Boolean(
        paletteItems[type]?.supportsPaletteModes
    );
    const colorMode = supportsPaletteModes
        ? config.colorMode || 'solid'
        : 'solid';
    const paletteColors = getPaletteColors(
        config.palette,
        config.reversePalette
    );
    const modeOptions = [
        { value: 'solid', label: 'Один цвет' },
        { value: 'gradient', label: 'По значению' },
        { value: 'categorical', label: 'Категории X' },
    ];

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
            <div className="mb-3">
                <label className="text-sm font-medium text-zinc-200">Цветовая схема</label>
            </div>

            <div className={`mb-4 grid gap-1 rounded-xl bg-zinc-900 p-1 ${
                supportsPaletteModes ? 'grid-cols-3' : 'grid-cols-1'
            }`}>
                {modeOptions
                    .filter((option) => supportsPaletteModes || option.value === 'solid')
                    .map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onUpdate('colorMode', option.value)}
                            className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                                colorMode === option.value
                                    ? 'bg-zinc-700 text-white shadow'
                                    : 'text-zinc-500 hover:text-zinc-200'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
            </div>

            {colorMode === 'solid' ? (
                <>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-zinc-500">Основной цвет</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={config.color || '#3b82f6'}
                                onChange={(event) => onUpdate('color', event.target.value)}
                                className="h-8 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-0.5"
                                aria-label="Выбрать произвольный цвет"
                            />
                            <span className="font-mono text-xs uppercase text-zinc-400">
                                {config.color || '#3b82f6'}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {colorPresets.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => onUpdate('color', color)}
                                className={`aspect-square rounded-lg border-2 transition hover:scale-110 ${
                                    config.color === color ? 'border-white' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Выбрать цвет ${color}`}
                                title={color}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        {chartPalettes.map((palette) => {
                            const colors = config.reversePalette
                                ? [...palette.colors].reverse()
                                : palette.colors;

                            return (
                                <button
                                    key={palette.id}
                                    type="button"
                                    onClick={() => onUpdate('palette', palette.id)}
                                    className={`rounded-xl border p-2 text-left transition ${
                                        (config.palette || 'ocean') === palette.id
                                            ? 'border-blue-400 bg-blue-500/10'
                                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                                    }`}
                                >
                                    <span
                                        className="block h-7 rounded-lg"
                                        style={{
                                            background: `linear-gradient(90deg, ${colors.join(', ')})`,
                                        }}
                                    />
                                    <span className="mt-1.5 block text-xs text-zinc-400">
                                        {palette.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => onUpdate('reversePalette', !config.reversePalette)}
                        className="mt-3 flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-zinc-300 transition hover:border-zinc-700"
                    >
                        <span>Развернуть палитру</span>
                        <span
                            className="h-3 w-20 rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${paletteColors.join(', ')})`,
                            }}
                        />
                    </button>
                </>
            )}
        </div>
    );
};

export default ColorStyleField;
