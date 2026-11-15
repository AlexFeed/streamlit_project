import {
    GripVertical,
    LayoutDashboard,
} from 'lucide-react';
import EditorTooltip from './EditorTooltip.jsx';
import { useDraggable } from '@dnd-kit/core';
import { PALETTE_GROUPS, paletteItems } from '../data/paletteItems';
import ThemeToggle from '../../../shared/theme/ThemeToggle.jsx';
import StreamlitWordmark from '../../../shared/components/StreamlitWordmark.jsx';
import useTranslation from '../../../shared/translation/useTranslation.js';

const PaletteItem = ({ item, onAddComponent }) => {
    const { t } = useTranslation();
    const Icon = item.icon || LayoutDashboard;
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
    } = useDraggable({
        id: `palette:${item.type}`,
        data: {
            source: 'palette',
            paletteItem: item,
        },
    });

    return (
        <EditorTooltip content={t(item.labelKey)} placement="right">
            <button
                ref={setNodeRef}
                type="button"
                onClick={() => onAddComponent(item)}
                className={`palette-item${isDragging ? ' is-dragging' : ''}`}
                aria-label={t(item.labelKey)}
                {...listeners}
                {...attributes}
            >
                <div className="palette-item-content">
                    <div className={`palette-item-icon ${item.accentClass || ''}`}>
                        <Icon aria-hidden="true" />
                    </div>
                    <div className="palette-item-details">
                        <span className="palette-item-label">{t(item.labelKey)}</span>
                        <GripVertical className="palette-item-grip" aria-hidden="true" />
                    </div>
                </div>
            </button>
        </EditorTooltip>
    );
};

const ComponentsPalette = ({ onAddComponent, onGoHome }) => {
    const { t } = useTranslation();

    return (
    <aside className="editor-palette">
        <div className="editor-palette-brand">
            <button
                type="button"
                onClick={onGoHome}
                className="editor-brand-button"
                aria-label={t('editor.goHomeTitle')}
            >
                <div className="editor-brand-icon">
                    <LayoutDashboard aria-hidden="true" />
                </div>
                <StreamlitWordmark />
            </button>
        </div>

        <div className="editor-palette-content">
            <div className="editor-palette-heading">
                <p>{t('editor.components')}</p>
            </div>

            <div className="editor-palette-groups">
                {PALETTE_GROUPS.map((groupTitle) => (
                    <section className="editor-palette-group" key={groupTitle}>
                        <h2>{t(groupTitle)}</h2>
                        <div className="editor-palette-items">
                            {Object.values(paletteItems)
                                .filter((item) => item.groupKey === groupTitle)
                                .map((item) => (
                                    <PaletteItem
                                        key={item.type}
                                        item={item}
                                        onAddComponent={onAddComponent}
                                    />
                                ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
        <div className="editor-palette-footer">
            <div className="sidebar-controls">
                <ThemeToggle sliderOnly />
            </div>
        </div>
    </aside>
    );
};

export default ComponentsPalette;
