/**
 * Worker Dashboard Component
 * Main dashboard for workers showing jobs, profile status, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiBriefcase, 
    FiFileText, 
    FiUser, 
    FiActivity,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiAlertTriangle,
    FiUpload
} from 'react-icons/fi';
import { bookingAPI, userAPI, documentAPI } from '../../api';
import { Button } from '../../components/common';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const WorkerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [jobsResponse, documentsResponse] = await Promise.all([
                bookingAPI.getMyJobs({ limit: 5 }),
                documentAPI.getUserDocuments()
            ]);
            
            const jobs = jobsResponse.data?.bookings || [];
            setRecentJobs(jobs);
            setDocuments(documentsResponse.data?.documents || []);
            
            // Calculate stats
            const pendingJobs = jobs.filter(job => job.status === 'pending').length;
            const completedJobs = jobs.filter(job => job.status === 'completed').length;
            const approvedDocs = documentsResponse.data?.documents?.filter(doc => doc.status === 'approved').length || 0;
            const pendingDocs = documentsResponse.data?.documents?.filter(doc => doc.status === 'pending').length || 0;
            
            setStats({
                pendingJobs,
                completedJobs,
                totalJobs: jobs.length,
                approvedDocs,
                pendingDocs,
                totalDocs: documentsResponse.data?.documents?.length || 0
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getVerificationStatus = () => {
        if (!documents.length) return 'not_submitted';
        if (documents.some(doc => doc.status === 'pending')) return 'pending';
        if (documents.every(doc => doc.status === 'approved')) return 'approved';
        return 'rejected';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600';
            case 'pending': return 'text-yellow-600';
            case 'rejected': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <FiCheckCircle className="w-5 h-5" />;
            case 'pending': return <FiClock className="w-5 h-5" />;
            case 'rejected': return <FiXCircle className="w-5 h-5" />;
            default: return <FiAlertTriangle className="w-5 h-5" />;
        }
    };

    const verificationStatus = getVerificationStatus();

    const quickActions = [
        {
            title: 'View All Jobs',
            description: 'See all your assigned jobs',
            icon: <FiBriefcase className="w-6 h-6" />,
            action: () => navigate('/dashboard/employee-jobs'),
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            title: 'Upload Documents',
            description: 'Upload verification documents',
            icon: <FiUpload className="w-6 h-6" />,
            action: () => navigate('/dashboard/worker-documents'),
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            title: 'Update Profile',
            description: 'Manage your profile information',
            icon: <FiUser className="w-6 h-6" />,
            action: () => navigate('/dashboard/profile'),
            color: 'bg-purple-500 hover:bg-purple-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={fetchDashboardData}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.firstName || 'Worker'}!</p>
            </div>

            {/* Verification Status Alert */}
            {verificationStatus !== 'approved' && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                    verificationStatus === 'pending' 
                        ? 'bg-yellow-50 border-yellow-400' 
                        : verificationStatus === 'rejected'
                        ? 'bg-red-50 border-red-400'
                        : 'bg-gray-50 border-gray-400'
                }`}>
                    <div className="flex items-center">
                        <div className={`mr-3 ${getStatusColor(verificationStatus)}`}>
                            {getStatusIcon(verificationStatus)}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">
                                {verificationStatus === 'pending' && 'Verification Pending'}
                                {verificationStatus === 'rejected' && 'Verification Required'}
                                {verificationStatus === 'not_submitted' && 'Documents Required'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {verificationStatus === 'pending' && 'Your documents are being reviewed by admin.'}
                                {verificationStatus === 'rejected' && 'Some documents were rejected. Please resubmit.'}
                                {verificationStatus === 'not_submitted' && 'Please upload your verification documents to start working.'}
                            </p>
                            <Button 
                                onClick={() => navigate('/dashboard/worker-documents')}
                                className="mt-2 text-sm"
                                variant="outline"
                            >
                                {verificationStatus === 'not_submitted' ? 'Upload Documents' : 'View Documents'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs || 0}</p>
                        </div>
                        <FiBriefcase className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Jobs</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats?.pendingJobs || 0}</p>
                        </div>
                        <FiClock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completed Jobs</p>
                            <p className="text-2xl font-bold text-green-600">{stats?.completedJobs || 0}</p>
                        </div>
                        <FiCheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Jobs */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                        <Button 
                            onClick={() => navigate('/dashboard/employee-jobs')}
                            variant="outline"
                            size="sm"
                        >
                            View All
                        </Button>
                    </div>
                    
                    {recentJobs.length > 0 ? (
                        <div className="space-y-3">
                            {recentJobs.slice(0, 5).map((job) => (
                                <div key={job._id} className="border rounded-lg p-3 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{job.service?.name || 'Service'}</h3>
                                            <p className="text-sm text-gray-600">{job.customer?.firstName} {job.customer?.lastName}</p>
                                            <p className="text-sm text-gray-500">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No recent jobs found</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className={`w-full text-left p-4 rounded-lg text-white transition-colors ${action.color}`}
                            >
                                <div className="flex items-center">
                                    <div className="mr-4">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{action.title}</h3>
                                        <p className="text-sm opacity-90">{action.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Document Status */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                        <FiFileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Total Documents</p>
                        <p className="text-xl font-bold text-gray-900">{stats?.totalDocs || 0}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-xl font-bold text-green-600">{stats?.approvedDocs || 0}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <FiClock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">{stats?.pendingDocs || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;