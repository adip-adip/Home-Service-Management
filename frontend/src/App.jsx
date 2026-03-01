/**
 * Main App Component with Routing
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Store
import { useAuthStore } from './store';

// Components
import { ProtectedRoute, GuestRoute } from './components/auth';
import { AuthLayout, DashboardLayout } from './components/layout';

// Pages
import { 
    Home, 
    Services,
    About,
    Unauthorized, 
    NotFound,
    TestComponent,
    Login, 
    Register, 
    ForgotPassword,
    ResetPassword,
    VerifyEmail,
    DashboardHome,
    Profile,
    Users,
    CustomerBookings,
    CustomerReview,
    EmployeeJobs,
    CreateBooking,
    BookingDetails,
    DocumentVerification,
    AdminDashboard,
    AdminBookings,
    WorkerDashboard,
    WorkerDocuments,
    WorkerProfile,
    EmployeeSchedule,
    EmployeeEarnings,
    EmployeeReviews,
    DebugDashboard
} from './pages';

// Debug (temporary)
import ApiTest from './debug/ApiTest';
import ApiDebug from './debug/ApiDebug';
import AuthDebugger from './debug/AuthDebugger';

function App() {
    const { fetchUser, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Fetch user on app load if token exists
        const token = localStorage.getItem('accessToken');
        if (token && !isAuthenticated) {
            fetchUser();
        }
    }, [fetchUser, isAuthenticated]);

    return (
        <BrowserRouter>
            {/* Toast notifications */}
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/test" element={<TestComponent />} />
                <Route path="/debug" element={<ApiDebug />} />
                <Route path="/auth-debug" element={<AuthDebugger />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Auth Routes (Guest Only) */}
                <Route element={<GuestRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>
                </Route>

                {/* Protected Routes (All Authenticated Users) */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<DashboardHome />} />
                        <Route path="/dashboard/debug" element={<DebugDashboard />} />
                        <Route path="/dashboard/profile" element={<Profile />} />
                        <Route path="/dashboard/booking/:bookingId" element={<BookingDetails />} />
                        <Route path="/debug/api" element={<ApiTest />} />
                    </Route>
                </Route>

                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard/bookings" element={<CustomerBookings />} />
                        <Route path="/dashboard/book-service" element={<CreateBooking />} />
                        <Route path="/dashboard/booking/:bookingId/review" element={<CustomerReview />} />
                    </Route>
                </Route>

                {/* Employee Routes */}
                <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard/worker" element={<WorkerDashboard />} />
                        <Route path="/dashboard/jobs" element={<EmployeeJobs />} />
                        <Route path="/dashboard/schedule" element={<EmployeeSchedule />} />
                        <Route path="/dashboard/earnings" element={<EmployeeEarnings />} />
                        <Route path="/dashboard/reviews" element={<EmployeeReviews />} />
                        <Route path="/dashboard/worker-documents" element={<WorkerDocuments />} />
                        <Route path="/dashboard/worker-profile" element={<WorkerProfile />} />
                    </Route>
                </Route>

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                        <Route path="/dashboard/users" element={<Users />} />
                        <Route path="/dashboard/employees" element={<Users />} />
                        <Route path="/dashboard/all-bookings" element={<AdminBookings />} />
                        <Route path="/dashboard/document-verification" element={<DocumentVerification />} />
                    </Route>
                </Route>

                {/* 404 - Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
