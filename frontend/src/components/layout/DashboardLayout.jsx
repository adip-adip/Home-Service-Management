/**
 * Dashboard Layout Component - Tailwind CSS
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
                    <button 
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
