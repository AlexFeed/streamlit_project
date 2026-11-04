import { useEffect } from 'react';
import { toast } from 'sonner';
import useTranslation from '../../../../shared/translation/useTranslation.js';

const SaveProjectModal = ({
    isOpen,
    isSaving = false,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSaving) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSaving, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = String(formData.get('title') || '').trim();
        const description = String(formData.get('description') || '').trim();

        if (!title) {
            toast.error(t('editor.projectTitleRequired'));
            return;
        }

        await onConfirm({ title, description });
    };

    return (
        <div
            onClick={() => {
                if (!isSaving) onClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
        >
            <form
                onSubmit={handleSubmit}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/50"
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{t('editor.saveProject')}</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            {t('editor.saveProjectDescription')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-zinc-400 transition hover:text-white disabled:opacity-50"
                        aria-label={t('common.close')}
                    >
                        ×
                    </button>
                </div>
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            {t('editor.projectName')}
                        </label>
                        <input
                            type="text"
                            name="title"
                            defaultValue=""
                            disabled={isSaving}
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                            {t('editor.projectDescription')}
                        </label>
                        <textarea
                            name="description"
                            defaultValue=""
                            rows={4}
                            disabled={isSaving}
                            className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
                    >
                        {t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SaveProjectModal;
