import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { compileDashboardSchema } from '../services/editorSchema.js';
import { createPreviewSession, updatePreviewSession } from '../../../api/previewApi.js';
import useTranslation from '../../../shared/i18n/useTranslation.js';

export const usePreviewState = () => {
    const { t } = useTranslation();
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewSessionId, setPreviewSessionId] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Cache the serialized schema from the last successful launch
    const lastSchemaStrRef = useRef('');

    const handleOpenPreview = async (snapshot) => {
        try {
            const { schema, errors } = compileDashboardSchema(snapshot, t);
            if (errors.length > 0) {
                errors.forEach((err) => toast.error(err));
                return null;
            }

            const currentSchemaStr = JSON.stringify(schema);

            setIsPreviewLoading(true);

            // Always verify/update the backend session before opening. A
            // backend restart can invalidate its in-memory session while the
            // browser still holds the old URL, even when the schema itself is
            // unchanged.
            if (previewSessionId) {
                try {
                    const session = await updatePreviewSession(previewSessionId, { schema });
                    setPreviewUrl(session.previewUrl);
                    lastSchemaStrRef.current = currentSchemaStr;
                    setIsPreviewModalOpen(true);
                    return;
                } catch (updateError) {
                    // Fall back to creating a new session if expired (>30m) or not found
                    console.warn('Preview session expired, creating a new one:', updateError);
                }
            }

            // First launch or fallback after expiration/backend restart.
            const session = await createPreviewSession({ schema });
            setPreviewUrl(session.previewUrl);
            setPreviewSessionId(session.sessionId);
            lastSchemaStrRef.current = currentSchemaStr;
            setIsPreviewModalOpen(true);
        } catch (error) {
            console.error('Could not start preview:', error);
            toast.error(error.message || t('editor.previewFailure'));
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleClosePreview = () => {
        setIsPreviewModalOpen(false);
        // Backend TTL will automatically prune stale sessions after 30 minutes.
    };

    return {
        isPreviewLoading,
        previewUrl,
        previewSessionId,
        isPreviewModalOpen,
        handleOpenPreview,
        handleClosePreview,
    };
};
