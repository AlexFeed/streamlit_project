import { useState, useRef, useEffect } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import useTranslation from '../../../../shared/translation/useTranslation.js';

const PreviewModal = ({
                          isOpen,
                          previewUrl,
                          onClose,
                      }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const mouseDownTargetRef = useRef(null);


    // Listen for the 'streamlit:ready' message from the iframe
    useEffect(() => {
        if (!isOpen) {
            // Reset loading state whenever the modal closes so it's armed for the next open
            setIsLoading(true);
            return undefined;
        }
        const handleMessage = (event) => {
            if (event.data?.type === 'streamlit:ready') {
                setIsLoading(false);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isOpen]);

    // Re-arm loading state if previewUrl changes while modal is active
    useEffect(() => {
        setIsLoading(true);
    }, [previewUrl]);

    // Close on Escape.
    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !previewUrl) return null;


    return (
        <div
            onMouseDown={(e) => {
                mouseDownTargetRef.current = e.target;
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
                    onClose();
                }
            }}
            className="editor-preview-backdrop"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="editor-preview-modal"
            >
                {/* Modal Header */}
                <div className="editor-preview-header">
                    <div className="editor-preview-header-left">
                        <h2 className="editor-preview-title">
                            {t('editor.previewTitle')}
                        </h2>
                    </div>

                    <div className="editor-preview-actions">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="editor-preview-btn"
                            title={t('editor.previewOpenNewTab')}
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>{t('editor.previewOpenNewTab')}</span>
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            className="editor-preview-close"
                            aria-label={t('common.close')}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body / Iframe */}
                <div className="editor-preview-body">
                    {isLoading && (
                        <div className="editor-preview-loading">
                            <Loader2 className="editor-preview-loading-spinner" />
                            <span className="editor-preview-loading-text">
                                {t('editor.previewing')}
                            </span>
                        </div>
                    )}

                    <iframe
                        src={previewUrl}
                        title="Streamlit Preview"
                        className="editor-preview-iframe"
                    />
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;