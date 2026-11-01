import { Pencil, Plus, Trash2 } from 'lucide-react';

const PageTabs = ({
    pages,
    activePageId,
    onSelect,
    onAdd,
    onRename,
    onDelete,
}) => {
    const activePage = pages.find((page) => page.id === activePageId);

    const handleRename = () => {
        if (!activePage) return;
        const title = window.prompt('Название страницы', activePage.title);
        if (title != null) onRename(activePage.id, title);
    };

    const handleDelete = () => {
        if (!activePage || pages.length <= 1) return;
        if (window.confirm(`Удалить страницу «${activePage.title}» и её компоненты?`)) {
            onDelete(activePage.id);
        }
    };

    return (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2">
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {pages.map((page) => (
                    <button
                        key={page.id}
                        type="button"
                        onClick={() => onSelect(page.id)}
                        className={`max-w-56 truncate rounded-xl px-3 py-2 text-sm font-medium transition ${
                            page.id === activePageId
                                ? 'bg-blue-500 text-white'
                                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                        title={page.title}
                    >
                        {page.title}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition hover:border-blue-500 hover:text-blue-300"
                >
                    <Plus className="h-4 w-4" />
                    Страница
                </button>
            </div>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={handleRename}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                    title="Переименовать страницу"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pages.length <= 1}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                    title="Удалить страницу"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default PageTabs;
