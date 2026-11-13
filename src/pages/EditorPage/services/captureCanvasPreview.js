import { toJpeg } from 'html-to-image';

const MAX_PREVIEW_WIDTH = 1280;
const MAX_PREVIEW_HEIGHT = 800;

export const captureCanvasPreview = async (element) => {
    if (!element) {
        throw new Error('The dashboard canvas is not available.');
    }

    // Capture the body of the canvas containing widgets, excluding the editor header and canvas title.
    const target = element.querySelector('.dashboard-canvas-body')
        || element.querySelector('.grid-stack')
        || element;

    const width = Math.min(target.scrollWidth || element.clientWidth || 0, 1280);
    const height = Math.min(target.scrollHeight || 800, 800);

    if (!width || !height) {
        throw new Error('The dashboard canvas has no visible size.');
    }

    const computedBg = window.getComputedStyle(element).backgroundColor;
    const backgroundColor = computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent'
        ? computedBg
        : '#ffffff';

    return await toJpeg(target, {
        quality: 0.75,
        backgroundColor,
        canvasWidth: Math.min(MAX_PREVIEW_WIDTH, width),
        canvasHeight: Math.min(MAX_PREVIEW_HEIGHT, height),
        filter: (node) => {
            if (!node || !node.classList) return true;
            return !(
                node.tagName === 'BUTTON'
                || node.classList.contains('dashboard-canvas-header')
                || node.classList.contains('canvas-resize-handle')
                || node.hasAttribute?.('data-preview-exclude')
            );
        },
    });
};
