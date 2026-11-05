import { lazy, memo, Suspense, useEffect, useRef, useState } from 'react';
import { Copy, MoveDiagonal2, Trash2, WalletCards } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { paletteItems } from '../../data/paletteItems';
import { getAppearanceDefaults } from '../../services/componentAppearance.js';
import useTranslation from '../../../../shared/translation/useTranslation.js';
import useTheme from '../../../../shared/useTheme.js';

const LiveComponentPreview = lazy(() => import('./LiveComponentPreview'));

const ContainerChild = ({ child, parent, rows, value, onChange, onSelect, isSelected, pages, onMove, onReorder }) => {
    const nodeRef = useRef(null);
    const meta = paletteItems[child.type];
    const appearance = getAppearanceDefaults(child.type, child.config);
    const isLarge = Boolean(meta?.isChart || child.type === 'table');
    const previewHeight = isLarge ? Math.max(200, Number(child.layout?.height || 200)) : 'auto';
    const minimumWidth = child.type === 'text' ? 96 : child.type === 'metric' ? 132 : child.type === 'page_link' ? 120 : 180;
    const isHorizontal = parent.config?.direction === 'horizontal';
    const shouldStretch = isLarge || appearance.contentWidth === 'stretch';

    const beginChildDrag = (event) => {
        if (event.button !== 0 || event.target.closest('button, input, select, textarea, a, [data-no-canvas-drag]')) return;
        const sourceNode = nodeRef.current;
        if (!sourceNode) return;
        event.preventDefault();
        event.stopPropagation();

        const sourceRect = sourceNode.getBoundingClientRect();
        const ghost = sourceNode.cloneNode(true);
        ghost.removeAttribute('data-container-child');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.classList.add('dashboard-container-child-ghost');
        Object.assign(ghost.style, { position: 'fixed', left: `${sourceRect.left}px`, top: `${sourceRect.top}px`, width: `${sourceRect.width}px`, height: `${sourceRect.height}px` });
        document.body.appendChild(ghost);
        sourceNode.classList.add('dashboard-interaction-source');
        const previousUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = 'none';
        const startX = event.clientX;
        const startY = event.clientY;
        let lastX = startX;
        let lastY = startY;
        let moved = false;
        let insertionTarget = null;

        const move = (moveEvent) => {
            if (moveEvent.pointerId !== event.pointerId) return;
            moveEvent.preventDefault();
            lastX = moveEvent.clientX;
            lastY = moveEvent.clientY;
            moved ||= Math.abs(lastX - startX) > 4 || Math.abs(lastY - startY) > 4;
            ghost.style.transform = `translate(${lastX - startX}px, ${lastY - startY}px)`;
            insertionTarget?.classList.remove('dashboard-container-insert-target');
            insertionTarget = document.elementsFromPoint(lastX, lastY)
                .map((node) => node.closest?.('[data-container-child-id]'))
                .find((node) => node?.dataset?.containerChildId !== child.id) || null;
            insertionTarget?.classList.add('dashboard-container-insert-target');
        };

        const finish = (finishEvent) => {
            if (finishEvent.pointerId !== event.pointerId) return;
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
            ghost.remove();
            sourceNode.classList.remove('dashboard-interaction-source');
            insertionTarget?.classList.remove('dashboard-container-insert-target');
            document.body.style.userSelect = previousUserSelect;
            window.getSelection()?.removeAllRanges();
            if (!moved) return;

            const elements = document.elementsFromPoint(lastX, lastY);
            const targetGroupId = elements
                .map((node) => node.closest?.('[data-layout-group-id]'))
                .find((node) => node?.dataset?.layoutGroupId)?.dataset?.layoutGroupId || null;
            const targetChildId = elements
                .map((node) => node.closest?.('[data-container-child-id]'))
                .find((node) => node?.dataset?.containerChildId !== child.id)?.dataset?.containerChildId;
            if (targetGroupId === parent.id) {
                if (targetChildId) onReorder(child.id, targetChildId);
                return;
            }
            const isOverCanvas = elements.some((node) => node.closest?.('[data-dashboard-canvas]'));
            if (!targetGroupId && !isOverCanvas) return;
            onMove(child.id, targetGroupId, {
                left: sourceRect.left + lastX - startX,
                top: sourceRect.top + lastY - startY,
                width: sourceRect.width,
                height: sourceRect.height,
            }, { ...meta, minWidth: child.layout?.width || meta?.defaultWidth || meta?.minWidth });
        };

        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', finish);
        window.addEventListener('pointercancel', finish);
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    return (
        <div
            ref={nodeRef}
            data-container-child
            data-container-child-id={child.id}
            onPointerDown={beginChildDrag}
            onClick={(event) => { event.stopPropagation(); onSelect(child.id); }}
            className={`dashboard-container-child ${isSelected ? 'is-selected' : ''}`}
            style={{
                flex: isHorizontal ? (shouldStretch ? '1 1 0' : '0 1 auto') : '0 0 auto',
                width: isHorizontal ? undefined : (shouldStretch ? '100%' : 'fit-content'),
                maxWidth: '100%',
                minWidth: `min(100%, ${minimumWidth}px)`,
                minHeight: isLarge ? previewHeight : undefined,
                padding: appearance.padding,
                borderColor: appearance.showBorder ? undefined : 'transparent',
                background: appearance.showBackground ? undefined : 'transparent',
            }}
        >
            <LiveComponentPreview item={child} height={previewHeight} rows={rows} value={value} onChange={onChange} pages={pages} />
        </div>
    );
};

const CanvasItem = ({
    item, isSelected, onSelect, onDelete, onDuplicate, rows, filterValue,
    onFilterChange, onBeginInteraction, pages, children = [], selectedId,
    isContainerDropTarget = false, onMoveChild, onReorderChild,
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [actionsVisible, setActionsVisible] = useState(false);
    const actionsHideTimerRef = useRef(null);
    const meta = paletteItems[item.type];
    const Icon = meta?.icon || WalletCards;
    const isCompact = ['text', 'metric', 'selectbox', 'page_link'].includes(item.type);
    const usesFloatingChrome = isCompact || item.type === 'layout_group';
    const appearance = getAppearanceDefaults(item.type, item.config);
    const isAutoHeight = isCompact && !item.layout?.manualHeight;
    const usesContentHeight = isAutoHeight && ['text', 'page_link'].includes(item.type);
    const groupAlignment = { left: 'flex-start', center: 'center', right: 'flex-end', distribute: 'space-between' }[item.config?.horizontalAlignment || 'left'];
    const { setNodeRef, isOver } = useDroppable({
        id: `layout-group-${item.id}`,
        disabled: item.type !== 'layout_group',
        data: { source: 'layout-group', containerId: item.id },
    });

    const showActions = () => {
        window.clearTimeout(actionsHideTimerRef.current);
        setActionsVisible(true);
    };
    const hideActionsLater = () => {
        window.clearTimeout(actionsHideTimerRef.current);
        actionsHideTimerRef.current = window.setTimeout(
            () => setActionsVisible(false),
            700
        );
    };
    useEffect(() => () => {
        window.clearTimeout(actionsHideTimerRef.current);
    }, []);

    const beginCardDrag = (event) => {
        const explicitSurface = event.target.closest('[data-canvas-drag-surface]');
        if (!explicitSurface && event.target.closest('button, input, select, textarea, a, [data-no-canvas-drag], [data-container-child]')) return;
        onBeginInteraction(event, item.id, 'drag');
    };

    return (
        <article
            ref={setNodeRef}
            data-canvas-item
            data-canvas-theme={theme}
            data-layout-group-id={item.type === 'layout_group' ? item.id : undefined}
            onPointerEnter={showActions}
            onPointerLeave={hideActionsLater}
            onPointerDown={beginCardDrag}
            onClick={() => onSelect(item.id)}
            style={!isSelected && !isOver && !isContainerDropTarget ? {
                borderColor: appearance.showBorder ? undefined : 'transparent',
                background: appearance.showBackground ? undefined : 'transparent',
                boxShadow: appearance.showBorder || appearance.showBackground ? undefined : 'none',
            } : undefined}
            className={`canvas-item-card group relative flex min-h-0 w-full flex-col rounded-2xl border transition-colors ${usesFloatingChrome ? 'overflow-visible' : 'overflow-hidden'} ${usesContentHeight ? 'h-auto' : 'h-full'} ${isSelected ? 'is-selected' : ''} ${isOver || isContainerDropTarget ? 'is-drop-target' : ''}`}
        >
            <header
                className={usesFloatingChrome
                    ? `canvas-item-compact-actions absolute -top-10 right-0 z-30 flex touch-none items-center rounded-xl border p-0.5 shadow-lg backdrop-blur transition-opacity ${isSelected || actionsVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`
                    : 'canvas-item-header canvas-drag-handle flex shrink-0 touch-none cursor-grab items-center justify-between gap-3 border-b px-4 py-3 active:cursor-grabbing'}
                onPointerDown={usesFloatingChrome ? undefined : (event) => onBeginInteraction(event, item.id, 'drag')}
                title={usesFloatingChrome ? undefined : t('editor.dragCard')}
            >
                {!usesFloatingChrome && (
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="canvas-item-icon rounded-xl border p-2"><Icon className="h-4 w-4" /></div>
                        <h3 className="canvas-item-title truncate text-sm font-semibold">{item.config?.title || t(meta?.labelKey || 'editor.componentLabel')}</h3>
                    </div>
                )}
                <div className="flex shrink-0 items-center gap-0.5">
                    <button type="button" title={t('editor.duplicate')} aria-label={t('editor.duplicate')} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDuplicate(item.id); }} className="canvas-item-action rounded-lg p-2 transition"><Copy className="h-4 w-4" /></button>
                    <button type="button" title={t('common.delete')} aria-label={t('common.delete')} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDelete(item.id); }} className="canvas-item-action canvas-item-delete rounded-lg p-2 transition"><Trash2 className="h-4 w-4" /></button>
                </div>
            </header>

            <div
                className="canvas-item-content flex min-h-0 flex-1"
                style={{
                    padding: item.type === 'layout_group' ? 0 : appearance.padding,
                    justifyContent: { left: 'flex-start', center: 'center', right: 'flex-end' }[appearance.contentAlignment],
                    alignItems: { top: 'flex-start', center: 'center', bottom: 'flex-end' }[usesContentHeight ? 'top' : appearance.verticalAlignment],
                    color: appearance.elementTextColor,
                    fontSize: appearance.elementFontSize === 'auto' ? undefined : `${appearance.elementFontSize}px`,
                    fontWeight: appearance.elementFontWeight,
                    fontStyle: appearance.elementFontStyle,
                }}
            >
                <Suspense fallback={<div className="canvas-item-loading h-full animate-pulse rounded-xl" />}>
                    {item.type === 'layout_group' ? (
                        <div
                            data-layout-group-id={item.id}
                            data-layout-group-direction={item.config?.direction || 'vertical'}
                            className="dashboard-layout-group relative flex h-full min-h-0 overflow-auto rounded-xl"
                            style={{
                                flexDirection: item.config?.direction === 'horizontal' ? 'row' : 'column',
                                gap: Number(item.config?.gap ?? 8),
                                padding: Number(item.config?.padding ?? 8),
                                paddingTop: Number(item.config?.padding ?? 8) + (item.config?.title?.trim() ? 24 : 0),
                                alignItems: item.config?.direction === 'horizontal' ? 'stretch' : groupAlignment,
                                justifyContent: item.config?.direction === 'horizontal' ? groupAlignment : 'flex-start',
                                flexWrap: item.config?.wrap === false ? 'nowrap' : 'wrap',
                            }}
                        >
                            {item.config?.title?.trim() && <div className="dashboard-layout-group-title">{item.config.title}</div>}
                            {children.length === 0 ? (
                                <div className="dashboard-layout-group-empty">{t('editor.containerEmpty')}</div>
                            ) : children.map(({ item: child, rows: childRows, filterValue: childValue }) => (
                                <ContainerChild key={child.id} child={child} parent={item} rows={childRows} value={childValue} onChange={(value) => onFilterChange(child.id, value)} onSelect={onSelect} isSelected={selectedId === child.id} pages={pages} onMove={onMoveChild} onReorder={onReorderChild} />
                            ))}
                        </div>
                    ) : (
                        <div className="min-w-0" style={{ width: item.type === 'text' || appearance.contentWidth === 'stretch' ? '100%' : 'fit-content', height: usesContentHeight ? 'auto' : '100%', maxWidth: '100%' }}>
                            <LiveComponentPreview item={item} height={usesContentHeight ? 'auto' : '100%'} rows={rows} value={filterValue} onChange={(value) => onFilterChange(item.id, value)} pages={pages} />
                        </div>
                    )}
                </Suspense>
            </div>

            <button type="button" aria-label={t('editor.resize')} title={t('editor.resizeHint')} onClick={(event) => event.stopPropagation()} onPointerDown={(event) => onBeginInteraction(event, item.id, 'resize')} className={`canvas-resize-handle absolute bottom-1 right-1 z-20 flex touch-none cursor-se-resize items-end justify-end rounded-xl p-2 text-blue-300 transition hover:bg-blue-500/15 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isCompact ? `h-8 w-8 ${isSelected ? 'opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'}` : 'h-9 w-9'}`}>
                <MoveDiagonal2 className="h-4 w-4" />
            </button>
        </article>
    );
};

export default memo(CanvasItem);
