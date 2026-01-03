/**
 * Document API
 * Handles document upload and verification API calls
 */

import api from './axios';

export const documentAPI = {
    // Upload document for current user
    uploadDocument: async (userId, documentData) => {
        const formData = new FormData();
        formData.append('documents', documentData.file); // Changed from 'document' to 'documents'
        formData.append('documentTypes', documentData.type); // Changed from 'type' to 'documentTypes'
        
        // If userId is current user, use simpler endpoint
        const endpoint = userId ? `/users/${userId}/documents` : '/users/documents';
        
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get user documents (for current user)
    getUserDocuments: async (userId = null) => {
        const endpoint = userId ? `/users/${userId}/documents` : '/users/documents';
        const response = await api.get(endpoint);
        return response.data;
    },

    // Delete document (for current user)
    deleteDocument: async (userId, documentId) => {
        const endpoint = userId ? `/users/${userId}/documents/${documentId}` : `/users/documents/${documentId}`;
        const response = await api.delete(endpoint);
        return response.data;
    },

    // Admin: Get employee documents
    getEmployeeDocuments: async (userId) => {
        const response = await api.get(`/admin/employees/${userId}/documents`);
        return response.data;
    },

    // Admin: Verify document
    verifyDocument: async (documentId, action, reason = '') => {
        const response = await api.put(`/admin/documents/${documentId}/verify`, {
            action,
            reason
        });
        return response.data;
    }
};