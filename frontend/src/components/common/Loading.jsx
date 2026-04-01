/**
 * Loading Component - Premium Design System
 * Refined loading states with multiple variants
 */

const Loading = ({
    size = 'md',
    variant = 'spinner',
    text = '',
    fullScreen = false,
    overlay = false,
    className = ''
}) => {
    const sizes = {
        sm: { spinner: 'w-5 h-5 border-2', dot: 'w-1.5 h-1.5', text: 'text-xs' },
        md: { spinner: 'w-8 h-8 border-2', dot: 'w-2 h-2', text: 'text-sm' },
        lg: { spinner: 'w-12 h-12 border-3', dot: 'w-2.5 h-2.5', text: 'text-base' },
        xl: { spinner: 'w-16 h-16 border-4', dot: 'w-3 h-3', text: 'text-lg' }
    };

    const currentSize = sizes[size] || sizes.md;

    const Spinner = () => (
        <div
            className={`${currentSize.spinner} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
        />
    );

    const Dots = () => (
        <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={`${currentSize.dot} bg-brand-500 rounded-full animate-pulse`}
                    style={{ animationDelay: `${i * 150}ms` }}
                />
            ))}
        </div>
    );

    const Pulse = () => (
        <div className="relative">
            <div className={`${currentSize.spinner} bg-brand-100 rounded-full`} />
            <div
                className={`absolute inset-0 ${currentSize.spinner} bg-brand-500 rounded-full animate-ping opacity-75`}
            />
        </div>
    );

    const renderLoader = () => {
        switch (variant) {
            case 'dots':
                return <Dots />;
            case 'pulse':
                return <Pulse />;
            default:
                return <Spinner />;
        }
    };

    const content = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            {renderLoader()}
            {text && (
                <p className={`${currentSize.text} text-slate-500 font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                {content}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                {content}
            </div>
        );
    }

    return content;
};

// Skeleton loading component
export const Skeleton = ({
    width = 'w-full',
    height = 'h-4',
    rounded = 'rounded-lg',
    className = ''
}) => (
    <div
        className={`${width} ${height} ${rounded} shimmer ${className}`}
    />
);

// Card skeleton for common patterns
export const CardSkeleton = ({ className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
            <Skeleton width="w-12" height="h-12" rounded="rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton width="w-1/3" height="h-4" />
                <Skeleton width="w-1/2" height="h-3" />
            </div>
        </div>
        <Skeleton height="h-3" className="mb-2" />
        <Skeleton height="h-3" width="w-2/3" />
    </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ cols = 4 }) => (
    <tr>
        {[...Array(cols)].map((_, i) => (
            <td key={i} className="px-4 py-3">
                <Skeleton height="h-4" width={i === 0 ? 'w-1/2' : 'w-full'} />
            </td>
        ))}
    </tr>
);

export default Loading;
