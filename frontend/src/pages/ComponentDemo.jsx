/**
 * Demo Component Showcase
 * Demonstrates all the new frontend components
 */

import React from 'react';
import { DocumentUpload } from '../../components/common';
import { DocumentVerification, AdminDashboard } from '../dashboard';
import { useAuthStore } from '../../store/authStore';

const ComponentDemo = () => {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Component Showcase</h1>
                    <p className="text-gray-600 mt-2">Demonstration of all new frontend components</p>
                </div>

                <div className="space-y-8">
                    {/* Document Upload Demo */}
                    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                            <h2 className="text-xl font-semibold text-white">Document Upload Component</h2>
                            <p className="text-blue-100 text-sm">Allows users (especially employees) to upload verification documents</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <DocumentUpload 
                                    userId={user?.id}
                                    onUploadSuccess={() => alert('Document uploaded successfully!')}
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-2">Usage Example:</h3>
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">{`<DocumentUpload 
    userId={user?.id}
    onUploadSuccess={() => alert('Success!')}
/>`}</pre>
                                <h4 className="font-medium text-gray-800 mt-4 mb-2">Features:</h4>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    <li>Multiple document type support</li>
                                    <li>File validation (type and size)</li>
                                    <li>Upload progress feedback</li>
                                    <li>Document status tracking</li>
                                    <li>Delete functionality</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Admin Dashboard Demo */}
                    {user?.role === 'admin' && (
                        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                                <h2 className="text-xl font-semibold text-white">Admin Dashboard Component</h2>
                                <p className="text-purple-100 text-sm">Comprehensive admin control panel with statistics and quick actions</p>
                            </div>
                            <div className="p-6">
                                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                                    <AdminDashboard />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-2">Usage Example:</h3>
                                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">{`<AdminDashboard />`}</pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                                            <li>Platform statistics overview</li>
                                            <li>Security metrics dashboard</li>
                                            <li>Quick access to admin functions</li>
                                            <li>Real-time data updates</li>
                                            <li>Responsive design</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Document Verification Demo */}
                    {user?.role === 'admin' && (
                        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                                <h2 className="text-xl font-semibold text-white">Document Verification Component</h2>
                                <p className="text-green-100 text-sm">Admin interface for reviewing and verifying employee documents</p>
                            </div>
                            <div className="p-6">
                                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                                    <DocumentVerification />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-2">Usage Example:</h3>
                                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">{`<DocumentVerification />`}</pre>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                                            <li>Pending employees list</li>
                                            <li>Document preview functionality</li>
                                            <li>Approve/reject actions</li>
                                            <li>Reason tracking for rejections</li>
                                            <li>Real-time status updates</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* API Integration Demo */}
                    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4">
                            <h2 className="text-xl font-semibold text-white">API Integration</h2>
                            <p className="text-indigo-100 text-sm">Backend integration points for all components</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-800 mb-4">New API Services:</h3>
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-blue-600 mb-2">Document API (documentAPI)</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li><code className="bg-gray-100 px-1 rounded">uploadDocument(userId, documentData)</code></li>
                                        <li><code className="bg-gray-100 px-1 rounded">getUserDocuments(userId)</code></li>
                                        <li><code className="bg-gray-100 px-1 rounded">deleteDocument(userId, documentId)</code></li>
                                        <li><code className="bg-gray-100 px-1 rounded">getEmployeeDocuments(userId)</code> - Admin only</li>
                                        <li><code className="bg-gray-100 px-1 rounded">verifyDocument(documentId, action, reason)</code> - Admin only</li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800 mb-4">Backend Requirements:</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-green-600"><span className="mr-2">✅</span> Document upload endpoints</li>
                                    <li className="flex items-center text-green-600"><span className="mr-2">✅</span> Admin document verification</li>
                                    <li className="flex items-center text-green-600"><span className="mr-2">✅</span> Role-based access control</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Testing Instructions */}
                    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4">
                            <h2 className="text-xl font-semibold text-white">Testing in Postman</h2>
                            <p className="text-gray-300 text-sm">API endpoints for testing the backend functionality</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-800 mb-3">Authentication</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <strong className="text-gray-700">Register:</strong>
                                            <code className="block mt-1 text-blue-600">POST /api/v1/auth/register</code>
                                            <span className="text-gray-500 text-xs">Body: {"{ email, password, role }"}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <strong className="text-gray-700">Login:</strong>
                                            <code className="block mt-1 text-blue-600">POST /api/v1/auth/login</code>
                                            <span className="text-gray-500 text-xs">Body: {"{ email, password }"}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium text-gray-800 mb-3">Document Management</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <strong className="text-gray-700">Upload Document:</strong>
                                            <code className="block mt-1 text-blue-600">POST /api/v1/users/{"{userId}"}/documents</code>
                                            <span className="text-gray-500 text-xs">Body: Form-data with file and type</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <strong className="text-gray-700">Verify Document (Admin):</strong>
                                            <code className="block mt-1 text-blue-600">PUT /api/v1/admin/documents/{"{documentId}"}/verify</code>
                                            <span className="text-gray-500 text-xs">Body: {"{ action: 'verify'|'reject', reason }"}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium text-gray-800 mb-3">Admin Functions</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <strong className="text-gray-700">Approve Employee:</strong>
                                            <code className="block mt-1 text-blue-600">PATCH /api/v1/admin/employees/{"{userId}"}/approve</code>
                                            <span className="text-gray-500 text-xs">Headers: Authorization: Bearer {"{token}"}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <strong className="text-gray-700">Document Verification:</strong>
                                            <code className="block mt-1 text-blue-600">PUT /api/v1/admin/documents/{"{documentId}"}/verify</code>
                                            <span className="text-gray-500 text-xs">Headers: Authorization: Bearer {"{token}"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ComponentDemo;