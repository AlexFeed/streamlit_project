import { useState } from 'react';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const useEditorDnd = ({
    components,
    addComponent,
    reorderComponent,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeDrag, setActiveDrag] = useState(null);

    const handleDragStart = ({ active }) => {
        setActiveDrag(active.data.current || null);
    };

    const handleDragCancel = () => {
        setActiveDrag(null);
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveDrag(null);
        if (!over) return;

        const dragData = active.data.current;

        if (dragData?.source === 'palette') {
            const overIndex = components.findIndex((item) => item.id === over.id);
            const targetIndex = overIndex >= 0 ? overIndex : components.length;
            const targetLayout = over.data.current?.getPaletteDropLayout?.(
                active.rect.current.translated,
                dragData.paletteItem
            ) || null;
            addComponent(dragData.paletteItem, targetIndex, targetLayout);
            return;
        }

        if (
            dragData?.source === 'canvas-item'
            && over.id !== 'dashboard-canvas'
        ) {
            reorderComponent(active.id, over.id);
        }
    };

    return {
        sensors,
        activeDrag,
        handleDragStart,
        handleDragCancel,
        handleDragEnd,
    };
};
