const EditorHeader = ({ onClearCanvas, onGenerateDashboard }) => {
    return (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-4">
            <h1 className="text-sm font-semibold text-white my-3">Streamlit Constructor</h1>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onGenerateDashboard}
                    className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                >
                    Generate
                </button>

                <button
                    type="button"
                    onClick={onClearCanvas}
                    className="rounded-xl text-sm border border-red-500/40 bg-red-500/10 px-4 py-2 font-medium text-red-300 transition hover:bg-red-500/20"
                >
                    Очистить холст
                </button>
            </div>
        </div>
    );
};

export default EditorHeader;