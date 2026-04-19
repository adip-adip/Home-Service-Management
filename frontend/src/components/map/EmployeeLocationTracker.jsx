/**
 * Employee Location Tracker Component
 * UI for employee to start/stop location sharing
 * Shows ONLY customer location on map (destination)
 */

import { useState, useEffect } from 'react';
import { FiNavigation, FiX, FiAlertCircle, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { useEmployeeLocationSharing } from '../../hooks/useLocationTracking';
import LiveLocationMap from './LiveLocationMap';

const EmployeeLocationTracker = ({ bookingId, customerLocation, serviceAddress, onClose }) => {
    const [trackingEnabled, setTrackingEnabled] = useState(false);
    const [customerCoords, setCustomerCoords] = useState(customerLocation);
    const [geocoding, setGeocoding] = useState(false);
    const [gpsRetrying, setGpsRetrying] = useState(false);

    const {
        isSharing,
        error,
        currentLocation,
        stopSharing,
        retryLocation
    } = useEmployeeLocationSharing(bookingId, trackingEnabled);

    // Geocode service address to coordinates if no customerLocation provided
    useEffect(() => {
        if (customerLocation) {
            setCustomerCoords(customerLocation);
            return;
        }

        if (!serviceAddress) return;

        const geocodeAddress = async () => {
            setGeocoding(true);
            try {
                // Use OpenStreetMap Nominatim API (free)
                const query = encodeURIComponent(serviceAddress);
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
                    { headers: { 'User-Agent': 'GharSewa/1.0' } }
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    setCustomerCoords({
                        latitude: parseFloat(data[0].lat),
                        longitude: parseFloat(data[0].lon)
                    });
                }
            } catch (err) {
                console.error('Geocoding failed:', err);
            } finally {
                setGeocoding(false);
            }
        };

        geocodeAddress();
    }, [customerLocation, serviceAddress]);

    const handleToggleTracking = () => {
        if (trackingEnabled) {
            setTrackingEnabled(false);
            stopSharing();
        } else {
            setTrackingEnabled(true);
        }
    };

    const handleRetryGps = async () => {
        setGpsRetrying(true);
        if (retryLocation) {
            await retryLocation();
        }
        setTimeout(() => setGpsRetrying(false), 2000);
    };

    // Check if GPS is working
    const isGpsWorking = isSharing && currentLocation;
    const isGpsFailing = isSharing && !currentLocation && !error;

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isGpsWorking ? 'bg-green-100' : isSharing ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <FiNavigation className={`w-5 h-5 ${isGpsWorking ? 'text-green-600' : isSharing ? 'text-yellow-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Location Sharing</h3>
                        <p className="text-sm text-gray-500">
                            {isGpsWorking
                                ? 'Your location is being shared with the customer'
                                : isGpsFailing
                                    ? 'Waiting for GPS signal...'
                                    : 'Share your location with the customer'
                            }
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-700">{error}</p>
                        {(error.includes('permission') || error.includes('location')) && (
                            <p className="text-xs text-red-600 mt-1">
                                Please enable location access in your browser settings.
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleRetryGps}
                        disabled={gpsRetrying}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${gpsRetrying ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            )}

            {/* GPS Warning - when sharing is active but no location captured */}
            {isGpsFailing && (
                <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-yellow-800 font-medium">Acquiring GPS signal...</p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Make sure location services are enabled. This may take a few moments.
                            </p>
                        </div>
                        <button
                            onClick={handleRetryGps}
                            disabled={gpsRetrying}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded transition-colors"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${gpsRetrying ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            )}

            {/* Map - Shows ONLY customer location (destination) */}
            <div className="p-4">
                <LiveLocationMap
                    customerLocation={customerCoords}
                    isEmployeeOnline={false}
                    showOnlyCustomer={true}
                    isLoading={geocoding}
                    height="300px"
                    className="mb-4"
                />

                {/* Destination Address */}
                {serviceAddress && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                            <FiMapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-blue-600 font-medium mb-1">Customer Location (Destination)</p>
                                <p className="text-sm text-blue-800">{serviceAddress}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sharing Status - only show when GPS is working */}
                {isGpsWorking && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-green-700">Sharing your location with customer</p>
                            </div>
                            <p className="text-xs text-green-600">
                                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Toggle Button */}
                <button
                    onClick={handleToggleTracking}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        isSharing
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    <FiNavigation className={isSharing ? '' : 'animate-pulse'} />
                    {isSharing ? 'Stop Sharing Location' : 'Start Sharing Location'}
                </button>

                {/* Info Text */}
                <p className="text-xs text-gray-500 text-center mt-3">
                    {isSharing
                        ? isGpsWorking
                            ? 'The customer can see your real-time location on their map.'
                            : 'Waiting for your device to provide location data...'
                        : 'Your location will be shared every 5 seconds while active.'
                    }
                </p>
            </div>
        </div>
    );
};

export default EmployeeLocationTracker;
