/**
 * Unauthorized Page
 */

import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiHome } from 'react-icons/fi';
import { Button } from '../components/common';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FiAlertTriangle className="text-4xl text-yellow-600" />
                </div>
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You don't have permission to access this page.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <Link to="/dashboard">
                        <Button>
                            <FiArrowLeft /> Go to Dashboard
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button variant="outline">
                            <FiHome /> Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
