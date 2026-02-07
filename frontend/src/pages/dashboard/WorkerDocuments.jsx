/**
 * Worker Documents Page
 * Allows workers to upload and manage their verification documents
 */

import React, { useState, useEffect } from 'react';
import { 
    FiUpload, 
    FiFile, 
    FiCheckCircle, 
    FiClock, 
    FiXCircle, 
    FiTrash2,
    FiEye,
    FiAlertTriangle,
    FiRefreshCw
} from 'react-icons/fi';
import { documentAPI } from '../../api';
import { Button } from '../../components/common';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const WorkerDocuments = () => {
    const { user } = useAuthStore();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [documentTypes, setDocumentTypes] = useState([]);

    const availableDocumentTypes = [
        { value: 'id_card', label: 'Government ID Card', required: true },
        { value: 'license', label: 'Professional License', required: false },
        { value: 'certificate', label: 'Training Certificate', required: false },
        { value: 'address_proof', label: 'Address Proof', required: true },
        { value: 'bank_statement', label: 'Bank Statement', required: false },
        { value: 'experience_letter', label: 'Experience Letter', required: false }
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            
            // Debug: Log authentication state
            console.log('Fetching documents for user:', user);
            console.log('Has token:', !!localStorage.getItem('accessToken'));
            
            const response = await documentAPI.getUserDocuments();
            setDocuments(response.data?.documents || []);
            
            // Extract uploaded document types
            const uploadedTypes = (response.data?.documents || []).map(doc => doc.docType || doc.type);
            setDocumentTypes(uploadedTypes);
            
            console.log('Documents fetched successfully:', response.data?.documents?.length || 0);
            console.log('Documents:', response.data?.documents);
            console.log('Document types found:', uploadedTypes);
        } catch (error) {
            console.error('Error fetching documents:', error);
            console.error('Error details:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data
            });
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (type, file) => {
        setSelectedFiles(prev => ({
            ...prev,
            [type]: file
        }));
    };

    const handleUpload = async (documentType) => {
        const file = selectedFiles[documentType];
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            setUploading(true);
            
            // Debug: Log current authentication state
            console.log('Current user:', user);
            console.log('Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
            console.log('Upload attempt for document type:', documentType);
            
            await documentAPI.uploadDocument(null, {
                file,
                type: documentType
            });
            
            toast.success('Document uploaded successfully');
            setSelectedFiles(prev => ({
                ...prev,
                [documentType]: null
            }));
            
            // Refresh documents list
            await fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            console.error('Error details:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                data: error.response?.data
            });
            toast.error(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await documentAPI.deleteDocument(null, documentId);
            toast.success('Document deleted successfully');
            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <FiCheckCircle className="w-5 h-5 text-green-600" />;
            case 'pending':
                return <FiClock className="w-5 h-5 text-yellow-600" />;
            case 'rejected':
                return <FiXCircle className="w-5 h-5 text-red-600" />;
            default:
                return <FiFile className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getUploadedDocument = (type) => {
        return documents.find(doc => (doc.docType || doc.type) === type);
    };

    const getOverallStatus = () => {
        if (documents.length === 0) return 'not_submitted';
        if (documents.some(doc => (doc.status || (doc.verified === false ? 'pending' : 'approved')) === 'pending')) return 'pending';
        if (documents.every(doc => (doc.status || (doc.verified === true ? 'approved' : 'pending')) === 'approved')) return 'approved';
        return 'partial_rejected';
    };

    const requiredDocsCount = availableDocumentTypes.filter(type => type.required).length;
    const uploadedRequiredDocs = availableDocumentTypes
        .filter(type => type.required)
        .filter(type => documentTypes.includes(type.value)).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Verification Documents</h1>
                <p className="text-gray-600 mt-2">Upload and manage your verification documents</p>
            </div>

            {/* Overall Status */}
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                getOverallStatus() === 'approved' 
                    ? 'bg-green-50 border-green-400'
                    : getOverallStatus() === 'pending'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-red-50 border-red-400'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="mr-3">
                            {getOverallStatus() === 'approved' && <FiCheckCircle className="w-6 h-6 text-green-600" />}
                            {getOverallStatus() === 'pending' && <FiClock className="w-6 h-6 text-yellow-600" />}
                            {(getOverallStatus() === 'not_submitted' || getOverallStatus() === 'partial_rejected') && 
                                <FiAlertTriangle className="w-6 h-6 text-red-600" />}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">
                                {getOverallStatus() === 'approved' && 'All Documents Approved'}
                                {getOverallStatus() === 'pending' && 'Documents Under Review'}
                                {getOverallStatus() === 'not_submitted' && 'Documents Required'}
                                {getOverallStatus() === 'partial_rejected' && 'Action Required'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Required documents: {uploadedRequiredDocs}/{requiredDocsCount} uploaded
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={fetchDocuments}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                    >
                        <FiRefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Document Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {availableDocumentTypes.map((docType) => {
                    const uploadedDoc = getUploadedDocument(docType.value);
                    const isUploaded = !!uploadedDoc;
                    const selectedFile = selectedFiles[docType.value];

                    return (
                        <div key={docType.value} className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {docType.label}
                                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                                    </h3>
                                    {isUploaded && (
                                        <div className="flex items-center mt-1">
                                            {getStatusIcon(uploadedDoc.status || (uploadedDoc.verified === false ? 'pending' : 'approved'))}
                                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(uploadedDoc.status || (uploadedDoc.verified === false ? 'pending' : 'approved'))}`}>
                                                {uploadedDoc.status || (uploadedDoc.verified === false ? 'pending' : 'approved')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Area */}
                            {!isUploaded && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload {docType.label}
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileSelect(docType.value, e.target.files[0])}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                    />
                                    {selectedFile && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                                            <Button
                                                onClick={() => handleUpload(docType.value)}
                                                disabled={uploading}
                                                className="mt-2"
                                            >
                                                {uploading ? 'Uploading...' : 'Upload Document'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Uploaded Document */}
                            {isUploaded && (
                                <div className="space-y-4">
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <FiFile className="w-5 h-5 text-gray-600 mr-2" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                                        {(uploadedDoc.docType || uploadedDoc.name || '').replace('_', ' ')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Uploaded on {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {uploadedDoc.url && (
                                                    <Button
                                                        onClick={() => window.open(uploadedDoc.url, '_blank')}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => handleDelete(uploadedDoc._id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {uploadedDoc.status === 'rejected' && uploadedDoc.rejectionReason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                                <p className="text-sm text-red-800">
                                                    <strong>Rejection Reason:</strong> {uploadedDoc.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Re-upload option for rejected documents */}
                                    {uploadedDoc.status === 'rejected' && (
                                        <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center">
                                            <p className="text-sm text-red-600 mb-2">
                                                Document was rejected. Please upload a new file.
                                            </p>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileSelect(docType.value, e.target.files[0])}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-red-50 file:text-red-700
                                                    hover:file:bg-red-100"
                                            />
                                            {selectedFile && (
                                                <div className="mt-2">
                                                    <Button
                                                        onClick={() => handleUpload(docType.value)}
                                                        disabled={uploading}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        {uploading ? 'Re-uploading...' : 'Re-upload Document'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Upload Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Accepted formats: PDF, JPG, PNG</li>
                    <li>• Maximum file size: 10MB per document</li>
                    <li>• Ensure documents are clear and readable</li>
                    <li>• Required documents must be uploaded for account activation</li>
                    <li>• Documents will be reviewed within 24-48 hours</li>
                </ul>
            </div>
        </div>
    );
};

export default WorkerDocuments;