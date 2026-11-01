const MAX_PREVIEW_WIDTH = 1280;
const MAX_PREVIEW_HEIGHT = 1800;

export const captureCanvasPreview = async (element) => {
    if (!element) {
        throw new Error('The dashboard canvas is not available.');
    }

    const width = Math.ceil(element.scrollWidth);
    const height = Math.ceil(element.scrollHeight);
    if (!width || !height) {
        throw new Error('The dashboard canvas has no visible size.');
    }

    const { default: html2canvas } = await import('html2canvas');
    const scale = Math.min(
        1,
        MAX_PREVIEW_WIDTH / width,
        MAX_PREVIEW_HEIGHT / height
    );
    const canvas = await html2canvas(element, {
        backgroundColor: null,
        height,
        width,
        scale,
        useCORS: true,
        onclone: (_document, clonedElement) => {
            clonedElement.querySelectorAll(
                'button, .canvas-resize-handle, [data-preview-exclude]'
            ).forEach((control) => control.remove());
        },
    });

    return canvas.toDataURL('image/jpeg', 0.72);
};
