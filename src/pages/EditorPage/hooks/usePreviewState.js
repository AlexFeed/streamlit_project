import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { compileDashboardSchema } from '../services/editorSchema.js';
import { createPreviewSession, updatePreviewSession } from '../../../api/previewApi.js';
import useTranslation from '../../../shared/translation/useTranslation.js';

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

            // Scenario 1: Session already exists and schema is unchanged.
            // Reopen modal instantly without extra network roundtrips.
            if (previewSessionId && previewUrl && currentSchemaStr === lastSchemaStrRef.current) {
                setIsPreviewModalOpen(true);
                return;
            }

            setIsPreviewLoading(true);

            // Scenario 2: Session exists, but dashboard schema changed.
            // Update the existing session in-place (PUT /preview/{sessionId}).
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

            // Scenario 3: First launch or fallback after TTL expiration.
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
        isPreviewModalOpen,
        handleOpenPreview,
        handleClosePreview,
    };
};