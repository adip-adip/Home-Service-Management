/**
 * Dashboard Home Page - Simplified Version
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';

const DashboardHome = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            return;
        }

        // Redirect based on user role
        if (user.role === 'employee') {
            navigate('/dashboard/worker', { replace: true });
        } else if (user.role === 'admin') {
            navigate('/dashboard/admin', { replace: true });
        } else if (user.role === 'customer') {
            navigate('/dashboard/bookings', { replace: true });
        }
    }, [user, isAuthenticated, navigate]);

    // Show loading while redirecting
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardHome;
