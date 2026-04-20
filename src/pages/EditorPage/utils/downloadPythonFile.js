export const downloadPythonFile = (code, filename = 'generated_dashboard.py') => {
    try {
        const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Ошибка скачивания Python-файла:', error);
    }
};