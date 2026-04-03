/**
 * Worker Documents Page
 * Allows workers to upload and manage their verification documents
 * Updated with premium theme styling
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
    FiRefreshCw,
    FiShield,
    FiCreditCard,
    FiAward,
    FiBookOpen,
    FiHome,
    FiDollarSign,
    FiBriefcase
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
        { value: 'id_card', label: 'Government ID Card', required: true, icon: FiCreditCard },
        { value: 'license', label: 'Professional License', required: false, icon: FiAward },
        { value: 'certificate', label: 'Training Certificate', required: false, icon: FiBookOpen },
        { value: 'address_proof', label: 'Address Proof', required: true, icon: FiHome },
        { value: 'bank_statement', label: 'Bank Statement', required: false, icon: FiDollarSign },
        { value: 'experience_letter', label: 'Experience Letter', required: false, icon: FiBriefcase }
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentAPI.getUserDocuments();
            setDocuments(response.data?.documents || []);

            // Extract uploaded document types
            const uploadedTypes = (response.data?.documents || []).map(doc => doc.docType || doc.type);
            setDocumentTypes(uploadedTypes);
        } catch (error) {
            console.error('Error fetching documents:', error);
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

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        try {
            setUploading(true);
            await documentAPI.uploadDocument(null, {
                file,
                type: documentType
            });

            toast.success('Document uploaded successfully');
            setSelectedFiles(prev => ({
                ...prev,
                [documentType]: null
            }));

            await fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
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
                return <FiCheckCircle className="w-5 h-5 text-emerald-600" />;
            case 'pending':
                return <FiClock className="w-5 h-5 text-amber-600" />;
            case 'rejected':
                return <FiXCircle className="w-5 h-5 text-red-600" />;
            default:
                return <FiFile className="w-5 h-5 text-slate-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Loading documents...</p>
                </div>
            </div>
        );
    }

    const overallStatus = getOverallStatus();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Verification Documents</h1>
                    <p className="text-slate-500 mt-1">Upload and manage your verification documents</p>
                </div>
                <button
                    onClick={fetchDocuments}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Overall Status Card */}
            <div className={`p-6 rounded-2xl border ${
                overallStatus === 'approved'
                    ? 'bg-emerald-50 border-emerald-200'
                    : overallStatus === 'pending'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            overallStatus === 'approved' ? 'bg-emerald-100' :
                            overallStatus === 'pending' ? 'bg-amber-100' : 'bg-slate-100'
                        }`}>
                            {overallStatus === 'approved' && <FiCheckCircle className="w-6 h-6 text-emerald-600" />}
                            {overallStatus === 'pending' && <FiClock className="w-6 h-6 text-amber-600" />}
                            {(overallStatus === 'not_submitted' || overallStatus === 'partial_rejected') &&
                                <FiAlertTriangle className="w-6 h-6 text-slate-600" />}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                {overallStatus === 'approved' && 'All Documents Approved'}
                                {overallStatus === 'pending' && 'Documents Under Review'}
                                {overallStatus === 'not_submitted' && 'Documents Required'}
                                {overallStatus === 'partial_rejected' && 'Action Required'}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                                Required documents: {uploadedRequiredDocs}/{requiredDocsCount} uploaded
                            </p>
                            <div className="mt-3 w-full max-w-xs bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        overallStatus === 'approved' ? 'bg-emerald-500' : 'bg-brand-500'
                                    }`}
                                    style={{ width: `${(uploadedRequiredDocs / requiredDocsCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Types Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {availableDocumentTypes.map((docType) => {
                    const uploadedDoc = getUploadedDocument(docType.value);
                    const isUploaded = !!uploadedDoc;
                    const selectedFile = selectedFiles[docType.value];
                    const docStatus = uploadedDoc?.status || (uploadedDoc?.verified === false ? 'pending' : 'approved');

                    return (
                        <div
                            key={docType.value}
                            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-brand-200 transition-all shadow-sm hover:shadow-md"
                        >
                            {/* Document Header */}
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                                        <docType.icon className="w-5 h-5 text-brand-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {docType.label}
                                            {docType.required && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </h3>
                                        {isUploaded && (
                                            <span className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border capitalize ${getStatusColor(docStatus)}`}>
                                                {getStatusIcon(docStatus)}
                                                {docStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Upload Area */}
                            {!isUploaded && (
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors bg-slate-50/50">
                                    <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <FiUpload className="w-6 h-6 text-brand-600" />
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Upload {docType.label}
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileSelect(docType.value, e.target.files[0])}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-xl file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-brand-50 file:text-brand-700
                                            hover:file:bg-brand-100 file:transition-colors
                                            file:cursor-pointer cursor-pointer"
                                    />
                                    {selectedFile && (
                                        <div className="mt-4 p-3 bg-brand-50 rounded-xl">
                                            <p className="text-sm text-brand-700 font-medium truncate">
                                                Selected: {selectedFile.name}
                                            </p>
                                            <Button
                                                onClick={() => handleUpload(docType.value)}
                                                disabled={uploading}
                                                className="mt-3 w-full"
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
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                                    <FiFile className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 capitalize truncate">
                                                        {(uploadedDoc.docType || uploadedDoc.name || '').replace('_', ' ')}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Uploaded {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {uploadedDoc.url && (
                                                    <button
                                                        onClick={() => window.open(uploadedDoc.url, '_blank')}
                                                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                        title="View document"
                                                    >
                                                        <FiEye className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(uploadedDoc._id)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete document"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {docStatus === 'rejected' && uploadedDoc.rejectionReason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-700">
                                                    <strong>Rejection Reason:</strong> {uploadedDoc.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Re-upload option for rejected documents */}
                                    {docStatus === 'rejected' && (
                                        <div className="border-2 border-dashed border-red-200 rounded-xl p-4 text-center bg-red-50/50">
                                            <p className="text-sm text-red-600 mb-3">
                                                Document was rejected. Please upload a new file.
                                            </p>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileSelect(docType.value, e.target.files[0])}
                                                className="block w-full text-sm text-slate-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-xl file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-red-100 file:text-red-700
                                                    hover:file:bg-red-200 file:transition-colors
                                                    file:cursor-pointer cursor-pointer"
                                            />
                                            {selectedFile && (
                                                <Button
                                                    onClick={() => handleUpload(docType.value)}
                                                    disabled={uploading}
                                                    className="mt-3 bg-red-500 hover:bg-red-600"
                                                >
                                                    {uploading ? 'Re-uploading...' : 'Re-upload Document'}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Instructions Card */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiShield className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-brand-900 mb-3">Upload Instructions</h3>
                        <ul className="text-sm text-brand-700 space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                                Accepted formats: PDF, JPG, PNG
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                                Maximum file size: 10MB per document
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                                Ensure documents are clear and readable
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                                Required documents must be uploaded for account activation
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                                Documents will be reviewed within 24-48 hours
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDocuments;
