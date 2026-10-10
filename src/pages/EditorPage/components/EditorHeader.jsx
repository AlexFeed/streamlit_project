import {
    Database,
    Download,
    LogOut,
    Save,
    Trash2,
    Upload,
    X,
} from 'lucide-react';

const EditorHeader = ({
                          onClearCanvas,
                          onGenerateDashboard,
                          onFileUpload,
                          datasetMeta,
                          onClearDataset,
                          isDatasetUploading,
                          isDatasetClearing,
                          isGenerating,
                          onSaveProject,
                          onLogout,
                      }) => {
    return (
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/90 px-5 py-3 backdrop-blur-xl">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-semibold text-white">Редактор дашборда</h1>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                        Live
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                {datasetMeta ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                        <Database className="h-4 w-4" />
                        <span className="max-w-[180px] truncate">{datasetMeta.name}</span>
                        <button
                            type="button"
                            onClick={onClearDataset}
                            disabled={isDatasetClearing}
                            className="ml-1 rounded p-0.5 text-emerald-300/60 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                            title="Удалить датасет"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800">
                        <Upload className="h-4 w-4" />
                        {isDatasetUploading ? 'Загрузка…' : 'Загрузить CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            onChange={onFileUpload}
                            className="hidden"
                            disabled={isDatasetUploading}
                        />
                    </label>
                )}

                <div className="mx-1 h-6 w-px bg-zinc-800" />

                <button
                    type="button"
                    onClick={onSaveProject}
                    className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                >
                    <Save className="h-4 w-4" />
                    Сохранить
                </button>

                <button
                    type="button"
                    onClick={onGenerateDashboard}
                    disabled={isGenerating}
                    className="flex items-center gap-2 rounded-xl bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    {isGenerating ? 'Генерация…' : 'Скачать Streamlit'}
                </button>

                <button
                    type="button"
                    onClick={onClearCanvas}
                    className="rounded-xl p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                    title="Очистить холст"
                >
                    <Trash2 className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                    title="Выйти"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
};

export default EditorHeader;
