/**
 * Auth Layout Component
 */

import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left sidebar */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
                <div className="max-w-md mx-auto">
                    <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold mb-8 hover:opacity-90 transition-opacity">
                        <FiHome className="text-3xl" />
                        <span>HomeService</span>
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Welcome to HomeService Platform</h1>
                    <p className="text-lg text-blue-100 mb-8">Connect with skilled professionals for all your home service needs</p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-blue-100">✓ Find verified service providers</li>
                        <li className="flex items-center gap-2 text-blue-100">✓ Book appointments easily</li>
                        <li className="flex items-center gap-2 text-blue-100">✓ Secure payment options</li>
                        <li className="flex items-center gap-2 text-blue-100">✓ Rate and review services</li>
                    </ul>
                </div>
            </div>
            {/* Right main content */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
