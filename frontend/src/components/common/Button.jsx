/**
 * Button Component - Premium Design System
 * Reusable button with multiple variants, sizes, and states
 */

import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const variants = {
    primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    brand: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30',
    outline: 'border-2 border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    'outline-brand': 'border-2 border-brand-200 hover:border-brand-300 bg-white text-brand-700 hover:bg-brand-50',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25',
    'danger-outline': 'border-2 border-red-200 hover:border-red-300 bg-white text-red-600 hover:bg-red-50',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    small: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    medium: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-xl gap-2',
    large: 'px-6 py-3.5 text-base rounded-xl gap-2',
    xl: 'px-8 py-4 text-base rounded-xl gap-2.5',
    icon: 'p-2.5 rounded-xl',
    'icon-sm': 'p-2 rounded-lg',
};

const Button = forwardRef(({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    as,
    to,
    href,
    onClick,
    className = '',
    ...props
}, ref) => {
    const baseStyles = `
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
    `;

    const classes = `
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    const content = (
        <>
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
            ) : leftIcon ? (
                <span className="flex-shrink-0">{leftIcon}</span>
            ) : null}
            {children && <span>{children}</span>}
            {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
    );

    // Link (react-router)
    if (to) {
        return (
            <Link to={to} ref={ref} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    // External link
    if (href) {
        return (
            <a href={href} ref={ref} className={classes} {...props}>
                {content}
            </a>
        );
    }

    // Custom component
    if (as) {
        const Component = as;
        return (
            <Component ref={ref} className={classes} disabled={disabled || loading} {...props}>
                {content}
            </Component>
        );
    }

    // Default button
    return (
        <button
            ref={ref}
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {content}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
