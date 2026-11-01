import {
    GripVertical,
    LayoutDashboard,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { PALETTE_GROUPS, paletteItems } from '../data/paletteItems';
import ThemeToggle from '../../../shared/ThemeToggle.jsx';

const PaletteItem = ({ item, onAddComponent }) => {
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
        <button
            ref={setNodeRef}
            type="button"
            onClick={() => onAddComponent(item)}
            className={`palette-item${isDragging ? ' is-dragging' : ''}`}
            {...listeners}
            {...attributes}
        >
            <div className="palette-item-content">
                <div className={`palette-item-icon ${item.accentClass || ''}`}>
                    <Icon aria-hidden="true" />
                </div>
                <div className="palette-item-details">
                    <span className="palette-item-label">{item.label}</span>
                    <GripVertical className="palette-item-grip" aria-hidden="true" />
                </div>
            </div>
        </button>
    );
};

const ComponentsPalette = ({ onAddComponent, onGoHome }) => (
    <aside className="editor-palette">
        <div className="editor-palette-brand">
            <button
                type="button"
                onClick={onGoHome}
                className="editor-brand-button"
                title="На главную (Мои проекты)"
            >
                <div className="editor-brand-icon">
                    <LayoutDashboard aria-hidden="true" />
                </div>
                <div>
                    <h1 className="editor-brand-title">Streamlit Builder</h1>
                </div>
            </button>
        </div>

        <div className="editor-palette-content">
            <div className="editor-palette-heading">
                <p>Компоненты</p>
            </div>

            <div className="editor-palette-groups">
                {PALETTE_GROUPS.map((groupTitle) => (
                    <section className="editor-palette-group" key={groupTitle}>
                        <h2>{groupTitle}</h2>
                        <div className="editor-palette-items">
                            {Object.values(paletteItems)
                                .filter((item) => item.group === groupTitle)
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
            <ThemeToggle />
        </div>
    </aside>
);

export default ComponentsPalette;
