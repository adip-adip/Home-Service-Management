/**
 * Input Component - Premium Design System
 * Reusable input with multiple variants and states
 */

import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(({
    label,
    type = 'text',
    error,
    hint,
    icon: Icon,
    rightIcon: RightIcon,
    size = 'md',
    optional = false,
    className = '',
    containerClassName = '',
    onFocus,
    onBlur,
    ...props
}, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const sizes = {
        sm: 'py-2 text-sm',
        md: 'py-3',
        lg: 'py-3.5 text-base',
    };

    const handleFocus = (e) => {
        setFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e) => {
        setFocused(false);
        onBlur?.(e);
    };

    return (
        <div className={`flex flex-col gap-2 ${containerClassName}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label}
                    {optional && <span className="text-slate-400 font-normal ml-1">(Optional)</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        focused ? 'text-brand-500' : 'text-slate-400'
                    }`}>
                        <Icon className="w-[18px] h-[18px]" />
                    </div>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`
                        w-full rounded-xl border-2 bg-slate-50
                        transition-all duration-200
                        text-slate-900 placeholder:text-slate-400
                        focus:bg-white focus:outline-none focus:ring-4
                        ${Icon ? 'pl-11' : 'pl-4'}
                        ${(isPassword || RightIcon) ? 'pr-12' : 'pr-4'}
                        ${sizes[size] || sizes.md}
                        ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                            : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
                        }
                        ${className}
                    `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword
                            ? <FiEyeOff className="w-[18px] h-[18px]" />
                            : <FiEye className="w-[18px] h-[18px]" />
                        }
                    </button>
                )}
                {RightIcon && !isPassword && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <RightIcon className="w-[18px] h-[18px]" />
                    </div>
                )}
            </div>
            {error && (
                <p className="text-red-500 text-sm flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0" />
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-slate-500 text-sm">{hint}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
