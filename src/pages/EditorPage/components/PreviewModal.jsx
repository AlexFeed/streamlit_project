import { useEffect } from 'react';

// Модальное окно для отображения streamlit дашборда
const PreviewModal = ({ isOpen, previewUrl, onClose }) => {
    // Закрытие модального окна на esc
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    // Блокировка скролла
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 🔥 Overlay (фон с blur) */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 🔥 Само окно */}
            <div className="relative z-10 flex h-[90vh] w-[95vw] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold text-white">
                            Streamlit Preview
                        </h2>
                        <p className="mt-1 text-xs text-zinc-400">
                            Предпросмотр приложения
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            Открыть отдельно
                        </a>

                        <button
                            onClick={onClose}
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:bg-red-500/10 hover:text-red-400"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>

                {/* Iframe */}
                <div className="flex-1 bg-white">
                    {previewUrl && (
                        <iframe
                            src={previewUrl}
                            title="Streamlit preview"
                            className="h-full w-full border-0"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;