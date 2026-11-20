const EmptyPreview = ({ children, height = 240, theme }) => (
    <div
        className="live-preview-empty flex items-center justify-center rounded-xl border border-dashed px-6 text-center"
        style={{
            height,
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.muted,
        }}
    >
        <p className="max-w-xs text-sm leading-6">{children}</p>
    </div>
);

export default EmptyPreview;