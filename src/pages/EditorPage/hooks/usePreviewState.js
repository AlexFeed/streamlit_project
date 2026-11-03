import { useState } from 'react';
import { toast } from 'sonner';
import { compileDashboardSchema } from '../services/editorSchema.js';
import { createPreviewSession } from '../../../api/previewApi.js';
import useTranslation from '../../../shared/i18n/useTranslation.js';

export const usePreviewState = () => {
    const { t } = useTranslation();
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewSessionId, setPreviewSessionId] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const handleOpenPreview = async (snapshot) => {
        try {
            const { schema, errors } = compileDashboardSchema(snapshot, t);
            if (errors.length > 0) {
                errors.forEach((err) => toast.error(err));
                return null;
            }

            setIsPreviewLoading(true);

            const session = await createPreviewSession({ schema });
            setPreviewUrl(session.previewUrl);
            setPreviewSessionId(session.sessionId);
            setIsPreviewModalOpen(true);
        } catch (error) {
            console.error('Could not start preview:', error);
            toast.error(error.message || t('editor.previewFailure'));
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleClosePreview = async () => {
        setIsPreviewModalOpen(false);
    };

    return {
        isPreviewLoading,
        previewUrl,
        isPreviewModalOpen,
        handleOpenPreview,
        handleClosePreview,
    };
};