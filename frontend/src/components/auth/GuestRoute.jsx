/**
 * Guest Route Component
 * Redirects to dashboard if user is already authenticated
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Loading } from '../common';

const GuestRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="page-loading">
                <Loading size="large" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default GuestRoute;
