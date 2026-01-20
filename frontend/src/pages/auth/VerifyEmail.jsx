/**
 * Email Verification Component
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { Button } from '../../components/common';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState(null);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                toast.error('Invalid verification link');
                navigate('/login');
                return;
            }

            try {
                const result = await authAPI.verifyEmail(token);
                
                if (result.success) {
                    setVerificationStatus('success');
                    toast.success('Email verified successfully!');
                } else {
                    setVerificationStatus('error');
                    toast.error(result.message || 'Email verification failed');
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setVerificationStatus('error');
                toast.error(error.response?.data?.message || 'Email verification failed');
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
                    <p className="text-gray-600">Please wait while we verify your email address</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {verificationStatus === 'success' ? (
                        <>
                            {/* Success State */}
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                            <p className="text-gray-600 mb-6">
                                Your email has been successfully verified. You can now sign in to your account.
                            </p>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                Continue to Sign In
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Error State */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                            <p className="text-gray-600 mb-6">
                                The verification link is invalid or has expired. Please try requesting a new verification email.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full"
                                >
                                    Back to Sign In
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="w-full text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Request New Verification Email
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;