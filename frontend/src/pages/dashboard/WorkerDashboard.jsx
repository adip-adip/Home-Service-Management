/**
 * Worker Dashboard Component
 * Main dashboard for workers showing jobs, profile status, and quick actions
 * Updated with premium theme styling
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBriefcase,
    FiFileText,
    FiUser,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiAlertTriangle,
    FiUpload,
    FiChevronRight,
    FiTrendingUp
} from 'react-icons/fi';
import { bookingAPI, documentAPI } from '../../api';
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
            case 'approved': return 'text-emerald-600';
            case 'pending': return 'text-amber-600';
            case 'rejected': return 'text-red-600';
            default: return 'text-slate-600';
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
            icon: <FiBriefcase className="w-5 h-5" />,
            action: () => navigate('/dashboard/jobs'),
            color: 'bg-brand-500 hover:bg-brand-600'
        },
        {
            title: 'Upload Documents',
            description: 'Upload verification documents',
            icon: <FiUpload className="w-5 h-5" />,
            action: () => navigate('/dashboard/worker-documents'),
            color: 'bg-emerald-500 hover:bg-emerald-600'
        },
        {
            title: 'Update Profile',
            description: 'Manage your profile information',
            icon: <FiUser className="w-5 h-5" />,
            action: () => navigate('/dashboard/profile'),
            color: 'bg-violet-500 hover:bg-violet-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-slate-700 font-medium mb-2">Something went wrong</p>
                    <p className="text-slate-500 text-sm mb-4">{error}</p>
                    <Button onClick={fetchDashboardData}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Worker Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, {user?.firstName || 'Worker'}!</p>
            </div>

            {/* Verification Status Alert */}
            {verificationStatus !== 'approved' && (
                <div className={`p-5 rounded-2xl border ${
                    verificationStatus === 'pending'
                        ? 'bg-amber-50 border-amber-200'
                        : verificationStatus === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                            verificationStatus === 'pending' ? 'bg-amber-100' :
                            verificationStatus === 'rejected' ? 'bg-red-100' : 'bg-slate-100'
                        }`}>
                            <span className={getStatusColor(verificationStatus)}>
                                {getStatusIcon(verificationStatus)}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                                {verificationStatus === 'pending' && 'Verification Pending'}
                                {verificationStatus === 'rejected' && 'Verification Required'}
                                {verificationStatus === 'not_submitted' && 'Documents Required'}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                                {verificationStatus === 'pending' && 'Your documents are being reviewed by admin.'}
                                {verificationStatus === 'rejected' && 'Some documents were rejected. Please resubmit.'}
                                {verificationStatus === 'not_submitted' && 'Please upload your verification documents to start working.'}
                            </p>
                            <button
                                onClick={() => navigate('/dashboard/worker-documents')}
                                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                {verificationStatus === 'not_submitted' ? 'Upload Documents' : 'View Documents'}
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-brand-200 transition-colors shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Jobs</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalJobs || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                            <FiBriefcase className="w-6 h-6 text-brand-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-200 transition-colors shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Jobs</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{stats?.pendingJobs || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <FiClock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 transition-colors shadow-sm hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed Jobs</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats?.completedJobs || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <FiCheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Jobs */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Recent Jobs</h2>
                        <button
                            onClick={() => navigate('/dashboard/jobs')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
                        >
                            View All
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {recentJobs.length > 0 ? (
                            recentJobs.slice(0, 5).map((job) => (
                                <div key={job._id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-slate-900 truncate">
                                                {job.service?.name || job.serviceCategory || 'Service'}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {job.customer?.firstName} {job.customer?.lastName}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`flex-shrink-0 ml-3 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                                            job.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                            job.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                            job.status === 'in-progress' || job.status === 'in_progress' ? 'bg-brand-50 text-brand-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {job.status.replace('-', ' ').replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FiBriefcase className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 text-sm">No recent jobs found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-semibold text-slate-900">Quick Actions</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className={`w-full text-left p-4 rounded-xl text-white transition-all hover:shadow-lg active:scale-[0.98] ${action.color}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                        {action.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{action.title}</h3>
                                        <p className="text-sm text-white/80">{action.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Document Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Document Status</h2>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-5 bg-slate-50 rounded-xl">
                            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <FiFileText className="w-6 h-6 text-brand-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Total Documents</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalDocs || 0}</p>
                        </div>
                        <div className="text-center p-5 bg-emerald-50 rounded-xl">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Approved</p>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.approvedDocs || 0}</p>
                        </div>
                        <div className="text-center p-5 bg-amber-50 rounded-xl">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <FiClock className="w-6 h-6 text-amber-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{stats?.pendingDocs || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
