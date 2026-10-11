import {
    GripVertical,
    LayoutDashboard,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { PALETTE_GROUPS, paletteItems } from '../data/paletteItems';

const PaletteItem = ({ item, onAddComponent }) => {
    const Icon = item.icon || LayoutDashboard;
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
    } = useDraggable({
        id: `palette:${item.type}`,
        data: {
            source: 'palette',
            paletteItem: item,
        },
    });

    return (
        <button
            ref={setNodeRef}
            type="button"
            onClick={() => onAddComponent(item)}
            className={`group w-full touch-none rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900 ${
                isDragging ? 'opacity-40' : ''
            }`}
            {...listeners}
            {...attributes}
        >
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accentClass || ''}`}>
                    <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 self-center">
                    <span className="truncate text-sm font-medium text-zinc-100">
                        {item.label}
                    </span>
                    <GripVertical className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:text-zinc-400" />
                </div>
            </div>
        </button>
    );
};

const ComponentsPalette = ({ onAddComponent, onGoHome }) => (
    <aside className="sticky top-0 flex h-screen flex-col overflow-hidden border-r border-zinc-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_42%),#111113]">
        <div className="border-b border-zinc-800/80 px-4 py-4">
            <button
                type="button"
                onClick={onGoHome}
                className="flex w-full items-center gap-3 rounded-xl text-left transition hover:opacity-85"
                title="На главную (Мои проекты)"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-950/40">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-semibold text-white">Streamlit Builder</h1>
                </div>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-4 px-1">
                <p className="text-sm font-semibold text-zinc-200">Компоненты</p>
            </div>

            <div className="space-y-5">
                {PALETTE_GROUPS.map((groupTitle) => (
                    <section key={groupTitle}>
                        <h2 className="mb-2 px-1 text-xs font-medium text-zinc-500">
                            {groupTitle}
                        </h2>
                        <div className="space-y-2">
                            {Object.values(paletteItems)
                                .filter((item) => item.group === groupTitle)
                                .map((item) => (
                                    <PaletteItem
                                        key={item.type}
                                        item={item}
                                        onAddComponent={onAddComponent}
                                    />
                                ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>

    </aside>
);

export default ComponentsPalette;
