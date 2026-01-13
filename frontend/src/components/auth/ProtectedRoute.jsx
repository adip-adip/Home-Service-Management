/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Loading } from '../common';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="page-loading">
                <Loading size="large" text="Checking authentication..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
