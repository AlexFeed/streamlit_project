import { memo } from 'react';

const CanvasSkeleton = memo(() => {
    return (
        <div className="dashboard-canvas-skeleton" aria-hidden="true">
            <div className="skeleton-grid">
                <div className="skeleton-card skeleton-metric">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-value" />
                </div>
                <div className="skeleton-card skeleton-metric">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-value" />
                </div>
                <div className="skeleton-card skeleton-metric">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-value" />
                </div>

                <div className="skeleton-card skeleton-chart-large">
                    <div className="skeleton-header">
                        <div className="skeleton-line skeleton-title" />
                        <div className="skeleton-line skeleton-badge" />
                    </div>
                    <div className="skeleton-chart-body">
                        <div className="skeleton-axis-y" />
                        <div className="skeleton-chart-content">
                            <div className="skeleton-chart-wave" />
                        </div>
                    </div>
                    <div className="skeleton-axis-x" />
                </div>

                <div className="skeleton-card skeleton-chart-small">
                    <div className="skeleton-header">
                        <div className="skeleton-line skeleton-title" />
                    </div>
                    <div className="skeleton-chart-bars">
                        <div className="skeleton-bar" style={{ height: '40%' }} />
                        <div className="skeleton-bar" style={{ height: '75%' }} />
                        <div className="skeleton-bar" style={{ height: '55%' }} />
                        <div className="skeleton-bar" style={{ height: '90%' }} />
                        <div className="skeleton-bar" style={{ height: '65%' }} />
                    </div>
                </div>

                <div className="skeleton-card skeleton-wide">
                    <div className="skeleton-header">
                        <div className="skeleton-line skeleton-title" />
                    </div>
                    <div className="skeleton-table-rows">
                        <div className="skeleton-table-row" />
                        <div className="skeleton-table-row" />
                        <div className="skeleton-table-row" />
                    </div>
                </div>
            </div>
        </div>
    );
});

CanvasSkeleton.displayName = 'CanvasSkeleton';

export default CanvasSkeleton;
