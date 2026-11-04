import { Pencil, Plus, Trash2 } from 'lucide-react';
import useTranslation from '../../../shared/i18n/useTranslation.js';

const PageTabs = ({ pages, activePageId, onSelect, onAdd, onRename, onDelete }) => {
    const { t } = useTranslation();
    const activePage = pages.find((page) => page.id === activePageId);

    const handleRename = () => {
        if (!activePage) return;
        const title = window.prompt(t('editor.pageName'), activePage.title);
        if (title != null) onRename(activePage.id, title);
    };

    const handleDelete = () => {
        if (!activePage || pages.length <= 1) return;
        if (window.confirm(t('editor.deletePageConfirm', { title: activePage.title }))) {
            onDelete(activePage.id);
        }
    };

    return (
        <div className="editor-page-tabs" data-preview-exclude>
            <div className="editor-page-tabs-list">
                {pages.map((page) => (
                    <button
                        key={page.id}
                        type="button"
                        onClick={() => onSelect(page.id)}
                        className={`editor-page-tab ${page.id === activePageId ? 'is-active' : ''}`}
                        title={page.title}
                    >
                        {page.title}
                    </button>
                ))}
                <button type="button" onClick={onAdd} className="editor-page-tab editor-page-tab-add">
                    <Plus aria-hidden="true" />
                    {t('editor.addPage')}
                </button>
            </div>
            <div className="editor-page-tabs-actions">
                <button type="button" onClick={handleRename} className="canvas-item-action" title={t('editor.renamePage')} aria-label={t('editor.renamePage')}>
                    <Pencil aria-hidden="true" />
                </button>
                <button type="button" onClick={handleDelete} disabled={pages.length <= 1} className="canvas-item-action canvas-item-delete" title={t('editor.deletePage')} aria-label={t('editor.deletePage')}>
                    <Trash2 aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default PageTabs;
