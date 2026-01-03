/**
 * Authentication API Service
 */

import api from './axios';

export const authAPI = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Logout user
    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/logout', { refreshToken });
        return response.data;
    },

    // Refresh access token
    refreshToken: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh-token', { refreshToken });
        return response.data;
    },

    // Verify email
    verifyEmail: async (token) => {
        const response = await api.post('/auth/verify-email', { token });
        return response.data;
    },

    // Resend verification email
    resendVerification: async (email) => {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
    },

    // Request password reset
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password with token
    resetPassword: async (token, password, confirmPassword) => {
        const response = await api.post('/auth/reset-password', { 
            token, 
            password, 
            confirmPassword 
        });
        return response.data;
    },

    // Change password (logged in)
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        const response = await api.post('/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword
        });
        return response.data;
    },

    // Get current user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export default authAPI;
