/**
 * Live Location Map Component
 * Displays real-time location on a map with smooth animations
 * Uses Leaflet (free, no API key required)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { FiMapPin, FiWifi, FiWifiOff } from 'react-icons/fi';

const LiveLocationMap = ({
    employeeLocation,
    previousLocation,
    customerLocation,
    isEmployeeOnline = false,
    showOnlyEmployee = false,  // Customer view - show only employee marker
    showOnlyCustomer = false,  // Employee view - show only customer marker
    isLoading = false, // Loading state (e.g., geocoding in progress)
    height = '400px',
    className = ''
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const employeeMarkerRef = useRef(null);
    const customerMarkerRef = useRef(null);
    const animationRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [leaflet, setLeaflet] = useState(null);

    // Load Leaflet dynamically
    useEffect(() => {
        const loadLeaflet = async () => {
            if (window.L) {
                setLeaflet(window.L);
                setMapLoaded(true);
                return;
            }

            // Load Leaflet CSS
            if (!document.querySelector('link[href*="leaflet.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // Load Leaflet JS
            if (!document.querySelector('script[src*="leaflet.js"]')) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.async = true;
                script.onload = () => {
                    setLeaflet(window.L);
                    setMapLoaded(true);
                };
                document.body.appendChild(script);
            }
        };

        loadLeaflet();
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapLoaded || !leaflet || !mapRef.current || mapInstanceRef.current) return;

        // Default center (Kathmandu)
        const defaultCenter = [27.7172, 85.3240];
        const center = employeeLocation
            ? [employeeLocation.latitude, employeeLocation.longitude]
            : customerLocation
                ? [customerLocation.latitude, customerLocation.longitude]
                : defaultCenter;

        // Create map
        mapInstanceRef.current = leaflet.map(mapRef.current, {
            center,
            zoom: 15,
            zoomControl: true
        });

        // Add OpenStreetMap tiles (free)
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstanceRef.current);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [mapLoaded, leaflet]);

    // Create custom marker icons
    const createEmployeeIcon = useCallback((heading = 0) => {
        if (!leaflet) return null;

        return leaflet.divIcon({
            className: 'employee-marker',
            html: `
                <div style="
                    width: 40px;
                    height: 40px;
                    position: relative;
                    transform: rotate(${heading}deg);
                    transition: transform 0.5s ease;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                        </svg>
                    </div>
                    <div style="
                        position: absolute;
                        bottom: -8px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 20px;
                        height: 20px;
                        background: rgba(59, 130, 246, 0.3);
                        border-radius: 50%;
                        animation: pulse 2s infinite;
                    "></div>
                </div>
            `,
            iconSize: [40, 48],
            iconAnchor: [20, 24]
        });
    }, [leaflet]);

    const createCustomerIcon = useCallback(() => {
        if (!leaflet) return null;

        return leaflet.divIcon({
            className: 'customer-marker',
            html: `
                <div style="
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }, [leaflet]);

    // Animate marker smoothly between positions
    const animateMarker = useCallback((marker, fromLat, fromLng, toLat, toLng, duration = 1000) => {
        if (!marker) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentLat = fromLat + (toLat - fromLat) * easeProgress;
            const currentLng = fromLng + (toLng - fromLng) * easeProgress;

            marker.setLatLng([currentLat, currentLng]);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        animate();
    }, []);

    // Update employee marker
    useEffect(() => {
        if (!mapInstanceRef.current || !leaflet || !employeeLocation) return;

        const { latitude, longitude, heading = 0 } = employeeLocation;

        if (!employeeMarkerRef.current) {
            // Create new marker
            employeeMarkerRef.current = leaflet.marker([latitude, longitude], {
                icon: createEmployeeIcon(heading)
            }).addTo(mapInstanceRef.current);

            employeeMarkerRef.current.bindPopup(`
                <div style="text-align: center; padding: 5px;">
                    <strong>Service Provider</strong><br/>
                    <small style="color: ${isEmployeeOnline ? '#10B981' : '#6B7280'}">
                        ${isEmployeeOnline ? 'Online' : 'Last known location'}
                    </small>
                </div>
            `);
        } else {
            // Animate to new position
            if (previousLocation) {
                animateMarker(
                    employeeMarkerRef.current,
                    previousLocation.latitude,
                    previousLocation.longitude,
                    latitude,
                    longitude,
                    1000
                );
            } else {
                employeeMarkerRef.current.setLatLng([latitude, longitude]);
            }

            // Update icon rotation for heading
            employeeMarkerRef.current.setIcon(createEmployeeIcon(heading));
        }

        // Pan map to follow employee
        mapInstanceRef.current.panTo([latitude, longitude], { animate: true, duration: 0.5 });

    }, [employeeLocation, previousLocation, leaflet, isEmployeeOnline, createEmployeeIcon, animateMarker]);

    // Update customer marker
    useEffect(() => {
        if (!mapInstanceRef.current || !leaflet || !customerLocation) return;

        const { latitude, longitude } = customerLocation;

        if (!customerMarkerRef.current) {
            customerMarkerRef.current = leaflet.marker([latitude, longitude], {
                icon: createCustomerIcon()
            }).addTo(mapInstanceRef.current);

            customerMarkerRef.current.bindPopup(`
                <div style="text-align: center; padding: 5px;">
                    <strong>Service Location</strong><br/>
                    <small style="color: #6B7280">Customer address</small>
                </div>
            `);
        } else {
            customerMarkerRef.current.setLatLng([latitude, longitude]);
        }

        // Fit bounds if both markers exist
        if (employeeMarkerRef.current && customerMarkerRef.current) {
            const group = leaflet.featureGroup([employeeMarkerRef.current, customerMarkerRef.current]);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2), { animate: true });
        }

    }, [customerLocation, leaflet, createCustomerIcon]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Add pulse animation styles
    useEffect(() => {
        if (!document.querySelector('#live-map-styles')) {
            const style = document.createElement('style');
            style.id = 'live-map-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: translateX(-50%) scale(1); opacity: 0.7; }
                    50% { transform: translateX(-50%) scale(1.5); opacity: 0.3; }
                    100% { transform: translateX(-50%) scale(1); opacity: 0.7; }
                }
                .employee-marker { background: transparent !important; border: none !important; }
                .customer-marker { background: transparent !important; border: none !important; }
            `;
            document.head.appendChild(style);
        }
    }, []);

    if (!mapLoaded) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
                style={{ height }}
            >
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* Map Container */}
            <div
                ref={mapRef}
                style={{ height, width: '100%' }}
                className="rounded-lg overflow-hidden z-0"
            />

            {/* Status Overlay - Only show for employee tracking (customer view) */}
            {showOnlyEmployee && (
                <div className="absolute top-3 right-3 z-10">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        isEmployeeOnline
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                        {isEmployeeOnline ? (
                            <>
                                <FiWifi className="animate-pulse" />
                                <span>Live</span>
                            </>
                        ) : (
                            <>
                                <FiWifiOff />
                                <span>Offline</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur rounded-lg p-2 text-xs shadow-sm">
                {(showOnlyEmployee || (!showOnlyEmployee && !showOnlyCustomer && employeeLocation)) && (
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Service Provider</span>
                    </div>
                )}
                {(showOnlyCustomer || (!showOnlyEmployee && !showOnlyCustomer && customerLocation)) && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>{showOnlyCustomer ? 'Customer Location' : 'Your Location'}</span>
                    </div>
                )}
            </div>

            {/* No location message - for customer view waiting for employee */}
            {showOnlyEmployee && !employeeLocation && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-20">
                    <div className="bg-white rounded-lg p-4 text-center shadow-lg">
                        <FiMapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                            Waiting for provider location...
                        </p>
                    </div>
                </div>
            )}

            {/* No location message - for employee view waiting for customer location */}
            {showOnlyCustomer && !customerLocation && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-20">
                    <div className="bg-white rounded-lg p-4 text-center shadow-lg">
                        {isLoading ? (
                            <>
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">
                                    Locating customer address...
                                </p>
                            </>
                        ) : (
                            <>
                                <FiMapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 text-sm">
                                    Customer location not available
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveLocationMap;
