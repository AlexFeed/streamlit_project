import { normalizeComponentLayouts } from './gridLayout.js';

export const DEFAULT_PAGE_ID = 'page-main';

export const createDefaultPages = () => ([{
    id: DEFAULT_PAGE_ID,
    title: 'Главная',
}]);

export const normalizePages = (pages) => {
    if (!Array.isArray(pages) || pages.length === 0) {
        return createDefaultPages();
    }

    const seen = new Set();
    const normalized = pages
        .map((page, index) => ({
            id: String(page?.id || `page-${index + 1}`),
            title: String(page?.title || `Страница ${index + 1}`).trim()
                || `Страница ${index + 1}`,
        }))
        .filter((page) => {
            if (seen.has(page.id)) return false;
            seen.add(page.id);
            return true;
        });

    return normalized.length > 0 ? normalized : createDefaultPages();
};

export const normalizeComponentsByPage = (components, pages) => {
    if (!Array.isArray(components)) return [];

    const normalizedPages = normalizePages(pages);
    const validPageIds = new Set(normalizedPages.map((page) => page.id));
    const fallbackPageId = normalizedPages[0].id;
    const withPages = components.map((component) => ({
        ...component,
        pageId: validPageIds.has(component.pageId)
            ? component.pageId
            : fallbackPageId,
    }));
    const normalizedById = new Map();

    normalizedPages.forEach((page) => {
        normalizeComponentLayouts(
            withPages.filter((component) => component.pageId === page.id)
        ).forEach((component) => normalizedById.set(component.id, component));
    });

    return withPages.map((component) => (
        normalizedById.get(component.id) || component
    ));
};
