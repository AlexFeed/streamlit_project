export const formatProjectDate = (isoString) => {
    if (!isoString) return 'Только что';
    if (isoString === 'Только что') return isoString;

    try {
        const hasTimezone = /[Z+-]/.test(isoString.slice(10));
        const normalized = hasTimezone ? isoString : `${isoString}Z`;

        const date = new Date(normalized);
        if (Number.isNaN(date.getTime())) {
            return isoString;
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин назад`;

        const isToday =
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        const timeStr = date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (isToday) return `Сегодня, ${timeStr}`;
        if (isYesterday) return `Вчера, ${timeStr}`;

        const isSameYear = date.getFullYear() === now.getFullYear();
        const dateStr = date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: isSameYear ? undefined : 'numeric',
        });

        return `${dateStr}, ${timeStr}`;
    } catch {
        return isoString;
    }
};