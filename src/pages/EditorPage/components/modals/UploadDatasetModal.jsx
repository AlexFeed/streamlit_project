import {Loader2, X, Upload, FileText, FileSpreadsheet} from "lucide-react";
import { inspectExcelSheets } from "../../../../api/datasetsApi.js";
import {useEffect, useRef, useState} from "react";
import {toast} from "sonner";


const DELIMITER_OPTIONS = [
    {value: 'auto', label: 'Автоопределение (рекомендуется)'},
    {value: ',', label: 'Запятая (,)'},
    {value: ';', label: 'Точка с запятой (;)'},
    {value: '\t', label: 'Таб'},
    {value: '|', label: 'Пайп (|)'},
];

const UploadDatasetModal = ({
                                isOpen,
                                isUploading = false,
                                onClose,
                                onConfirm,
                            }) => {

    const fileInputRef = useRef(null);
    const mouseDownTargetRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [datasetName, setDatasetName] = useState('');
    const [delimiter, setDelimiter] = useState('auto');
    const [sheetName, setSheetName] = useState('');
    const [availableSheets, setAvailableSheets] = useState([]);
    const [isInspectingSheets, setIsInspectingSheets] = useState(false);

    // Сброс формы при закрытии
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setDatasetName('');
            setDelimiter('auto');
            setSheetName('');
            setAvailableSheets([]);
            setIsInspectingSheets(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [isOpen]);

    // Закрытие по Escape
    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !isUploading) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isUploading, onClose]);

    if (!isOpen) return null;

    const isExcelFile = (fileName) => {
        const lower = (fileName || '').toLowerCase();
        return lower.endsWith('.xlsx') || lower.endsWith('.xls');
    };

    const handleFileChange = async (file) => {
        if (!file) return;
        const lowerName = file.name.toLowerCase();
        const validExtensions = ['.csv', '.tsv', '.xlsx', '.xls'];

        const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));
        if (!isValid) {
            toast.error('Поддерживаются только форматы CSV, TSV и Excel (.xlsx, .xls)');
            return;
        }

        setSelectedFile(file);

        // Предзаполняем поле названия изначальным именем файла
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setDatasetName(nameWithoutExt);

        if (isExcelFile(file.name)) {
            // Загрузка всех листов из excel файла
            try {
                setIsInspectingSheets(true);
                const result = await inspectExcelSheets(file);
                const sheets = result?.sheets || [];
                setAvailableSheets(sheets);
                if (sheets.length > 0) setSheetName(sheets[0]);
            } catch (error) {
                toast.error('Ошибка анализа листов Excel');
                console.error('Ошибка анализа листов Excel:', error);
                setAvailableSheets([]);
            } finally {
                setIsInspectingSheets(false);
            }
        } else {
            setAvailableSheets([]);
            setSheetName('');
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        if (isUploading) return;
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            toast.error('Пожалуйста, выберите файл для загрузки.');
            return;
        }
        const trimmedName = datasetName.trim();
        if (!trimmedName) {
            toast.error('Укажите название датасета.');
            return;
        }
        const isExcel = isExcelFile(selectedFile.name);

        const res = await onConfirm({
            file: selectedFile,
            name: trimmedName,
            delimiter: isExcel ? null : delimiter,
            sheetName: isExcel ? sheetName : null,
        });

        // Если файл загрузился, то закрываем модалку
        if (res) onClose();
    };

    const isExcel = selectedFile && isExcelFile(selectedFile.name);


    const hasDotInName = datasetName.includes('.');
    const isNameEmpty = !datasetName.trim();
    // Кнопка блокируется, если файл не выбран, имя пустое, есть точка или идёт загрузка
    const isSubmitDisabled = isUploading || !selectedFile || hasDotInName || isNameEmpty;

    // Проверяем, что файл выбран и для него нужен разделитель
    const isDelimitedFile = Boolean(
        selectedFile && (
            selectedFile.name.toLowerCase().endsWith('.csv') ||
            selectedFile.name.toLowerCase().endsWith('.tsv')
        )
    );



    return (
        <div
            onMouseDown={(e) => {
                // Запоминаем, на каком элементе нажали кнопку мыши
                mouseDownTargetRef.current = e.target;
            }}
            onClick={(e) => {
                if (
                    !isUploading &&
                    e.target === e.currentTarget &&
                    mouseDownTargetRef.current === e.currentTarget
                ) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50"
            >
                {/* Шапка модального окна */}
                <div className="relative text-center">
                    <div className="px-8">
                        <h2 className="text-xl font-semibold text-white">Загрузить данные</h2>
                        <p className="mt-1 text-xs text-zinc-400">
                            Поддерживаются форматы CSV, TSV и Excel (.xlsx, .xls)
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="absolute -right-3 -top-5 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
                    >
                        <X className="h-5 w-5"/>
                    </button>
                </div>
                <div className="mt-5 space-y-4">
                    {/* Дропзона / выбор файла */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
                            selectedFile
                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.tsv,.xlsx,.xls"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(file);
                            }}
                        />
                        {selectedFile ? (
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                                    {isExcel ? (
                                        <FileSpreadsheet className="h-6 w-6"/>
                                    ) : (
                                        <FileText className="h-6 w-6"/>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-white line-clamp-1">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                        {(selectedFile.size / 1024).toFixed(1)} КБ • Нажмите, чтобы выбрать другой
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="rounded-xl bg-zinc-800 p-2.5 text-zinc-300 transition group-hover:bg-zinc-700 group-hover:text-white">
                                    <Upload className="h-5 w-5"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-zinc-200">
                                        Перетащите файл сюда или нажмите для выбора
                                    </p>
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                        .csv, .tsv, .xlsx, .xls
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Поле названия датасета */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                            Название датасета
                        </label>
                        <input
                            type="text"
                            value={datasetName}
                            onChange={(e) => setDatasetName(e.target.value)}
                            disabled={isUploading}
                            placeholder="Например: Продажи за 2024 год"
                            className={`w-full rounded-2xl border bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition ${
                                hasDotInName
                                    ? 'border-red-500/60 focus:border-red-500'
                                    : 'border-zinc-800 focus:border-blue-500'
                            }`}
                        />
                        {hasDotInName && (
                            <p className="mt-1.5 text-xs text-red-400">
                                Название не должно содержать точек и расширений файлов. Расширение будет добавлено автоматически.
                            </p>
                        )}
                    </div>
                    {/* Выбор разделителя: только для CSV и TSV */}
                    {isDelimitedFile && (
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                                Разделитель колонок
                            </label>
                            <select
                                value={delimiter}
                                onChange={(e) => setDelimiter(e.target.value)}
                                disabled={isUploading || !selectedFile}
                                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
                            >
                                {DELIMITER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {/* Выбор листа: только для Excel */}
                    {isExcel && (
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="block text-xs font-medium text-zinc-300">
                                    Загружаемый лист
                                </label>
                                {isInspectingSheets && (
                                    <span className="flex items-center gap-1.5 text-xs text-blue-400">
                                        <Loader2 className="h-3 w-3 animate-spin"/>
                                        Считывание листов…
                                    </span>
                                )}
                            </div>
                            {availableSheets.length > 0 ? (
                                <select
                                    value={sheetName}
                                    onChange={(e) => setSheetName(e.target.value)}
                                    disabled={isUploading || isInspectingSheets}
                                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                                >
                                    {availableSheets.map((sheet) => (
                                        <option key={sheet} value={sheet} className="bg-zinc-900 text-white">
                                            {sheet}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={sheetName}
                                    onChange={(e) => setSheetName(e.target.value)}
                                    disabled={isUploading || isInspectingSheets}
                                    placeholder="Первый лист (по умолчанию)"
                                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                                />
                            )}
                        </div>
                    )}
                </div>
                {/* Кнопки действий */}
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin"/>}
                        {isUploading ? 'Загрузка…' : 'Загрузить датасет'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default UploadDatasetModal;