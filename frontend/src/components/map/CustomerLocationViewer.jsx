/**
 * Customer Location Viewer Component
 * Displays live employee location for customers
 * Shows ONLY employee location on map (provider coming to them)
 */

import { useState } from 'react';
import { FiMapPin, FiRefreshCw, FiX, FiNavigation } from 'react-icons/fi';
import { useCustomerLocationTracking } from '../../hooks/useLocationTracking';
import LiveLocationMap from './LiveLocationMap';

const CustomerLocationViewer = ({ bookingId, serviceAddress, onClose }) => {
    const [enabled, setEnabled] = useState(true);

    const {
        employeeLocation,
        previousLocation,
        isEmployeeOnline,
        isConnected,
        error
    } = useCustomerLocationTracking(bookingId, enabled);

    const handleRetry = () => {
        setEnabled(false);
        setTimeout(() => {
            setEnabled(true);
        }, 100);
    };

    const getLastUpdateTime = () => {
        if (!employeeLocation?.timestamp) return null;
        const diff = Date.now() - employeeLocation.timestamp;
        if (diff < 60000) return 'Just now';
        if (diff < 300000) return `${Math.floor(diff / 60000)} min ago`;
        return 'Over 5 min ago';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isEmployeeOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <FiNavigation className={`w-5 h-5 ${isEmployeeOnline ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Track Service Provider</h3>
                        <p className="text-sm text-gray-500">
                            {isEmployeeOnline
                                ? 'Provider is sharing their live location'
                                : 'Waiting for provider to share location'
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isConnected && (
                        <button
                            onClick={handleRetry}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="Retry connection"
                        >
                            <FiRefreshCw className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiX className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* Connection Status */}
            {!isConnected && !error && (
                <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-yellow-700">Connecting to tracking service...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Map - Shows ONLY employee location */}
            <div className="p-4">
                <LiveLocationMap
                    employeeLocation={employeeLocation}
                    previousLocation={previousLocation}
                    isEmployeeOnline={isEmployeeOnline}
                    showOnlyEmployee={true}
                    height="350px"
                    className="mb-4"
                />

                {/* Status Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Provider Status</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isEmployeeOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className={`text-sm font-medium ${isEmployeeOnline ? 'text-green-700' : 'text-gray-600'}`}>
                                {isEmployeeOnline ? 'Live Tracking' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Last Update</p>
                        <p className="text-sm font-medium text-gray-700">
                            {getLastUpdateTime() || 'No data yet'}
                        </p>
                    </div>
                </div>

                {/* Your Service Address */}
                {serviceAddress && (
                    <div className="mt-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <FiMapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Your Service Address</p>
                                <p className="text-sm text-gray-700">{serviceAddress}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Footer */}
                {!isEmployeeOnline && (
                    <p className="text-xs text-gray-500 text-center mt-4">
                        The service provider will appear on the map once they start sharing their location.
                    </p>
                )}
            </div>
        </div>
    );
};

export default CustomerLocationViewer;
