/**
 * Location Tracking Hook
 * Manages real-time location sharing between employee and customer
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

// Location update interval (ms)
const UPDATE_INTERVAL = 5000; // 5 seconds

// Maximum acceptable accuracy in meters (positions less accurate than this will be ignored)
// Increased to 100m to be more lenient for devices with poor GPS
const MAX_ACCURACY_THRESHOLD = 100; // 100 meters

/**
 * Hook for employee to share their location
 * @param {string} bookingId - Booking ID to track
 * @param {boolean} enabled - Whether tracking is enabled
 */
export const useEmployeeLocationSharing = (bookingId, enabled = false) => {
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);
    const lastUpdateRef = useRef(0);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);

    const startSharing = useCallback(() => {
        if (!bookingId || !enabled) return;

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication required');
            return;
        }

        // Connect to socket
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current.on('connect', () => {
            console.log('Employee location socket connected, socket id:', socketRef.current.id);
            // Start tracking for this booking
            console.log('Emitting location:startTracking for booking:', bookingId);
            socketRef.current.emit('location:startTracking', { bookingId });
        });

        socketRef.current.on('location:trackingStarted', (data) => {
            console.log('Tracking started successfully:', data);
            setIsSharing(true);
            setError(null);
            startWatchingPosition();
        });

        socketRef.current.on('location:error', (data) => {
            console.error('Location error:', data.message);
            setError(data.message);
            setIsSharing(false);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Location socket disconnected');
            setIsSharing(false);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Location socket connection error:', err.message);
            setError('Connection failed');
        });
    }, [bookingId, enabled]);

    const startWatchingPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        // Get initial position with fallback strategy
        const getInitialPosition = (attempt = 1) => {
            const options = {
                1: { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
                2: { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
                3: { enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 }
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Be more lenient with initial position - use higher threshold
                    if (position.coords.accuracy > MAX_ACCURACY_THRESHOLD * 2) {
                        console.log(`Initial position accuracy too low: ${position.coords.accuracy}m, waiting for better position`);
                        return;
                    }

                    const locationData = {
                        bookingId,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        heading: position.coords.heading || 0,
                        speed: position.coords.speed || 0,
                        accuracy: position.coords.accuracy
                    };

                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        heading: position.coords.heading || 0
                    });

                    // Send initial location to server
                    if (socketRef.current?.connected) {
                        socketRef.current.emit('location:update', locationData);
                    }
                },
                (err) => {
                    if (err.code === 3 && attempt < 3) { // TIMEOUT
                        console.log(`Initial position attempt ${attempt} timed out, retrying...`);
                        getInitialPosition(attempt + 1);
                    }
                    // Don't set error for initial position - watchPosition will handle it
                },
                options[attempt] || options[3]
            );
        };

        getInitialPosition(1);

        // Watch position with high accuracy for continuous updates
        // Start with low accuracy for faster initial response, then try high accuracy
        const startWatch = (highAccuracy = false) => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }

            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    // Skip positions with poor accuracy
                    if (position.coords.accuracy > MAX_ACCURACY_THRESHOLD) {
                        console.log(`Position accuracy too low: ${position.coords.accuracy}m, skipping update`);
                        return;
                    }

                    // Clear any previous timeout errors since we got a valid position
                    setError(null);

                    const now = Date.now();
                    // Throttle updates
                    if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;
                    lastUpdateRef.current = now;

                    const locationData = {
                        bookingId,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        heading: position.coords.heading || 0,
                        speed: position.coords.speed || 0,
                        accuracy: position.coords.accuracy
                    };

                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        heading: position.coords.heading || 0
                    });

                    // Send location to server
                    if (socketRef.current?.connected) {
                        console.log('Sending location update:', { bookingId, lat: position.coords.latitude, lng: position.coords.longitude });
                        socketRef.current.emit('location:update', locationData);
                    } else {
                        console.warn('Socket not connected, cannot send location update');
                    }
                },
                (err) => {
                    console.error('Geolocation error:', err.message);
                    // On timeout with high accuracy, retry with low accuracy
                    if (err.code === err.TIMEOUT && highAccuracy) {
                        console.log('High accuracy timed out, trying low accuracy...');
                        startWatch(false);
                        return;
                    }
                    // On timeout with low accuracy, don't set error - let IP fallback handle it
                    if (err.code === err.TIMEOUT) {
                        console.log('Low accuracy timed out, IP fallback will be triggered...');
                        return;
                    }
                    setError(getGeolocationErrorMessage(err));
                },
                {
                    enableHighAccuracy: highAccuracy,
                    timeout: highAccuracy ? 15000 : 30000, // 15s for high accuracy, 30s for low
                    maximumAge: 30000 // Accept positions up to 30 seconds old
                }
            );
        };

        // Start with high accuracy, will fall back to low if needed
        startWatch(true);
    }, [bookingId]);

    const stopSharing = useCallback(() => {
        // Stop watching position
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        // Notify server and disconnect
        if (socketRef.current) {
            socketRef.current.emit('location:stopTracking', { bookingId });
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setIsSharing(false);
        setCurrentLocation(null);
    }, [bookingId]);

    // Retry getting location (manual trigger)
    const retryLocation = useCallback(async () => {
        if (!socketRef.current?.connected) return;

        // Try IP-based location as fallback
        try {
            console.log('Trying IP-based location fallback...');
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.latitude && data.longitude) {
                const locationData = {
                    bookingId,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    heading: 0,
                    speed: 0,
                    accuracy: 5000 // IP-based location is approximate
                };

                setCurrentLocation({
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    heading: 0
                });

                console.log('Sending IP-based location:', locationData);
                socketRef.current.emit('location:update', locationData);
            }
        } catch (err) {
            console.error('IP-based location failed:', err);
            setError('Could not get your location. Please check your GPS settings.');
        }
    }, [bookingId]);

    useEffect(() => {
        if (enabled && bookingId) {
            startSharing();
        }

        return () => {
            stopSharing();
        };
    }, [enabled, bookingId, startSharing, stopSharing]);

    // Auto-retry with IP location if GPS fails after 15 seconds
    useEffect(() => {
        let timeoutId;
        // Trigger IP fallback if sharing but no location yet (regardless of error state)
        if (isSharing && !currentLocation) {
            timeoutId = setTimeout(() => {
                console.log('GPS timeout, trying IP-based fallback...');
                retryLocation();
            }, 15000); // 15 second timeout
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isSharing, currentLocation, retryLocation]);

    return {
        isSharing,
        error,
        currentLocation,
        startSharing,
        stopSharing,
        retryLocation
    };
};

/**
 * Hook for customer to receive employee location updates
 * @param {string} bookingId - Booking ID to track
 * @param {boolean} enabled - Whether to listen for updates
 */
export const useCustomerLocationTracking = (bookingId, enabled = false) => {
    const socketRef = useRef(null);
    const [employeeLocation, setEmployeeLocation] = useState(null);
    const [previousLocation, setPreviousLocation] = useState(null);
    const [isEmployeeOnline, setIsEmployeeOnline] = useState(false);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = useCallback(() => {
        if (!bookingId || !enabled) return;

        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Authentication required');
            return;
        }

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current.on('connect', () => {
            console.log('Customer location socket connected, socket id:', socketRef.current.id);
            setIsConnected(true);
            // Subscribe to location updates for this booking
            console.log('Subscribing to location for booking:', bookingId);
            socketRef.current.emit('location:subscribe', { bookingId });
        });

        socketRef.current.on('location:subscribed', (data) => {
            console.log('Subscription response:', data);
            setIsEmployeeOnline(data.isEmployeeOnline);
            if (data.lastKnownLocation) {
                // Handle both formats (from DB and from live session)
                const loc = data.lastKnownLocation;
                if (loc.coordinates) {
                    // DB format: coordinates: [lng, lat]
                    setEmployeeLocation({
                        latitude: loc.coordinates[1],
                        longitude: loc.coordinates[0],
                        heading: loc.heading || 0,
                        timestamp: loc.updatedAt ? new Date(loc.updatedAt).getTime() : Date.now()
                    });
                } else if (loc.latitude !== undefined) {
                    // Live session format
                    setEmployeeLocation(loc);
                }
            }
        });

        socketRef.current.on('location:employeeLocation', (data) => {
            console.log('Received employee location update:', data);
            if (data.bookingId === bookingId && data.location) {
                // Store previous location for smooth animation
                setEmployeeLocation(prev => {
                    setPreviousLocation(prev);
                    return data.location;
                });
                // Mark employee as online when we receive location
                setIsEmployeeOnline(true);
            }
        });

        socketRef.current.on('location:employeeOnline', (data) => {
            console.log('Employee came online:', data);
            if (data.bookingId === bookingId) {
                setIsEmployeeOnline(true);
            }
        });

        socketRef.current.on('location:employeeOffline', (data) => {
            console.log('Employee went offline:', data);
            if (data.bookingId === bookingId) {
                setIsEmployeeOnline(false);
            }
        });

        socketRef.current.on('location:error', (data) => {
            console.error('Location error:', data.message);
            setError(data.message);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Customer location socket disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Customer location socket error:', err.message);
            setError('Connection failed');
            setIsConnected(false);
        });
    }, [bookingId, enabled]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnected(false);
        setIsEmployeeOnline(false);
    }, []);

    useEffect(() => {
        if (enabled && bookingId) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [enabled, bookingId, connect, disconnect]);

    return {
        employeeLocation,
        previousLocation,
        isEmployeeOnline,
        isConnected,
        error,
        connect,
        disconnect
    };
};

// Helper to get user-friendly geolocation error message
const getGeolocationErrorMessage = (error) => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location permission denied. Please enable location access.';
        case error.POSITION_UNAVAILABLE:
            return 'Location unavailable. Please check your GPS settings.';
        case error.TIMEOUT:
            return 'Location request timed out. Please try again.';
        default:
            return 'Unable to get your location.';
    }
};

export default useEmployeeLocationSharing;
