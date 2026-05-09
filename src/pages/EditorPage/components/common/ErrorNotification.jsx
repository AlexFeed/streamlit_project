
const ErrorNotification = ({ message}) => {
    // Защита: если текста нет, ничего не рендерим
    if (!message) return null;

    return (
        <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-red-500/40 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4">
            {/* Индикатор ошибки */}
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />

            {/* Текст ошибки */}
            <div className="flex-1">
                <p className="text-sm leading-relaxed text-red-100/90">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default ErrorNotification;