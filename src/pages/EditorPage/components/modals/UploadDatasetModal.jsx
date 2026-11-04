import {Loader2, X, Upload, FileText, FileSpreadsheet} from "lucide-react";
import { inspectExcelSheets } from "../../../../api/datasetsApi.js";
import {useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import useTranslation from "../../../../shared/translation/useTranslation.js";

const DELIMITER_OPTIONS = [
    { value: 'auto', labelKey: 'editor.delimiter.auto' },
    { value: ',', labelKey: 'editor.delimiter.comma' },
    { value: ';', labelKey: 'editor.delimiter.semicolon' },
    { value: '\t', labelKey: 'editor.delimiter.tab' },
    { value: '|', labelKey: 'editor.delimiter.pipe' },
];

const ENCODING_OPTIONS = [
    { value: 'auto', labelKey: 'editor.encoding.auto' },
    // Unicode
    { value: 'utf-8', labelKey: 'editor.encoding.utf8' },
    { value: 'utf-8-sig', labelKey: 'editor.encoding.utf8sig' },
    { value: 'utf-16', labelKey: 'editor.encoding.utf16' },
    { value: 'utf-16-le', labelKey: 'editor.encoding.utf16le' },
    { value: 'utf-16-be', labelKey: 'editor.encoding.utf16be' },
    // Cyrillic
    { value: 'windows-1251', labelKey: 'editor.encoding.cp1251' },
    { value: 'cp866', labelKey: 'editor.encoding.cp866' },
    { value: 'koi8-r', labelKey: 'editor.encoding.koi8r' },
    { value: 'koi8-u', labelKey: 'editor.encoding.koi8u' },
    { value: 'iso-8859-5', labelKey: 'editor.encoding.iso8859_5' },
    { value: 'mac_cyrillic', labelKey: 'editor.encoding.mac_cyrillic' },
    // Western & Central Europe
    { value: 'windows-1252', labelKey: 'editor.encoding.cp1252' },
    { value: 'iso-8859-1', labelKey: 'editor.encoding.iso8859_1' },
    { value: 'iso-8859-15', labelKey: 'editor.encoding.iso8859_15' },
    { value: 'windows-1250', labelKey: 'editor.encoding.windows1250' },
    { value: 'iso-8859-2', labelKey: 'editor.encoding.iso8859_2' },
    // Asia & other regions
    { value: 'shift_jis', labelKey: 'editor.encoding.shift_jis' },
    { value: 'euc-jp', labelKey: 'editor.encoding.euc_jp' },
    { value: 'gb18030', labelKey: 'editor.encoding.gb18030' },
    { value: 'big5', labelKey: 'editor.encoding.big5' },
    { value: 'euc-kr', labelKey: 'editor.encoding.euc_kr' },
    { value: 'windows-1254', labelKey: 'editor.encoding.windows1254' },
    { value: 'windows-1256', labelKey: 'editor.encoding.windows1256' },
];

const UploadDatasetModal = ({
                                isOpen,
                                isUploading = false,
                                onClose,
                                onConfirm,
                            }) => {
    const { t } = useTranslation();

    const fileInputRef = useRef(null);
    const mouseDownTargetRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [datasetName, setDatasetName] = useState('');
    const [delimiter, setDelimiter] = useState('auto');
    const [encoding, setEncoding] = useState('auto');
    const [sheetName, setSheetName] = useState('');
    const [availableSheets, setAvailableSheets] = useState([]);
    const [isInspectingSheets, setIsInspectingSheets] = useState(false);
    const [isDelimiterOpen, setIsDelimiterOpen] = useState(false);
    const [isEncodingOpen, setIsEncodingOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Reset form state when the modal closes.
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setDatasetName('');
            setDelimiter('auto');
            setEncoding('auto');
            setSheetName('');
            setAvailableSheets([]);
            setIsInspectingSheets(false);
            setIsDelimiterOpen(false);
            setIsEncodingOpen(false);
            setIsSheetOpen(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [isOpen]);

    // Allow closing with Escape while idle.
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
            toast.error(t('editor.dataUploadError'));
            return;
        }

        setSelectedFile(file);

        // Prefill the dataset name from the selected file.
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setDatasetName(nameWithoutExt);

        if (isExcelFile(file.name)) {
            // Read available sheets from Excel files.
            try {
                setIsInspectingSheets(true);
                const result = await inspectExcelSheets(file);
                const sheets = result?.sheets || [];
                setAvailableSheets(sheets);
                if (sheets.length > 0) setSheetName(sheets[0]);
            } catch (error) {
                toast.error(t('editor.inspectSheetsError'));
                console.error('Could not inspect Excel sheets:', error);
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
            toast.error(t('editor.chooseFileError'));
            return;
        }
        const trimmedName = datasetName.trim();
        if (!trimmedName) {
            toast.error(t('editor.datasetNameError'));
            return;
        }
        const isExcel = isExcelFile(selectedFile.name);

        const res = await onConfirm({
            file: selectedFile,
            name: trimmedName,
            delimiter: isExcel ? null : delimiter,
            encoding: isExcel ? null : encoding,
            sheetName: isExcel ? sheetName : null,
        });

        // Close only after a successful upload.
        if (res) onClose();
    };

    const isExcel = selectedFile && isExcelFile(selectedFile.name);
    const hasDotInName = datasetName.includes('.');
    const isNameEmpty = !datasetName.trim();
    // Disable submission when required input is invalid or upload is in progress.
    const isSubmitDisabled = isUploading || !selectedFile || hasDotInName || isNameEmpty;

    // Delimiter and encoding selection is available for delimited text files.
    const isDelimitedFile = Boolean(
        selectedFile && (
            selectedFile.name.toLowerCase().endsWith('.csv') ||
            selectedFile.name.toLowerCase().endsWith('.tsv')
        )
    );

    // Support label lookup with translation keys and 'cp1251' alias
    const currentDelimiterOpt = DELIMITER_OPTIONS.find((o) => o.value === delimiter);
    const currentDelimiterLabel = currentDelimiterOpt ? t(currentDelimiterOpt.labelKey) : delimiter;

    const currentEncodingOpt = ENCODING_OPTIONS.find(
        (o) => o.value === encoding || (encoding === 'cp1251' && o.value === 'windows-1251')
    );
    const currentEncodingLabel = currentEncodingOpt ? t(currentEncodingOpt.labelKey) : encoding;

    return (
        <div
            onMouseDown={(e) => {
                // Remember where the pointer press started.
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
            className="editor-upload-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
                className="editor-upload-modal w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50"
            >
                {/* Modal header */}
                <div className="relative text-center">
                    <div className="px-8">
                        <h2 className="editor-upload-title text-xl font-semibold text-white">{t('editor.upload')}</h2>
                        <p className="mt-1 text-xs text-zinc-400">
                            {t('editor.uploadFormats')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="absolute -right-3 -top-5 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
                        aria-label={t('common.close')}
                    >
                        <X className="h-5 w-5"/>
                    </button>
                </div>
                <div className="mt-5 space-y-4">
                    {/* File dropzone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`editor-upload-dropzone group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
                            selectedFile
                                ? 'is-file-selected border-emerald-500/40 bg-emerald-500/5'
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
                                        {t('editor.fileSizeChooseOther', {
                                            size: (selectedFile.size / 1024).toFixed(1),
                                        })}
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
                                        {t('editor.dropFile')}
                                    </p>
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                        .csv, .tsv, .xlsx, .xls
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dataset name */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                            {t('editor.datasetName')}
                        </label>
                        <input
                            type="text"
                            value={datasetName}
                            onChange={(e) => setDatasetName(e.target.value)}
                            disabled={isUploading}
                            placeholder={t('editor.datasetNamePlaceholder')}
                            className={`editor-upload-input w-full rounded-2xl border bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition ${
                                hasDotInName
                                    ? 'border-red-500/60 focus:border-red-500'
                                    : 'border-zinc-800 focus:border-blue-500'
                            }`}
                        />
                        {hasDotInName && (
                            <p className="mt-1.5 text-xs text-red-400">
                                {t('editor.datasetNameValidation')}
                            </p>
                        )}
                    </div>

                    {/* Delimiter and encoding selection for CSV and TSV */}
                    {isDelimitedFile && (
                        <div className="space-y-4">
                            {/* Delimiter dropdown */}
                            <div className="relative">
                                <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                                    {t('editor.delimiter')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isUploading) return;
                                        setIsDelimiterOpen((prev) => !prev);
                                        setIsEncodingOpen(false);
                                        setIsSheetOpen(false);
                                    }}
                                    disabled={isUploading || !selectedFile}
                                    className="editor-upload-input flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-left text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
                                >
                                    <span className="truncate">
                                        {currentDelimiterLabel}
                                    </span>
                                    <span className={`ml-2 text-xs text-zinc-400 transition-transform duration-200 ${isDelimiterOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {isDelimiterOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsDelimiterOpen(false)}
                                        />
                                        <div className="editor-upload-dropdown absolute left-0 right-0 top-full z-50 mt-1.5 max-h-48 overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl shadow-black">
                                            {DELIMITER_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setDelimiter(opt.value);
                                                        setIsDelimiterOpen(false);
                                                    }}
                                                    className={`w-full rounded-xl px-3 py-1.5 text-left text-xs transition ${
                                                        delimiter === opt.value
                                                            ? 'is-selected bg-blue-600 font-medium text-white'
                                                            : 'text-zinc-200 hover:bg-zinc-800'
                                                    }`}
                                                >
                                                    {t(opt.labelKey)}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* File encoding dropdown (24 options, scrollable) */}
                            <div className="relative">
                                <label className="mb-1.5 block text-xs font-medium text-zinc-300">
                                    {t('editor.encoding')}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isUploading || !selectedFile) return;
                                        setIsEncodingOpen((prev) => !prev);
                                        setIsDelimiterOpen(false);
                                        setIsSheetOpen(false);
                                    }}
                                    disabled={isUploading || !selectedFile}
                                    className="editor-upload-input flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-left text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
                                >
                                    <span className="truncate">
                                        {currentEncodingLabel}
                                    </span>
                                    <span className={`ml-2 text-xs text-zinc-400 transition-transform duration-200 ${isEncodingOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {isEncodingOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsEncodingOpen(false)}
                                        />
                                        <div className="editor-upload-dropdown absolute left-0 right-0 top-full z-50 mt-1.5 max-h-48 overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl shadow-black">
                                            {ENCODING_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setEncoding(opt.value);
                                                        setIsEncodingOpen(false);
                                                    }}
                                                    className={`w-full rounded-xl px-3 py-1.5 text-left text-xs transition ${
                                                        (encoding === opt.value || (encoding === 'cp1251' && opt.value === 'windows-1251'))
                                                            ? 'is-selected bg-blue-600 font-medium text-white'
                                                            : 'text-zinc-200 hover:bg-zinc-800'
                                                    }`}
                                                >
                                                    {t(opt.labelKey)}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sheet selection for Excel */}
                    {isExcel && (
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="block text-xs font-medium text-zinc-300">
                                    {t('editor.sheet')}
                                </label>
                                {isInspectingSheets && (
                                    <span className="flex items-center gap-1.5 text-xs text-blue-400">
                                        <Loader2 className="h-3 w-3 animate-spin"/>
                                        {t('editor.readingSheets')}
                                    </span>
                                )}
                            </div>
                            {availableSheets.length > 0 ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isUploading || isInspectingSheets) return;
                                            setIsSheetOpen((prev) => !prev);
                                            setIsDelimiterOpen(false);
                                            setIsEncodingOpen(false);
                                        }}
                                        disabled={isUploading || isInspectingSheets}
                                        className="editor-upload-input flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-left text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <span className="truncate">
                                            {sheetName || t('editor.defaultSheet')}
                                        </span>
                                        <span className={`ml-2 text-xs text-zinc-400 transition-transform duration-200 ${isSheetOpen ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>

                                    {isSheetOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsSheetOpen(false)}
                                            />
                                            <div className="editor-upload-dropdown absolute left-0 right-0 top-full z-50 mt-1.5 max-h-48 overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl shadow-black">
                                                {availableSheets.map((sheet) => (
                                                    <button
                                                        key={sheet}
                                                        type="button"
                                                        onClick={() => {
                                                            setSheetName(sheet);
                                                            setIsSheetOpen(false);
                                                        }}
                                                        className={`w-full rounded-xl px-3 py-1.5 text-left text-xs transition ${
                                                            sheetName === sheet
                                                                ? 'is-selected bg-blue-600 font-medium text-white'
                                                                : 'text-zinc-200 hover:bg-zinc-800'
                                                        }`}
                                                    >
                                                        {sheet}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={sheetName}
                                    onChange={(e) => setSheetName(e.target.value)}
                                    disabled={isUploading || isInspectingSheets}
                                    placeholder={t('editor.defaultSheet')}
                                    className="editor-upload-input w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isUploading}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin"/>}
                        {isUploading ? t('editor.uploading') : t('editor.uploadDataset')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadDatasetModal;
