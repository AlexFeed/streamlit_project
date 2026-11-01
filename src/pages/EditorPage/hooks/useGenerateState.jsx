import { useState } from 'react';
import { toast } from 'sonner';
import {compileDashboardSchema} from '../services/editorSchema.js';
import { generateProjectZip } from '../../../api/generateApi.js';
import useTranslation from '../../../shared/i18n/useTranslation.js';

export const useGenerateState = () => {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async (snapshot) => {
        try {
            const { schema, errors } = compileDashboardSchema(snapshot, t);
            if (errors.length > 0) {
                errors.forEach((err) => toast.error(err));
                return null;
            }

            setIsGenerating(true);

            const blob = await generateProjectZip({
                schema,
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dashboard_project.zip';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Could not generate the dashboard:', error);
            toast.error(t('editor.generateFailure'));
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        isGenerating,
        handleGenerate,
    };
};