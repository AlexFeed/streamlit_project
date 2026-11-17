import {
    Database,
    Download,
    Redo2,
    Save,
    Trash2,
    Undo2,
    Upload,
    X,
    House,
    Eye,
    Loader2,
} from 'lucide-react';
import useTranslation from '../../../shared/translation/useTranslation.js';
import EditorTooltip from './EditorTooltip.jsx';

const EditorHeader = ({
                          onClearCanvas,
                          onGenerateDashboard,
                          onPreviewDashboard,
                          datasets = [],
                          onRemoveDataset,
                          isDatasetClearing,
                          isGenerating,
                          isPreviewLoading,
                          isProjectSaving = false,
                          onUndo,
                          onRedo,
                          canUndo,
                          canRedo,
                          onSaveProject,
                          onGoHome,
                          onUploadDataset
                      }) => {
    const { t } = useTranslation();

    return (
        <header className="editor-header">
            <div>
                <div className="editor-header-title">
                    <h1>{t('editor.title')}</h1>
                </div>
            </div>

            <div className="editor-header-actions">
                {datasets.map((dataset) => (
                    <div
                        key={dataset.datasetId}
                        className="editor-dataset-badge"
                    >
                        <Database aria-hidden="true" />
                        <span title={dataset.name}>
                            {dataset.name}
                        </span>
                        <EditorTooltip content={t('editor.deleteDataset')}>
                            <button
                                type="button"
                                onClick={() => onRemoveDataset(dataset.datasetId)}
                                disabled={isDatasetClearing}
                                className="editor-icon-button editor-remove-dataset"
                                aria-label={t('editor.deleteDataset')}
                            >
                                <X aria-hidden="true" />
                            </button>
                        </EditorTooltip>
                    </div>
                ))}

                <button
                    className="btn btn-secondary editor-action-button"
                    onClick={onUploadDataset}>
                    <Upload aria-hidden="true" />
                    {t('editor.upload')}
                </button>

                <div className="editor-header-divider"/>

                <EditorTooltip content={t('editor.undoShortcut')}>
                    <button
                        type="button"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="btn btn-secondary editor-action-button editor-history-button"
                        aria-label={t('editor.undo')}
                    >
                        <Undo2 aria-hidden="true" />
                    </button>
                </EditorTooltip>

                <EditorTooltip content={t('editor.redoShortcut')}>
                    <button
                        type="button"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="btn btn-secondary editor-action-button editor-history-button"
                        aria-label={t('editor.redo')}
                    >
                        <Redo2 aria-hidden="true" />
                    </button>
                </EditorTooltip>

                <button
                    type="button"
                    onClick={onPreviewDashboard}
                    disabled={isPreviewLoading}
                    className="btn btn-secondary editor-action-button"
                >
                    <Eye aria-hidden="true" />
                    {isPreviewLoading ? t('editor.previewing') : t('editor.preview')}
                </button>

                <button
                    type="button"
                    onClick={onSaveProject}
                    disabled={isProjectSaving}
                    className="btn btn-secondary editor-action-button"
                >
                    {isProjectSaving ? (
                        <Loader2 className="editor-btn-spinner" aria-hidden="true" />
                    ) : (
                        <Save aria-hidden="true" />
                    )}
                    {isProjectSaving ? t('editor.savingProject') : t('editor.save')}
                </button>

                <button
                    type="button"
                    onClick={onGenerateDashboard}
                    disabled={isGenerating}
                    className="btn btn-primary editor-action-button"
                >
                    <Download aria-hidden="true" />
                    {isGenerating ? t('editor.generating') : t('editor.download')}
                </button>

                <button
                    type="button"
                    onClick={onClearCanvas}
                    className="editor-icon-button editor-clear-button"
                    aria-label={t('editor.clearCanvas')}
                >
                    <Trash2 aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={onGoHome}
                    className="editor-icon-button"
                    aria-label={t('editor.goHome')}
                >
                    <House aria-hidden="true" />
                </button>
            </div>
        </header>
    );
};

export default EditorHeader;
