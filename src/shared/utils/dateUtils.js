export const formatProjectDate = (isoString, language = 'ru') => {
    const locale = language === 'en' ? 'en-US' : 'ru-RU';
    const relativeTime = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (!isoString) return relativeTime.format(0, 'minute');

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

        if (diffMins < 1) return relativeTime.format(0, 'minute');
        if (diffMins < 60) return relativeTime.format(-diffMins, 'minute');

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

        const timeStr = date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });

        if (isToday) return `${relativeTime.format(0, 'day')}, ${timeStr}`;
        if (isYesterday) return `${relativeTime.format(-1, 'day')}, ${timeStr}`;

        const isSameYear = date.getFullYear() === now.getFullYear();
        const dateStr = date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
            year: isSameYear ? undefined : 'numeric',
        });

        return `${dateStr}, ${timeStr}`;
    } catch {
        return isoString;
    }
};