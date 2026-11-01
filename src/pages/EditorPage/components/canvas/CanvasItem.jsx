import { lazy, memo, Suspense, useRef } from 'react';
import {
    Copy,
    Trash2,
    WalletCards,
    MoveDiagonal2,
} from 'lucide-react';
import { paletteItems } from '../../data/paletteItems';
import { useDroppable } from '@dnd-kit/core';
import { getAppearanceDefaults } from '../../services/componentAppearance.js';

const LiveComponentPreview = lazy(
    () => import('./LiveComponentPreview')
);

const ContainerChild = ({
    child,
    parent,
    rows,
    value,
    onChange,
    onSelect,
    isSelected,
    pages,
    onMove,
    onReorder,
}) => {
    const nodeRef = useRef(null);
    const meta = paletteItems[child.type];
    const appearance = getAppearanceDefaults(child.type, child.config);
    const isLarge = Boolean(meta?.isChart || child.type === 'table');
    const previewHeight = isLarge
        ? Math.max(200, Number(child.layout?.height || 200))
        : 'auto';
    const filterMinimumWidth = ['radio', 'segmented', 'pills'].includes(
        child.config?.widget
    ) ? 140 : 200;
    const minimumWidth = {
        text: 96,
        metric: 180,
        selectbox: filterMinimumWidth,
        page_link: 120,
    }[child.type] || 240;
    const isHorizontal = parent.config?.direction === 'horizontal';
    const shouldStretch = isLarge || appearance.contentWidth === 'stretch';
    const beginChildDrag = (event) => {
        if (event.button !== 0) return;
        const explicitDragSurface = event.target.closest('[data-canvas-drag-surface]');
        if (
            !explicitDragSurface
            && event.target.closest('button, input, select, textarea, a, [data-no-canvas-drag]')
        ) {
            return;
        }

        const sourceNode = nodeRef.current;
        if (!sourceNode) return;
        event.preventDefault();
        event.stopPropagation();

        const sourceRect = sourceNode.getBoundingClientRect();
        const ghostNode = sourceNode.cloneNode(true);
        ghostNode.removeAttribute('data-container-child');
        ghostNode.setAttribute('aria-hidden', 'true');
        ghostNode.classList.add('dashboard-container-child-ghost');
        Object.assign(ghostNode.style, {
            position: 'fixed',
            left: `${sourceRect.left}px`,
            top: `${sourceRect.top}px`,
            width: `${sourceRect.width}px`,
            height: `${sourceRect.height}px`,
        });
        document.body.appendChild(ghostNode);
        sourceNode.classList.add('dashboard-interaction-source');
        const previousUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = 'none';

        const startX = event.clientX;
        const startY = event.clientY;
        let lastX = startX;
        let lastY = startY;
        let didMove = false;
        let insertionTarget = null;

        const handlePointerMove = (moveEvent) => {
            if (moveEvent.pointerId !== event.pointerId) return;
            moveEvent.preventDefault();
            lastX = moveEvent.clientX;
            lastY = moveEvent.clientY;
            didMove = didMove
                || Math.abs(lastX - startX) > 4
                || Math.abs(lastY - startY) > 4;
            ghostNode.style.transform = `translate(${lastX - startX}px, ${lastY - startY}px)`;
            insertionTarget?.classList.remove('dashboard-container-insert-target');
            insertionTarget = document.elementsFromPoint(lastX, lastY)
                .map((node) => node.closest?.('[data-container-child-id]'))
                .find((node) => node?.dataset?.containerChildId !== child.id) || null;
            insertionTarget?.classList.add('dashboard-container-insert-target');
        };

        const finishDrag = (finishEvent) => {
            if (finishEvent.pointerId !== event.pointerId) return;
            lastX = finishEvent.clientX;
            lastY = finishEvent.clientY;
            didMove = didMove
                || Math.abs(lastX - startX) > 4
                || Math.abs(lastY - startY) > 4;
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', finishDrag);
            window.removeEventListener('pointercancel', finishDrag);
            ghostNode.remove();
            sourceNode.classList.remove('dashboard-interaction-source');
            insertionTarget?.classList.remove('dashboard-container-insert-target');
            document.body.style.userSelect = previousUserSelect;
            window.getSelection()?.removeAllRanges();
            if (!didMove) return;

            const elements = document.elementsFromPoint(lastX, lastY);
            const targetGroup = elements
                .map((node) => node.closest?.('[data-layout-group-id]'))
                .find((node) => node?.dataset?.layoutGroupId);
            const targetGroupId = targetGroup?.dataset?.layoutGroupId || null;
            const targetChildId = elements
                .map((node) => node.closest?.('[data-container-child-id]'))
                .find((node) => node?.dataset?.containerChildId !== child.id)
                ?.dataset?.containerChildId;
            if (targetGroupId === parent.id) {
                if (targetChildId) onReorder(child.id, targetChildId);
                return;
            }

            const isOverCanvas = elements.some((node) => (
                node.closest?.('[data-dashboard-canvas]')
            ));
            if (!targetGroupId && !isOverCanvas) return;

            onMove(child.id, targetGroupId, {
                left: sourceRect.left + lastX - startX,
                top: sourceRect.top + lastY - startY,
                width: sourceRect.width,
                height: sourceRect.height,
            }, {
                ...meta,
                minWidth: child.layout?.width || meta?.defaultWidth || meta?.minWidth,
            });
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', finishDrag);
        window.addEventListener('pointercancel', finishDrag);
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    return (
        <div
            ref={nodeRef}
            data-container-child
            data-container-child-id={child.id}
            onPointerDown={beginChildDrag}
            onClick={(event) => {
                event.stopPropagation();
                onSelect(child.id);
            }}
            className={`group/child relative min-w-0 cursor-grab rounded-xl transition active:cursor-grabbing ${
                appearance.showBorder ? 'border border-zinc-700/80' : 'border border-transparent'
            } ${appearance.showBackground ? 'bg-zinc-900/70' : 'bg-transparent'} ${
                isSelected
                    ? 'ring-2 ring-blue-500'
                    : 'ring-1 ring-transparent hover:ring-zinc-700'
            }`}
            style={{
                flex: isHorizontal
                    ? (shouldStretch ? '1 1 0' : '0 1 auto')
                    : '0 0 auto',
                width: isHorizontal
                    ? undefined
                    : (shouldStretch ? '100%' : 'fit-content'),
                maxWidth: '100%',
                minWidth: `min(100%, ${minimumWidth}px)`,
                minHeight: isLarge ? previewHeight : undefined,
                padding: appearance.padding,
            }}
        >
            <LiveComponentPreview
                item={child}
                height={previewHeight}
                rows={rows}
                value={value}
                onChange={onChange}
                pages={pages}
            />
        </div>
    );
};

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
                        pages,
                        children = [],
                        selectedId,
                        isContainerDropTarget = false,
                        onMoveChild,
                        onReorderChild,
                    }) => {
    const meta = paletteItems[item.type];
    const Icon = meta?.icon || WalletCards;
    const isCompact = ['text', 'metric', 'selectbox', 'page_link'].includes(item.type);
    const usesFloatingChrome = isCompact || item.type === 'layout_group';
    const controlsVisibility = item.type === 'layout_group'
        ? (isSelected ? 'opacity-100' : 'pointer-events-none opacity-0')
        : (isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100');
    const appearance = getAppearanceDefaults(item.type, item.config);
    const isAutoHeight = ['text', 'metric', 'selectbox', 'page_link'].includes(item.type)
        && appearance.heightMode === 'auto';
    const isAutoWidth = (
        (isCompact && appearance.contentWidth === 'content')
        || item.type === 'layout_group'
    )
        && !item.layout?.manualWidth;
    const surfaceClass = `${
        appearance.showBorder
            ? 'border-zinc-800'
            : 'border-transparent'
    } ${appearance.showBackground ? 'bg-zinc-900/70' : 'bg-transparent'}`;
    const groupAlignment = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end',
        distribute: 'space-between',
    }[item.config?.horizontalAlignment || 'left'];
    const { setNodeRef, isOver } = useDroppable({
        id: `layout-group-${item.id}`,
        disabled: item.type !== 'layout_group',
        data: {
            source: 'layout-group',
            containerId: item.id,
        },
    });

    return (
        <article
            ref={setNodeRef}
            data-canvas-item
            data-layout-group-id={item.type === 'layout_group' ? item.id : undefined}
            onPointerDown={(event) => {
                const explicitDragSurface = event.target.closest('[data-canvas-drag-surface]');
                if (
                    !explicitDragSurface
                    && event.target.closest('button, input, select, textarea, a, [data-no-canvas-drag], [data-container-child]')
                ) {
                    return;
                }
                onBeginInteraction(event, item.id, 'drag');
            }}
            onClick={() => onSelect(item.id)}
            className={`group relative flex min-h-0 flex-col rounded-2xl border transition-colors ${
                usesFloatingChrome ? 'overflow-visible' : 'overflow-hidden'
            } ${
                isAutoHeight ? 'h-auto' : 'h-full'
            } ${
                isAutoWidth ? 'w-fit max-w-full' : 'w-full'
            } ${
                isSelected
                    ? 'border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_20px_50px_rgba(0,0,0,0.22)]'
                    : `${surfaceClass} hover:border-zinc-600`
            } ${isOver || isContainerDropTarget ? 'border-blue-400 bg-blue-500/10 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.55)]' : ''}`}
        >
            {usesFloatingChrome && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
                >
                    {[
                        'inset-x-0 top-0 h-2 cursor-grab',
                        'inset-x-0 bottom-0 h-2 cursor-grab',
                        'inset-y-2 left-0 w-2 cursor-grab',
                        'inset-y-2 right-0 w-2 cursor-grab',
                    ].map((edgeClass) => (
                        <div
                            key={edgeClass}
                            className={`pointer-events-auto absolute ${edgeClass} active:cursor-grabbing`}
                            onPointerDown={(event) => {
                                event.stopPropagation();
                                onBeginInteraction(event, item.id, 'drag');
                            }}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSelect(item.id);
                            }}
                        />
                    ))}
                </div>
            )}
            <header
                className={usesFloatingChrome
                    ? `absolute bottom-full right-0 z-30 mb-1 flex touch-none items-center rounded-xl border border-zinc-700/70 bg-zinc-950/95 p-0.5 shadow-lg backdrop-blur transition-opacity ${controlsVisibility}`
                    : 'canvas-drag-handle flex shrink-0 touch-none cursor-grab items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3 active:cursor-grabbing'}
                onPointerDown={usesFloatingChrome
                    ? undefined
                    : (event) => onBeginInteraction(event, item.id, 'drag')}
                title={usesFloatingChrome ? undefined : 'Зажмите и перетащите карточку'}
            >
                {!usesFloatingChrome && (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl border border-zinc-700/80 bg-zinc-800 p-2">
                        <Icon className="h-4 w-4 text-blue-300" />
                    </div>
                    <h3 className="truncate text-sm font-semibold text-white">
                        {item.config?.title || meta?.label}
                    </h3>
                </div>
                )}

                <div className={`flex shrink-0 items-center gap-0.5 transition-opacity ${controlsVisibility}`}>
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
                </div>
            </header>

            <div
                className="flex min-h-0 flex-1"
                style={{
                    padding: item.type === 'layout_group'
                        ? 0
                        : appearance.padding,
                    paddingInline: item.type === 'text' && appearance.showBorder
                        ? Math.max(Number(appearance.padding || 0), 4)
                        : undefined,
                    justifyContent: {
                        left: 'flex-start',
                        center: 'center',
                        right: 'flex-end',
                    }[appearance.contentAlignment],
                    alignItems: {
                        top: 'flex-start',
                        center: 'center',
                        bottom: 'flex-end',
                    }[isAutoHeight ? 'top' : appearance.verticalAlignment],
                    color: appearance.elementTextColor,
                    fontSize: appearance.elementFontSize === 'auto'
                        ? undefined
                        : `${appearance.elementFontSize}px`,
                    fontWeight: appearance.elementFontWeight,
                    fontStyle: appearance.elementFontStyle,
                }}
            >
                <Suspense
                    fallback={(
                        <div className="h-full animate-pulse rounded-xl bg-zinc-800/60" />
                    )}
                >
                    {item.type === 'layout_group' ? (
                        <div
                            data-layout-group-id={item.id}
                            data-layout-group-direction={item.config?.direction || 'vertical'}
                            className="relative flex h-full min-h-0 overflow-x-hidden overflow-y-auto rounded-xl"
                            style={{
                                flexDirection: item.config?.direction === 'horizontal' ? 'row' : 'column',
                                gap: Number(item.config?.gap ?? 8),
                                padding: Number(item.config?.padding ?? 8),
                                paddingTop: Number(item.config?.padding ?? 8)
                                    + (item.config?.title?.trim() ? 24 : 0),
                                alignItems: item.config?.direction === 'horizontal'
                                    ? 'stretch'
                                    : groupAlignment,
                                justifyContent: item.config?.direction === 'horizontal'
                                    ? groupAlignment
                                    : 'flex-start',
                                flexWrap: item.config?.wrap === false ? 'nowrap' : 'wrap',
                            }}
                        >
                            {item.config?.title?.trim() && (
                                <div
                                    className="pointer-events-none absolute left-2 top-1 truncate text-xs font-semibold text-zinc-400"
                                    style={{ maxWidth: 'calc(100% - 52px)' }}
                                >
                                    {item.config.title}
                                </div>
                            )}
                            {children.length === 0 ? (
                                <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-zinc-700/70 px-4 text-center text-xs text-zinc-500">
                                    Выберите контейнер в свойстве «Расположение» у элемента
                                </div>
                            ) : children.map(({ item: child, rows: childRows, filterValue: childValue }) => (
                                <ContainerChild
                                    key={child.id}
                                    child={child}
                                    parent={item}
                                    rows={childRows}
                                    value={childValue}
                                    onChange={(value) => onFilterChange(child.id, value)}
                                    onSelect={onSelect}
                                    isSelected={selectedId === child.id}
                                    pages={pages}
                                    onMove={onMoveChild}
                                    onReorder={onReorderChild}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className="min-w-0"
                            style={{
                                width: appearance.contentWidth === 'stretch'
                                    ? '100%'
                                    : 'fit-content',
                                height: isAutoHeight ? 'auto' : '100%',
                                maxWidth: '100%',
                            }}
                        >
                            <LiveComponentPreview
                                item={item}
                                height={isAutoHeight ? 'auto' : '100%'}
                                rows={rows}
                                value={filterValue}
                                onChange={(value) => onFilterChange(item.id, value)}
                                pages={pages}
                            />
                        </div>
                    )}
                </Suspense>
            </div>

            <button
                type="button"
                aria-label="Изменить размер карточки"
                title="Тяните, чтобы изменить ширину и высоту"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => onBeginInteraction(event, item.id, 'resize')}
                className={`canvas-resize-handle absolute z-20 flex touch-none cursor-se-resize items-end justify-end rounded-xl text-blue-300 transition hover:bg-blue-500/15 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    isCompact
                        ? `-bottom-3 -right-3 h-7 w-7 p-1.5 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`
                        : 'bottom-1 right-1 h-9 w-9 p-2'
                }`}
            >
                <MoveDiagonal2 className="h-4 w-4" />
            </button>
        </article>
    );
};

export default memo(CanvasItem);
