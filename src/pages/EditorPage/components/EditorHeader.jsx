import {
    Database,
    Download,
    Save,
    Trash2,
    Upload,
    X,
    House
} from 'lucide-react';
import useTranslation from '../../../shared/i18n/useTranslation.js';

const EditorHeader = ({
                          onClearCanvas,
                          onGenerateDashboard,
                          datasets = [],
                          onRemoveDataset,
                          isDatasetClearing,
                          isGenerating,
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
                    <span className="editor-live-badge">Live</span>
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
                        <button
                            type="button"
                            onClick={() => onRemoveDataset(dataset.datasetId)}
                            disabled={isDatasetClearing}
                            className="editor-icon-button editor-remove-dataset"
                            title={t('editor.deleteDataset')}
                            aria-label={t('editor.deleteDataset')}
                        >
                            <X aria-hidden="true" />
                        </button>
                    </div>
                ))}

                <button
                    className="btn btn-secondary editor-action-button"
                    onClick={onUploadDataset}>
                    <Upload aria-hidden="true" />
                    {t('editor.upload')}
                </button>

                <div className="editor-header-divider"/>

                <button
                    type="button"
                    onClick={onSaveProject}
                    className="btn btn-secondary editor-action-button"
                >
                    <Save aria-hidden="true" />
                    {t('editor.save')}
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
                    title={t('editor.clearCanvas')}
                    aria-label={t('editor.clearCanvas')}
                >
                    <Trash2 aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={onGoHome}
                    className="editor-icon-button"
                    title={t('editor.goHome')}
                    aria-label={t('editor.goHome')}
                >
                    <House aria-hidden="true" />
                </button>
            </div>
        </header>
    );
};

export default EditorHeader;