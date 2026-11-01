const compactTypes = new Set(['text', 'metric', 'selectbox', 'page_link']);

export const getAppearanceDefaults = (type, config = {}) => {
    const surface = config.surface || (
        ['text', 'page_link'].includes(type) ? 'none' : 'card'
    );
    const isMetric = type === 'metric';
    const isFilter = type === 'selectbox';

    return {
        showBorder: config.showBorder ?? ['card', 'outline'].includes(surface),
        showBackground: config.showBackground ?? ['card', 'soft'].includes(surface),
        contentAlignment: config.contentAlignment || (isMetric ? 'center' : 'left'),
        verticalAlignment: config.verticalAlignment || (
            ['metric', 'selectbox', 'page_link'].includes(type) ? 'center' : 'top'
        ),
        padding: Number(config.padding ?? (
            ['text', 'page_link'].includes(type) ? 0 : (isFilter || isMetric) ? 8 : 12
        )),
        contentWidth: config.contentWidth || (
            ['text', 'metric', 'selectbox', 'page_link'].includes(type)
                ? 'content'
                : 'stretch'
        ),
        heightMode: config.heightMode || (
            compactTypes.has(type) ? 'auto' : 'fixed'
        ),
        elementFontSize: config.elementFontSize || 'auto',
        elementTextColor: config.elementTextColor || '#d4d4d8',
        elementFontWeight: config.elementFontWeight || 'normal',
        elementFontStyle: config.elementFontStyle || 'normal',
    };
};

export const withAppearanceDefaults = (type, config = {}) => {
    const next = {
        ...getAppearanceDefaults(type, config),
        ...config,
        appearanceVersion: 6,
    };

    if (!config.appearanceVersion) {
        if (['text', 'page_link'].includes(type)) {
            next.showBorder = false;
            next.showBackground = false;
            next.padding = 0;
            next.verticalAlignment = 'top';
        }
        if (
            ['metric', 'selectbox'].includes(type)
            && config.surface === 'soft'
        ) {
            next.surface = 'none';
            next.showBorder = false;
            next.showBackground = false;
        }
    }
    if (
        Number(config.appearanceVersion || 0) < 4
        && compactTypes.has(type)
    ) {
        next.heightMode = 'auto';
    }
    if (
        Number(config.appearanceVersion || 0) < 5
        && type === 'text'
    ) {
        next.contentWidth = 'content';
    }
    if (
        Number(config.appearanceVersion || 0) < 6
        && type === 'metric'
        && Number(config.padding ?? 12) === 12
    ) {
        next.padding = 8;
    }

    return next;
};
