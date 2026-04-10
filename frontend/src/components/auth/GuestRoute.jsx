/**
 * Guest Route Component
 * Redirects to dashboard if user is already authenticated
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Loading } from '../common';

const GuestRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const hasToken = !!localStorage.getItem('accessToken');

    if (isLoading) {
        return (
            <div className="page-loading">
                <Loading size="large" />
            </div>
        );
    }

    if (isAuthenticated && hasToken) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default GuestRoute;
