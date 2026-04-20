/**
 * Location Picker Component
 * Allows users to pick a location via:
 * 1. Manual address entry
 * 2. Current GPS location
 * 3. Map click/drag
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMapPin, FiNavigation, FiSearch, FiX, FiCheck } from 'react-icons/fi';

const LocationPicker = ({
    value = '',
    coordinates = null,
    onChange,
    onCoordinatesChange,
    placeholder = 'Enter your address',
    required = false,
    className = ''
}) => {
    const [showMap, setShowMap] = useState(false);
    const [searchQuery, setSearchQuery] = useState(value);
    const [selectedCoords, setSelectedCoords] = useState(coordinates);
    const [selectedAddress, setSelectedAddress] = useState(value);
    const [isLocating, setIsLocating] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [leaflet, setLeaflet] = useState(null);
    const [error, setError] = useState(null);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Sync external value changes
    useEffect(() => {
        setSearchQuery(value);
        setSelectedAddress(value);
    }, [value]);

    useEffect(() => {
        setSelectedCoords(coordinates);
    }, [coordinates]);

    // Load Leaflet dynamically
    useEffect(() => {
        if (!showMap) return;

        const loadLeaflet = async () => {
            if (window.L) {
                setLeaflet(window.L);
                setMapLoaded(true);
                return;
            }

            if (!document.querySelector('link[href*="leaflet.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

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
    }, [showMap]);

    // Initialize map
    useEffect(() => {
        if (!showMap || !mapLoaded || !leaflet || !mapRef.current || mapInstanceRef.current) return;

        // Default center (Kathmandu) or selected coordinates
        const defaultCenter = [27.7172, 85.3240];
        const center = selectedCoords
            ? [selectedCoords.latitude, selectedCoords.longitude]
            : defaultCenter;

        mapInstanceRef.current = leaflet.map(mapRef.current, {
            center,
            zoom: selectedCoords ? 16 : 13,
            zoomControl: true
        });

        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstanceRef.current);

        // Add marker if coordinates exist
        if (selectedCoords) {
            addOrUpdateMarker(selectedCoords.latitude, selectedCoords.longitude);
        }

        // Handle map clicks
        mapInstanceRef.current.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            addOrUpdateMarker(lat, lng);
            setSelectedCoords({ latitude: lat, longitude: lng });
            await reverseGeocode(lat, lng);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [showMap, mapLoaded, leaflet]);

    // Create marker icon
    const createMarkerIcon = useCallback(() => {
        if (!leaflet) return null;

        return leaflet.divIcon({
            className: 'location-picker-marker',
            html: `
                <div style="
                    width: 40px;
                    height: 40px;
                    position: relative;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    ">
                        <div style="
                            width: 14px;
                            height: 14px;
                            background: white;
                            border-radius: 50%;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        "></div>
                    </div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
    }, [leaflet]);

    // Add or update marker on map
    const addOrUpdateMarker = useCallback((lat, lng) => {
        if (!mapInstanceRef.current || !leaflet) return;

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = leaflet.marker([lat, lng], {
                icon: createMarkerIcon(),
                draggable: true
            }).addTo(mapInstanceRef.current);

            // Handle marker drag
            markerRef.current.on('dragend', async (e) => {
                const { lat, lng } = e.target.getLatLng();
                setSelectedCoords({ latitude: lat, longitude: lng });
                await reverseGeocode(lat, lng);
            });
        }

        mapInstanceRef.current.panTo([lat, lng], { animate: true });
    }, [leaflet, createMarkerIcon]);

    // Reverse geocode coordinates to address
    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'User-Agent': 'GharSewa/1.0' } }
            );
            const data = await response.json();

            if (data.display_name) {
                setSelectedAddress(data.display_name);
                setSearchQuery(data.display_name);
                setError('');
                // Pass address to parent component
                if (onChange) {
                    onChange(data.display_name);
                }
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
    };

    // Search for address
    const searchAddress = async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=np`,
                { headers: { 'User-Agent': 'GharSewa/1.0' } }
            );
            const data = await response.json();
            setSearchResults(data || []);
        } catch (err) {
            console.error('Address search failed:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input change with debounce
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            searchAddress(query);
        }, 500);
    };

    // Handle search result selection
    const handleResultSelect = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setSelectedCoords({ latitude: lat, longitude: lng });
        setSelectedAddress(result.display_name);
        setSearchQuery(result.display_name);
        setSearchResults([]);

        if (mapInstanceRef.current) {
            addOrUpdateMarker(lat, lng);
            mapInstanceRef.current.setView([lat, lng], 16);
        }
    };

    // Get current GPS location with fallback strategy
    const getCurrentLocation = async () => {
        if (!navigator.geolocation) {
            // Try IP-based location as fallback
            await getIPBasedLocation();
            return;
        }

        setIsLocating(true);
        setError(null);

        const handleSuccess = async (position) => {
            const { latitude, longitude } = position.coords;
            setSelectedCoords({ latitude, longitude });

            if (showMap && mapInstanceRef.current) {
                addOrUpdateMarker(latitude, longitude);
                mapInstanceRef.current.setView([latitude, longitude], 16);
            }

            await reverseGeocode(latitude, longitude);
            setIsLocating(false);
        };

        const handleFinalError = async (err) => {
            console.error('Geolocation error:', err);
            // Try IP-based location as last resort
            console.log('GPS failed, trying IP-based location...');
            const ipSuccess = await getIPBasedLocation();
            if (!ipSuccess) {
                setError('Could not get your location. Please pick on the map or enter address manually.');
                setIsLocating(false);
            }
        };

        // Try multiple strategies with increasing leniency
        const tryGetLocation = (attempt = 1) => {
            const options = {
                1: { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
                2: { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
                3: { enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 } // Accept 5 min old cache
            };

            const currentOptions = options[attempt] || options[3];

            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                (err) => {
                    if (err.code === 3 && attempt < 3) { // TIMEOUT
                        console.log(`Location attempt ${attempt} timed out, trying with more lenient settings...`);
                        tryGetLocation(attempt + 1);
                    } else {
                        handleFinalError(err);
                    }
                },
                currentOptions
            );
        };

        tryGetLocation(1);
    };

    // IP-based location fallback (approximate location)
    const getIPBasedLocation = async () => {
        try {
            setIsLocating(true);
            // Using free IP geolocation API
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.latitude && data.longitude) {
                const latitude = parseFloat(data.latitude);
                const longitude = parseFloat(data.longitude);

                setSelectedCoords({ latitude, longitude });

                if (showMap && mapInstanceRef.current) {
                    addOrUpdateMarker(latitude, longitude);
                    mapInstanceRef.current.setView([latitude, longitude], 14); // Lower zoom for approximate location
                }

                // Use city/region from IP data for address
                const addressParts = [data.city, data.region, data.country_name].filter(Boolean);
                const approximateAddress = addressParts.join(', ') || 'Approximate location';
                setSelectedAddress(approximateAddress);
                setSearchQuery(approximateAddress);
                setError('');
                // Pass address to parent component
                if (onChange) {
                    onChange(approximateAddress);
                }
                setIsLocating(false);
                return true;
            }
        } catch (err) {
            console.error('IP-based location failed:', err);
        }
        setIsLocating(false);
        return false;
    };

    // Get user-friendly error message
    const getGeolocationErrorMessage = (error) => {
        switch (error.code) {
            case 1: // PERMISSION_DENIED
                return 'Location permission denied. Please enable location access in your browser settings.';
            case 2: // POSITION_UNAVAILABLE
                return 'Location unavailable. Please check your GPS/location settings.';
            case 3: // TIMEOUT
                return 'Could not get your location. Please try again or pick on the map.';
            default:
                return 'Unable to get your location. Please try again or enter address manually.';
        }
    };

    // Confirm location selection
    const handleConfirm = () => {
        onChange(selectedAddress);
        if (onCoordinatesChange && selectedCoords) {
            onCoordinatesChange(selectedCoords);
        }
        setShowMap(false);
    };

    // Handle manual address input (without map)
    const handleManualInput = (e) => {
        const newValue = e.target.value;
        setSearchQuery(newValue);
        setSelectedAddress(newValue);
        onChange(newValue);
        // Clear coordinates when manually typing
        if (onCoordinatesChange) {
            onCoordinatesChange(null);
        }
    };

    return (
        <div className={className}>
            {/* Main Input with Location Button */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleManualInput}
                    placeholder={placeholder}
                    required={required}
                    className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLocating}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Use current location"
                    >
                        {isLocating ? (
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FiNavigation className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowMap(true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Pick on map"
                    >
                        <FiMapPin className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Error/Warning Message */}
            {error && (
                <p className={`mt-2 text-sm ${error.includes('approximate') || error.includes('Drag') ? 'text-amber-600' : 'text-red-600'}`}>
                    {error}
                </p>
            )}

            {/* Coordinates Display */}
            {selectedCoords && (
                <p className="mt-1 text-xs text-gray-500">
                    Coordinates: {selectedCoords.latitude.toFixed(6)}, {selectedCoords.longitude.toFixed(6)}
                </p>
            )}

            {/* Map Modal */}
            {showMap && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Pick Location</h3>
                            <button
                                type="button"
                                onClick={() => setShowMap(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search for an address..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                                    {searchResults.map((result, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleResultSelect(result)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="flex items-start gap-2">
                                                <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 line-clamp-2">{result.display_name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Current Location Button */}
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={isLocating}
                                className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLocating ? (
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FiNavigation className="w-4 h-4" />
                                )}
                                Use my current location
                            </button>
                        </div>

                        {/* Map Container */}
                        <div className="relative" style={{ height: '350px' }}>
                            {!mapLoaded ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <div className="text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-gray-600 text-sm">Loading map...</p>
                                    </div>
                                </div>
                            ) : null}
                            <div ref={mapRef} className="w-full h-full" />

                            {/* Instructions Overlay */}
                            <div className="absolute bottom-3 left-3 right-3 z-10">
                                <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs text-gray-600 text-center">
                                    Click on the map or drag the marker to select a location
                                </div>
                            </div>
                        </div>

                        {/* Selected Address Display */}
                        {selectedAddress && (
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex items-start gap-2">
                                    <FiMapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-1">Selected Location</p>
                                        <p className="text-sm text-gray-800 line-clamp-2">{selectedAddress}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="p-4 border-t flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowMap(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!selectedAddress}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <FiCheck className="w-4 h-4" />
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add marker styles */}
            <style>{`
                .location-picker-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default LocationPicker;
