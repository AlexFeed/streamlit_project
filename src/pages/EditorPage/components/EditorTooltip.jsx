import { cloneElement, useId, useState } from 'react';
import { createPortal } from 'react-dom';

const EditorTooltip = ({ children, content, placement = 'top', className = '' }) => {
    const [position, setPosition] = useState(null);
    const tooltipId = useId();

    const updatePosition = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const actualPlacement = placement === 'top' && bounds.top < 48 ? 'bottom' : placement;
        setPosition({
            left: actualPlacement === 'right' ? bounds.right + 10 : bounds.left + bounds.width / 2,
            top: actualPlacement === 'right'
                ? bounds.top + bounds.height / 2
                : actualPlacement === 'bottom' ? bounds.bottom + 8 : bounds.top - 8,
            placement: actualPlacement,
        });
    };

    const hideTooltip = (event) => {
        if (!event.currentTarget.contains(document.activeElement)) {
            setPosition(null);
        }
    };

    const child = cloneElement(children, {
        'aria-describedby': position ? tooltipId : children.props['aria-describedby'],
    });

    return (
        <span
            className={`editor-tooltip-anchor ${className}`.trim()}
            onPointerEnter={updatePosition}
            onPointerLeave={hideTooltip}
            onFocus={updatePosition}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPosition(null);
            }}
        >
            {child}
            {position && createPortal(
                <span
                    id={tooltipId}
                    className={`editor-tooltip-portal is-${position.placement}`}
                    role="tooltip"
                    style={{ left: position.left, top: position.top }}
                >
                    {content}
                </span>,
                document.body
            )}
        </span>
    );
};

export default EditorTooltip;
