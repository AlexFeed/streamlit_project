import { BarChart3, ChevronDownSquare, LineChart, Trash2, WalletCards } from 'lucide-react';

const iconByType = {
    selectbox: ChevronDownSquare,
    line_chart: LineChart,
    bar_chart: BarChart3,
    metric: WalletCards,
};

const CanvasItem = ({ item, isSelected, onSelect, onDelete }) => {
    const Icon = iconByType[item.type] || WalletCards;

    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`group cursor-pointer rounded-2xl border p-4 transition ${
                isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800'
            }`}
        >
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-zinc-800 p-2">
                        <Icon className="h-5 w-5 text-zinc-200" />
                    </div>

                    <div>
                        <h3 className="font-medium text-white">{item.props.title || item.type}</h3>
                        <p className="text-xs uppercase tracking-wide text-zinc-400">{item.type}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-1 text-sm text-zinc-400">
                {item.type === 'selectbox' && (
                    <>
                        <p>Поле: {item.props.field || 'не выбрано'}</p>
                        <p>Placeholder: {item.props.placeholder || '—'}</p>
                    </>
                )}

                {item.type === 'line_chart' && (
                    <>
                        <p>X: {item.props.xField || 'не выбрано'}</p>
                        <p>Y: {item.props.yField || 'не выбрано'}</p>
                    </>
                )}

                {item.type === 'bar_chart' && (
                    <>
                        <p>X: {item.props.xField || 'не выбрано'}</p>
                        <p>Y: {item.props.yField || 'не выбрано'}</p>
                    </>
                )}

                {item.type === 'metric' && (
                    <>
                        <p>Поле значения: {item.props.valueField || 'не выбрано'}</p>
                        <p>Описание: {item.props.description || '—'}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default CanvasItem;