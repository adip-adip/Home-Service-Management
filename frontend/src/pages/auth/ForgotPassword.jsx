/**
 * Forgot Password Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { Button, Input } from '../../components/common';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Email is required');
            return;
        }
        
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword(email);
            setIsSubmitted(true);
            toast.success('Password reset link sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-3xl text-green-600">✓</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                        <p className="text-gray-600">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-gray-600">
                            Didn't receive the email?{' '}
                            <button 
                                className="text-blue-600 hover:text-blue-700 font-medium"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Try again
                            </button>
                        </p>
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <FiArrowLeft /> Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                    <p className="text-gray-600">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        error={error}
                        icon={<FiMail />}
                    />

                    <Button 
                        type="submit" 
                        fullWidth 
                        loading={isLoading}
                    >
                        Send Reset Link
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Link 
                        to="/login" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <FiArrowLeft /> Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
