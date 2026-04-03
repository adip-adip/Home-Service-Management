/**
 * Forgot Password Page - Premium Design
 * Clean, focused password reset experience
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiHome, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword(email);
            setIsSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    // Success State
    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 justify-center mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <FiHome className="text-white text-lg" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">
                            Home<span className="text-brand-600">Service</span>
                        </span>
                    </Link>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-100 flex items-center justify-center">
                            <FiCheck className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h2>
                        <p className="text-slate-600 mb-6">
                            We've sent a password reset link to<br />
                            <strong className="text-slate-900">{email}</strong>
                        </p>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">
                                Didn't receive the email?{' '}
                                <button
                                    className="text-brand-600 hover:text-brand-700 font-medium"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Try again
                                </button>
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Form State
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 justify-center mb-10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                        <FiHome className="text-white text-lg" />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">
                        Home<span className="text-brand-600">Service</span>
                    </span>
                </Link>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Forgot password?
                        </h2>
                        <p className="text-slate-500 mt-2">
                            No worries, we'll send you reset instructions
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                    focused ? 'text-brand-500' : 'text-slate-400'
                                }`}>
                                    <FiMail className="w-[18px] h-[18px]" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border-2 bg-slate-50 transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                                        error
                                            ? 'border-red-300 focus:border-red-500 focus:bg-white'
                                            : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                                    } focus:outline-none focus:ring-4 focus:ring-brand-500/10`}
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
