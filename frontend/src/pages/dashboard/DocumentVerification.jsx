/**
 * Document Verification Component (Admin)
 */

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { Button } from '../../components/common';

const DocumentVerification = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [reason, setReason] = useState('');
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null);
    const [currentDocumentId, setCurrentDocumentId] = useState(null);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getPendingEmployees();
            setPendingUsers(response.data.employees || []);
        } catch (error) {
            console.error('Error fetching pending users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDocuments = async (userId) => {
        try {
            setLoading(true);
            const response = await adminAPI.getEmployeeDocuments(userId);
            setDocuments(response.data.documents || []);
            setSelectedUser(pendingUsers.find(user => user._id === userId));
        } catch (error) {
            console.error('Error fetching user documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentAction = (documentId, action) => {
        setCurrentDocumentId(documentId);
        setCurrentAction(action);
        setReason('');
        
        if (action === 'reject') {
            setShowReasonModal(true);
        } else {
            verifyDocument(documentId, action, '');
        }
    };

    const verifyDocument = async (documentId, action, reasonText) => {
        if (!selectedUser) {
            alert('No user selected');
            return;
        }
        try {
            setVerifying(true);
            await adminAPI.verifyDocument(selectedUser._id, documentId, action, reasonText);
            
            await fetchUserDocuments(selectedUser._id);
            await fetchPendingUsers();
            
            alert(`Document ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
            setShowReasonModal(false);
        } catch (error) {
            console.error('Error verifying document:', error);
            alert(`Failed to ${action} document: ${error.response?.data?.message || error.message}`);
        } finally {
            setVerifying(false);
        }
    };

    const handleReasonSubmit = () => {
        if (currentAction === 'reject' && !reason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        
        verifyDocument(currentDocumentId, currentAction, reason);
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading && !selectedUser) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Loading pending users...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Document Verification</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Users List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Pending Employees ({pendingUsers.length})</h3>
                    </div>
                    {pendingUsers.length === 0 ? (
                        <p className="p-4 text-gray-500 text-center">No pending employees</p>
                    ) : (
                        <div className="max-h-[600px] overflow-y-auto">
                            {pendingUsers.map((user) => (
                                <div 
                                    key={user._id} 
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                    onClick={() => fetchUserDocuments(user._id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{user.firstName} {user.lastName}</h4>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Services: {user.employeeProfile?.serviceCategories?.join(', ') || 'Not specified'}
                                            </p>
                                        </div>
                                        {getStatusBadge(user.employeeProfile?.status || 'pending')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Documents Panel */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                    {selectedUser ? (
                        <>
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">
                                    Documents for {selectedUser.firstName} {selectedUser.lastName}
                                </h3>
                            </div>
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading documents...</div>
                            ) : documents.length === 0 ? (
                                <p className="p-8 text-center text-gray-500">No documents uploaded yet</p>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {documents.map((doc) => (
                                        <div key={doc._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="font-medium text-gray-800 capitalize">
                                                    {(doc.docType || doc.type || '').replace('_', ' ')}
                                                </h4>
                                                {getStatusBadge(doc.status)}
                                            </div>
                                            
                                            <div className="text-sm text-gray-500 space-y-1 mb-4">
                                                <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                {doc.verifiedAt && (
                                                    <p>Reviewed: {new Date(doc.verifiedAt).toLocaleDateString()}</p>
                                                )}
                                                {doc.rejectionReason && (
                                                    <p className="text-red-600">Reason: {doc.rejectionReason}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                >
                                                    View Document
                                                </a>

                                                {doc.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleDocumentAction(doc._id, 'verify')}
                                                            disabled={verifying}
                                                            size="small"
                                                            variant="success"
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDocumentAction(doc._id, 'reject')}
                                                            disabled={verifying}
                                                            size="small"
                                                            variant="danger"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>Select an employee to view their documents</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reason Modal */}
            {showReasonModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject Document</h3>
                        <p className="text-gray-600 mb-4">Please provide a reason for rejecting this document:</p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none mb-4"
                        />
                        <div className="flex justify-end gap-3">
                            <Button 
                                onClick={() => setShowReasonModal(false)}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleReasonSubmit}
                                disabled={verifying}
                                variant="danger"
                            >
                                {verifying ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVerification;