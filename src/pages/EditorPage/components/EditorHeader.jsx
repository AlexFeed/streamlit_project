const EditorHeader = ({ onClearCanvas }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-zinc-800 bg-zinc-900 px-4 h-16">
            <div>
                <h1 className="text-sm font-semibold text-white my-3">Streamlit Constructor</h1>
            </div>

            <button
                type="button"
                onClick={onClearCanvas}
                className="rounded-xl text-sm border border-red-500/40 bg-red-500/10 px-4 py-2 font-medium text-red-300 transition hover:bg-red-500/20"
            >
                Очистить холст
            </button>
        </div>
    );
};

export default EditorHeader;