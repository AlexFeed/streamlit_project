import { lazy, Suspense } from 'react';
import {
    Copy,
    GripVertical,
    Trash2,
    WalletCards,
    MoveDiagonal2,
} from 'lucide-react';
import { getComponentMeta } from '../../data/paletteItems';

const LiveComponentPreview = lazy(
    () => import('./LiveComponentPreview')
);

const CanvasItem = ({
                        item,
                        isSelected,
                        onSelect,
                        onDelete,
                        onDuplicate,
                        rows,
                        filterValue,
                        onFilterChange,
                        onDragPointerDown,
                        onResizePointerDown,
                    }) => {
    const meta = getComponentMeta(item.type);
    const Icon = meta?.icon || WalletCards;

    return (
        <article
            data-canvas-item
            onClick={() => onSelect(item.id)}
            className={`group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border transition-colors ${
                isSelected
                    ? 'border-blue-500 bg-zinc-900 shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_20px_50px_rgba(0,0,0,0.22)]'
                    : 'border-zinc-800 bg-zinc-900/95 hover:border-zinc-700'
            }`}
        >
            <header
                className="canvas-drag-handle flex shrink-0 touch-none cursor-grab items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3 active:cursor-grabbing"
                onPointerDown={onDragPointerDown}
                title="Зажмите и перетащите карточку"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-800 p-2">
                        <Icon className="h-4 w-4 text-blue-300" />
                    </div>
                    <h3 className="truncate text-sm font-semibold text-white">
                        {item.config?.title || meta?.label}
                    </h3>
                </div>

                <div className={`flex shrink-0 items-center gap-0.5 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                    <button
                        type="button"
                        title="Дублировать"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDuplicate(item.id);
                        }}
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        title="Удалить"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(item.id);
                        }}
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <span
                        title="Перетащить"
                        className="rounded-lg p-2 text-zinc-500"
                    >
                        <GripVertical className="h-4 w-4" />
                    </span>
                </div>
            </header>

            <div className="min-h-0 flex-1 p-4">
                <Suspense
                    fallback={(
                        <div className="h-full animate-pulse rounded-xl bg-zinc-800/60" />
                    )}
                >
                    <LiveComponentPreview
                        item={item}
                        height="100%"
                        rows={rows}
                        value={filterValue}
                        onChange={onFilterChange}
                    />
                </Suspense>
            </div>

            <button
                type="button"
                aria-label="Изменить размер карточки"
                title="Тяните, чтобы изменить ширину и высоту"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={onResizePointerDown}
                className="canvas-resize-handle absolute bottom-1 right-1 z-20 flex h-9 w-9 touch-none cursor-se-resize items-end justify-end rounded-xl p-2 text-blue-300 transition hover:bg-blue-500/15 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
                <MoveDiagonal2 className="h-4 w-4" />
            </button>
        </article>
    );
};

export default CanvasItem;
