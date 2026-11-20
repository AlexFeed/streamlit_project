const LivePageLink = ({ item, height, t}) => {
    const label = item.config?.title || t('editor.pageLinkDefault');
    const isLink = item.config?.displayStyle === 'link';

    return (
        <div data-canvas-drag-surface className="live-preview-page-link" style={{ height }}>
            <span
                className={isLink ? 'live-preview-page-link-text' : 'live-preview-page-link-button'}
                style={{
                    backgroundColor: !isLink ? (item.config?.buttonColor || '#f47721') : undefined,
                    borderColor: !isLink ? (item.config?.buttonColor || '#f47721') : undefined,
                    color: item.config?.elementTextColor || undefined,
                    fontSize: item.config?.elementFontSize && item.config.elementFontSize !== 'auto'
                        ? `${item.config.elementFontSize}px`
                        : undefined,
                    fontWeight: item.config?.elementFontWeight || undefined,
                    fontStyle: item.config?.elementFontStyle || undefined,
                }}
            >
                {label}
            </span>
        </div>
    );
};

export default LivePageLink;