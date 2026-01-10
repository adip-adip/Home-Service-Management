/**
 * Input Component
 */

import { forwardRef } from 'react';

const Input = forwardRef(({ 
    label,
    type = 'text',
    error,
    icon,
    className = '',
    ...props 
}, ref) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none
                        ${icon ? 'pl-10' : ''}
                        ${error 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        }
                        placeholder:text-gray-400`}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-sm text-red-500">
                    {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
