/**
 * User API Service
 */

import api from './axios';

export const userAPI = {
    // Get user profile
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.patch('/users/profile', userData);
        return response.data;
    },

    // Upload avatar
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Delete avatar
    deleteAvatar: async () => {
        const response = await api.delete('/users/avatar');
        return response.data;
    },

    // Get employees list (for customers)
    getEmployees: async (params = {}) => {
        const response = await api.get('/users/employees', { params });
        return response.data;
    },

    // Get employee details
    getEmployee: async (id) => {
        const response = await api.get(`/users/employees/${id}`);
        return response.data;
    },

    // Employee profile management
    updateEmployeeProfile: async (userData) => {
        const response = await api.patch('/users/employee-profile', userData);
        return response.data;
    },

    // Document management for employees
    uploadDocuments: async (files, documentTypes) => {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('documents', file);
            formData.append('documentTypes', documentTypes[index]);
        });
        const response = await api.post('/users/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyDocuments: async () => {
        const response = await api.get('/users/documents');
        return response.data;
    },

    deleteDocument: async (documentId) => {
        const response = await api.delete(`/users/documents/${documentId}`);
        return response.data;
    }
};

export default userAPI;
