/**
 * Reset Password Component
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api';
import { Button, Input } from '../../components/common';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error('Invalid reset link');
            navigate('/login');
            return;
        }
        setToken(tokenParam);
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await authAPI.resetPassword(token, formData.password, formData.confirmPassword);
            
            if (result.success) {
                toast.success('Password reset successfully! Please login with your new password');
                navigate('/login');
            } else {
                toast.error(result.message || 'Password reset failed');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error(error.response?.data?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-600">Enter your new password below</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="New Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={!formData.password || !formData.confirmPassword}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Remember your password?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;