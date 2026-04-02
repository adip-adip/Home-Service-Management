/**
 * Auth Layout Component
 * Simple wrapper for auth pages (pages have their own layouts)
 */

import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    // Auth pages (Login, Register, ForgotPassword) have their own full-page layouts
    // This component just passes through to the child routes
    return <Outlet />;
};

export default AuthLayout;
