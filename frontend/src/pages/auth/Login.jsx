/**
 * Login Page - Premium Human-Crafted Design
 * Clean, refined authentication experience
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    const from = location.state?.from?.pathname || '/dashboard';

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const result = await login(formData);

            if (result.success) {
                toast.success('Welcome back!');
                // Delay to show toast before redirecting
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1000);
            } else {
                toast.error(result.error || 'Invalid email or password');
            }
        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-slate-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                {/* Content */}
                <div className="relative flex flex-col justify-between w-full p-10 xl:p-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                            <FiHome className="text-white text-xl" />
                        </div>
                        <span className="font-bold text-2xl text-white tracking-tight">
                            Home<span className="text-brand-400">Service</span>
                        </span>
                    </Link>

                    {/* Main Content */}
                    <div className="max-w-md">
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                            Your home deserves the best care
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed mb-10">
                            Connect with verified professionals for all your home service needs.
                            Quality work, guaranteed satisfaction.
                        </p>

                        {/* Features */}
                        <div className="space-y-4">
                            {[
                                'Verified & background-checked professionals',
                                'Transparent pricing, no hidden fees',
                                'Quality guarantee on every service',
                                'Easy booking & secure payments'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-brand-400 text-xs">✓</span>
                                    </div>
                                    <span className="text-slate-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer text */}
                    <p className="text-slate-500 text-sm">
                        Trusted by thousands of homeowners across Nepal
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <FiHome className="text-white text-lg" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">
                            Home<span className="text-brand-600">Service</span>
                        </span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Welcome back
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                    focusedField === 'email' ? 'text-brand-500' : 'text-slate-400'
                                }`}>
                                    <FiMail className="w-[18px] h-[18px]" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 bg-slate-50 transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                                        errors.email
                                            ? 'border-red-300 focus:border-red-500 focus:bg-white'
                                            : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                                    } focus:outline-none focus:ring-4 focus:ring-brand-500/10`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                    focusedField === 'password' ? 'text-brand-500' : 'text-slate-400'
                                }`}>
                                    <FiLock className="w-[18px] h-[18px]" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl border-2 bg-slate-50 transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                                        errors.password
                                            ? 'border-red-300 focus:border-red-500 focus:bg-white'
                                            : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                                    } focus:outline-none focus:ring-4 focus:ring-brand-500/10`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff className="w-[18px] h-[18px]" /> : <FiEye className="w-[18px] h-[18px]" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-slate-600 mt-8">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
