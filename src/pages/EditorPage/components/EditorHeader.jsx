const EditorHeader = ({
                          onClearCanvas,
                          onGenerateDashboard,
                          onFileUpload,
                          datasetMeta,
                          onClearDataset,
                          isDatasetUploading,
                          isDatasetClearing,
                          isGenerating,
                      }) => {
    return (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-4">
            <h1 className="text-sm font-semibold text-white my-3">Streamlit Constructor</h1>

            <div className="flex items-center gap-3">
                <label className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800">
                    {isDatasetUploading ? 'Uploading...' : 'Upload CSV'}
                    <input
                        type="file"
                        accept=".csv"
                        onChange={onFileUpload}
                        className="hidden"
                        disabled={isDatasetUploading}
                    />
                </label>

                {datasetMeta && (
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                        <span className="max-w-[180px] truncate">{datasetMeta.name}</span>

                        <button
                            type="button"
                            onClick={onClearDataset}
                            disabled={isDatasetClearing}
                            className="text-zinc-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Удалить датасет"
                        >
                            ×
                        </button>
                    </div>
                )}


                <button
                    type="button"
                    onClick={onGenerateDashboard}
                    disabled={isGenerating}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        isGenerating
                            ? 'cursor-not-allowed border border-blue-500/20 bg-blue-500/5 text-blue-200/60'
                            : 'border border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20'
                    }`}
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
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