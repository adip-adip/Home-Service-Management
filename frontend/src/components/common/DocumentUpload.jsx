/**
 * Document Upload Component
 */

import React, { useState, useEffect } from 'react';
import { documentAPI } from '../../api';
import { Button } from '../common';
import { useAuthStore } from '../../store/authStore';

const DocumentUpload = ({ userId = null, onUploadSuccess }) => {
    const { user } = useAuthStore();
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('ID_CARD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const targetUserId = userId || user?.id;

    const documentTypes = [
        { value: 'ID_CARD', label: 'National ID Card' },
        { value: 'PASSPORT', label: 'Passport' },
        { value: 'DRIVING_LICENSE', label: 'Driving License' },
        { value: 'WORK_PERMIT', label: 'Work Permit' },
        { value: 'CERTIFICATE', label: 'Certificate' },
        { value: 'OTHER', label: 'Other' }
    ];

    useEffect(() => {
        if (targetUserId) {
            fetchDocuments();
        }
    }, [targetUserId]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentAPI.getUserDocuments(targetUserId);
            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please select a valid file (JPG, PNG, PDF)');
                return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            setSelectedFile(file);
            setError('');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        try {
            setUploading(true);
            setError('');
            
            await documentAPI.uploadDocument(targetUserId, {
                file: selectedFile,
                type: documentType
            });
            
            // Reset form
            setSelectedFile(null);
            setDocumentType('ID_CARD');
            document.getElementById('document-file').value = '';
            
            // Refresh documents list
            await fetchDocuments();
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
            
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error);
            setError(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await documentAPI.deleteDocument(targetUserId, documentId);
            await fetchDocuments();
            alert('Document deleted successfully!');
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Failed to delete document');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return 'text-green-600';
            case 'rejected': return 'text-red-600';
            case 'pending': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <p className="text-gray-500">Loading documents...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Upload</h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="document-type" className="text-sm font-medium text-gray-700">
                        Document Type:
                    </label>
                    <select
                        id="document-type"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                    >
                        {documentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="document-file" className="text-sm font-medium text-gray-700">
                        Select File:
                    </label>
                    <input
                        type="file"
                        id="document-file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    variant="primary"
                >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
            </form>

            {/* Documents List */}
            <div>
                <h4 className="text-base font-medium text-gray-800 mb-3">Uploaded Documents</h4>
                {documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                            <div key={doc._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="mb-3">
                                    <h5 className="font-medium text-gray-800 capitalize mb-1">
                                        {(doc.docType || doc.type || '').replace('_', ' ')}
                                    </h5>
                                    <p className={`text-sm font-medium ${getStatusColor(doc.status)}`}>
                                        Status: {doc.status}
                                    </p>
                                    {doc.reason && (
                                        <p className="text-sm text-red-600 mt-1">
                                            Reason: {doc.reason}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    >
                                        View
                                    </a>
                                    <button
                                        onClick={() => handleDeleteDocument(doc._id)}
                                        className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={doc.status === 'verified'}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentUpload;