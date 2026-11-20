import EmptyPreview from "./EmptyPreview.jsx";

const LiveText = ({ item, height, t, theme }) => {
    const content = item.config?.content?.trim()
        || (item.config?.contentKey ? t(item.config.contentKey) : '');

    if (!content) {
        return (
            <EmptyPreview height={height} theme={theme}>
                {t('editor.textNeedContent')}
            </EmptyPreview>
        );
    }

    return (
        <div
            className="live-preview-text w-full overflow-visible whitespace-pre-wrap text-sm leading-6"
            style={{
                height,
                fontSize: `${item.config?.fontSize || 16}px`,
                fontWeight: item.config?.fontWeight || 'normal',
                fontStyle: item.config?.fontStyle || 'normal',
                color: item.config?.color && item.config.color !== '#d4d4d8'
                    ? item.config.color
                    : theme.foreground,
                textAlign: item.config?.textAlign || 'left',
            }}
        >
            {item.config?.title && (
                <div className="mb-1 text-xs font-semibold not-italic" style={{ color: theme.muted }}>
                    {item.config.title}
                </div>
            )}
            <div>{content}</div>
        </div>
    );
};

export default LiveText;