/**
 * Loading Spinner Component
 */

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
    const sizeStyles = {
        small: 'w-6 h-6 border-2',
        medium: 'w-10 h-10 border-3',
        large: 'w-16 h-16 border-4'
    };

    const containerStyles = {
        small: 'p-4',
        medium: 'p-8',
        large: 'p-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${containerStyles[size] || containerStyles.medium}`}>
            <div className={`${sizeStyles[size] || sizeStyles.medium} border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
            {text && <p className="text-gray-600 text-sm">{text}</p>}
        </div>
    );
};

export default Loading;
