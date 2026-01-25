/**
 * Admin Dashboard Component
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiUsers, 
    FiUserCheck, 
    FiFileText, 
    FiActivity,
    FiBarChart2,
    FiTrendingUp,
    FiAlertTriangle
} from 'react-icons/fi';
import { adminAPI } from '../../api';
import { Button } from '../../components/common';
import { useAuthStore } from '../../store';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [securitySummary, setSecuritySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    useEffect(() => {
        // Only fetch if authenticated and haven't fetched yet
        if (isAuthenticated && user && !hasFetched.current) {
            hasFetched.current = true;
            fetchDashboardData();
        } else if (!isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsResponse = await adminAPI.getDashboardStats();
            
            setStats(statsResponse.data.stats);
            
            // Set mock security summary for now (this should come from API)
            setSecuritySummary({
                successfulLogins: 1256,
                failedLogins: 23,
                securityEvents: 5,
                suspiciousActivities: 0
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const adminCards = [
        {
            title: 'User Management',
            description: 'Manage users, block/unblock accounts, view user details',
            icon: <FiUsers />,
            action: () => navigate('/dashboard/users'),
            color: 'bg-blue-500'
        },
        {
            title: 'Employee Verification',
            description: 'Approve/reject employee applications and documents',
            icon: <FiUserCheck />,
            action: () => navigate('/dashboard/document-verification'),
            color: 'bg-green-500'
        },
        {
            title: 'Document Management',
            description: 'Review and verify employee documents',
            icon: <FiFileText />,
            action: () => navigate('/dashboard/document-verification'),
            color: 'bg-purple-500'
        },
        {
            title: 'System Analytics',
            description: 'View platform usage and performance metrics',
            icon: <FiBarChart2 />,
            action: () => navigate('/dashboard/analytics'),
            color: 'bg-teal-500'
        }
    ];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Manage platform users, security, and system monitoring</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <FiAlertTriangle />
                    {error}
                </div>
            )}

            {/* Quick Stats */}
            {stats && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FiUsers className="text-xl text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
                                <p className="text-sm text-gray-500">Total Users</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <FiUserCheck className="text-xl text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</h3>
                                <p className="text-sm text-gray-500">Verified Employees</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <FiTrendingUp className="text-xl text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.pendingApprovals}</h3>
                                <p className="text-sm text-gray-500">Pending Approvals</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <FiAlertTriangle className="text-xl text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.blockedUsers}</h3>
                                <p className="text-sm text-gray-500">Blocked Users</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Security Summary */}
            {securitySummary && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Summary (Last 7 days)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{securitySummary.successfulLogins}</p>
                                    <p className="text-sm text-gray-500">Successful Logins</p>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Normal</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{securitySummary.failedLogins}</p>
                                    <p className="text-sm text-gray-500">Failed Logins</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${securitySummary.failedLogins > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                    {securitySummary.failedLogins > 50 ? 'Monitor' : 'Normal'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{securitySummary.securityEvents}</p>
                                    <p className="text-sm text-gray-500">Security Events</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${securitySummary.securityEvents > 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {securitySummary.securityEvents > 10 ? 'Alert' : 'Normal'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{securitySummary.suspiciousActivities}</p>
                                    <p className="text-sm text-gray-500">Suspicious Activities</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${securitySummary.suspiciousActivities > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {securitySummary.suspiciousActivities > 0 ? 'Critical' : 'Normal'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Administration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adminCards.map((card, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className={`${card.color} p-4 text-white`}>
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-1">{card.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{card.description}</p>
                                <Button onClick={card.action} size="small">
                                    Access
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Button 
                        onClick={() => navigate('/dashboard/document-verification')}
                    >
                        <FiUserCheck />
                        Review Pending Employees
                    </Button>
                    
                    <Button 
                        onClick={() => navigate('/dashboard/users')}
                        variant="outline"
                    >
                        <FiUsers />
                        Manage Users
                    </Button>
                    
                    <Button 
                        onClick={() => window.location.reload()}
                        variant="ghost"
                    >
                        <FiActivity />
                        Refresh Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;