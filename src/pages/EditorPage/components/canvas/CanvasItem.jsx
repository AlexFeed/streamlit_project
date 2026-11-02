import { lazy, memo, Suspense } from 'react';
import {
    Copy,
    GripVertical,
    Trash2,
    WalletCards,
    MoveDiagonal2,
} from 'lucide-react';
import { paletteItems } from '../../data/paletteItems';
import useTranslation from '../../../../shared/i18n/useTranslation.js';
import useTheme from '../../../../shared/useTheme.js';

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
                        onBeginInteraction,
                    }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const meta = paletteItems[item.type];
    const Icon = meta?.icon || WalletCards;
    const isCompact = ['text', 'metric', 'selectbox'].includes(item.type);

    return (
        <article
            data-canvas-item
            data-canvas-theme={theme}
            onClick={() => onSelect(item.id)}
            className={`canvas-item-card group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border transition-colors ${
                isSelected ? 'is-selected' : ''
            }`}
        >
            <header
                className={isCompact
                    ? `canvas-item-compact-actions absolute right-1 top-1 z-30 flex touch-none items-center rounded-xl border p-0.5 shadow-lg backdrop-blur transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`
                    : 'canvas-item-header canvas-drag-handle flex shrink-0 touch-none cursor-grab items-center justify-between gap-3 border-b px-4 py-3 active:cursor-grabbing'}
                onPointerDown={isCompact
                    ? undefined
                    : (event) => onBeginInteraction(event, item.id, 'drag')}
                title={isCompact ? undefined : t('editor.dragCard')}
            >
                {!isCompact && (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="canvas-item-icon rounded-xl border p-2">
                        <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="canvas-item-title truncate text-sm font-semibold">
                        {item.config?.title || t(meta?.labelKey || 'editor.componentLabel')}
                    </h3>
                </div>
                )}

                <div className={`flex shrink-0 items-center gap-0.5 transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                    <button
                        type="button"
                        title={t('editor.duplicate')}
                        aria-label={t('editor.duplicate')}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDuplicate(item.id);
                        }}
                        className="canvas-item-action rounded-lg p-2 transition"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(item.id);
                        }}
                        className="canvas-item-action canvas-item-delete rounded-lg p-2 transition"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <span
                        title={t('editor.drag')}
                        onPointerDown={isCompact
                            ? (event) => onBeginInteraction(event, item.id, 'drag')
                            : undefined}
                        className={`canvas-item-action rounded-lg p-2 ${
                            isCompact ? 'canvas-drag-handle cursor-grab active:cursor-grabbing' : ''
                        }`}
                    >
                        <GripVertical className="h-4 w-4" />
                    </span>
                </div>
            </header>

            <div className={`min-h-0 flex-1 ${isCompact ? 'p-2' : 'p-4'}`}>
                <Suspense
                    fallback={(
                        <div className="canvas-item-loading h-full animate-pulse rounded-xl" />
                    )}
                >
                    <LiveComponentPreview
                        item={item}
                        height="100%"
                        rows={rows}
                        value={filterValue}
                        onChange={(value) => onFilterChange(item.id, value)}
                    />
                </Suspense>
            </div>

            <button
                type="button"
                aria-label={t('editor.resize')}
                title={t('editor.resizeHint')}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => onBeginInteraction(event, item.id, 'resize')}
                className="canvas-resize-handle absolute bottom-1 right-1 z-20 flex h-9 w-9 touch-none cursor-se-resize items-end justify-end rounded-xl p-2 text-blue-300 transition hover:bg-blue-500/15 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
                <MoveDiagonal2 className="h-4 w-4" />
            </button>
        </article>
    );
};

export default memo(CanvasItem);
