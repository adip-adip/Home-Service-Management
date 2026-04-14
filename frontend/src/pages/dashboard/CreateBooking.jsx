/**
 * Create Booking Page
 * Allows customers to book a service
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser, FiCalendar, FiClock, FiMapPin,
    FiFileText, FiSend, FiArrowLeft, FiCheck,
    FiInfo, FiX, FiBriefcase, FiDollarSign, FiStar, FiAward, FiRefreshCw
} from 'react-icons/fi';
import { bookingAPI } from '../../api';
import { LocationPicker } from '../../components/map';
import toast from 'react-hot-toast';

const SERVICE_CATEGORIES = [
    { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'painting', label: 'Painting', icon: '🎨' },
    { value: 'carpentry', label: 'Carpentry', icon: '🪚' },
    { value: 'appliance-repair', label: 'Appliance Repair', icon: '🔌' },
    { value: 'ac-repair', label: 'AC Repair', icon: '❄️' },
    { value: 'gardening', label: 'Gardening', icon: '🌱' },
    { value: 'pest-control', label: 'Pest Control', icon: '🐛' },
    { value: 'other', label: 'Other', icon: '📋' }
];

const TIME_SLOTS = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM'
];

const CreateBooking = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);

    const [formData, setFormData] = useState({
        serviceCategory: '',
        employee: '',
        scheduledDate: '',
        scheduledTime: '',
        address: '',
        addressCoordinates: null,
        description: '',
        customerPhone: ''
    });

    // Fetch employees function - memoized for reuse
    const fetchEmployees = useCallback(async (showLoading = true) => {
        if (!formData.serviceCategory) {
            setEmployees([]);
            return;
        }

        try {
            if (showLoading) setLoadingEmployees(true);
            const response = await bookingAPI.getAvailableEmployees(formData.serviceCategory);
            const newEmployees = response.data?.employees || [];
            setEmployees(newEmployees);

            // Update selected employee info if it exists in the new data
            if (selectedEmployeeInfo) {
                const updatedEmployee = newEmployees.find(e => e._id === selectedEmployeeInfo._id);
                if (updatedEmployee) {
                    setSelectedEmployeeInfo(updatedEmployee);
                } else {
                    // Employee no longer available, close modal
                    setSelectedEmployeeInfo(null);
                }
            }

            // If selected employee is no longer in the list, reset selection
            if (formData.employee && !newEmployees.find(e => e._id === formData.employee)) {
                setFormData(prev => ({ ...prev, employee: '' }));
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            setEmployees([]);
        } finally {
            if (showLoading) setLoadingEmployees(false);
        }
    }, [formData.serviceCategory, formData.employee, selectedEmployeeInfo]);

    // Fetch employees when service category changes
    useEffect(() => {
        fetchEmployees();
    }, [formData.serviceCategory]);

    // Refetch employees when page becomes visible (user switches tabs back)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && formData.serviceCategory) {
                fetchEmployees(false); // Silently refresh without loading indicator
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [formData.serviceCategory, fetchEmployees]);

    // Manual refresh handler
    const handleRefreshEmployees = () => {
        if (!loadingEmployees) {
            fetchEmployees();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategorySelect = (category) => {
        setFormData(prev => ({
            ...prev,
            serviceCategory: category,
            employee: ''
        }));
    };

    const handleEmployeeSelect = (employeeId) => {
        setFormData(prev => ({
            ...prev,
            employee: employeeId
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.serviceCategory || !formData.scheduledDate || !formData.scheduledTime || !formData.address) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await bookingAPI.createBooking(formData);
            toast.success('Booking created successfully!');
            navigate('/dashboard/bookings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.serviceCategory) {
            toast.error('Please select a service category');
            return;
        }
        if (step === 2 && !formData.employee) {
            toast.error('Please select a service provider');
            return;
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft className="text-xl" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Book a Service</h1>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step > 1 ? 'bg-green-600 text-white' : step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}>
                        {step > 1 ? <FiCheck /> : '1'}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Select Service</span>
                </div>
                <div className={`w-12 h-1 rounded ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step > 2 ? 'bg-green-600 text-white' : step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}>
                        {step > 2 ? <FiCheck /> : '2'}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Choose Provider</span>
                </div>
                <div className={`w-12 h-1 rounded ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}>
                        3
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Schedule & Details</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                {/* Step 1: Select Service Category */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">What service do you need?</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                            {SERVICE_CATEGORIES.map((category) => (
                                <div
                                    key={category.value}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center hover:border-blue-400 ${
                                        formData.serviceCategory === category.value 
                                            ? 'border-blue-600 bg-blue-50' 
                                            : 'border-gray-200'
                                    }`}
                                    onClick={() => handleCategorySelect(category.value)}
                                >
                                    <span className="text-3xl block mb-2">{category.icon}</span>
                                    <span className="text-sm font-medium text-gray-700">{category.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={nextStep}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Choose Employee */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Choose a Service Provider</h2>
                            <button
                                type="button"
                                onClick={handleRefreshEmployees}
                                disabled={loadingEmployees}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh providers list"
                            >
                                <FiRefreshCw className={`${loadingEmployees ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                        {loadingEmployees ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600">Finding available providers...</p>
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                                <FiUser className="text-5xl text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No providers available</h3>
                                <p className="text-gray-600">There are no service providers available for this category at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {employees.map((employee) => (
                                    <div
                                        key={employee._id}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            formData.employee === employee._id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                        onClick={() => handleEmployeeSelect(employee._id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {employee.avatar?.url ? (
                                                    <img src={employee.avatar.url} alt={`${employee.firstName} ${employee.lastName}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser className="text-xl text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-semibold text-gray-800 truncate">{employee.firstName} {employee.lastName}</h4>
                                                    {formData.employee === employee._id && (
                                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                                                            <FiCheck className="text-white text-xs" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 capitalize">
                                                    {employee.employeeProfile?.serviceCategories?.[0] || formData.serviceCategory}
                                                </p>

                                                {/* Rating and Reviews */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {employee.employeeProfile?.rating?.average ? (
                                                        <div className="flex items-center gap-1 text-sm text-yellow-600">
                                                            <FiStar className="fill-yellow-500" />
                                                            <span>{employee.employeeProfile.rating.average.toFixed(1)}</span>
                                                            {employee.employeeProfile?.rating?.count > 0 && (
                                                                <span className="text-gray-500">({employee.employeeProfile.rating.count})</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">No reviews yet</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price and Stats */}
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-green-600 font-semibold">
                                                    <FiDollarSign className="text-sm" />
                                                    <span>
                                                        {employee.employeeProfile?.hourlyRate
                                                            ? `Rs. ${employee.employeeProfile.hourlyRate}/hr`
                                                            : 'Price on request'
                                                        }
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEmployeeInfo(employee);
                                                    }}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="View details"
                                                >
                                                    <FiInfo className="text-lg" />
                                                </button>
                                            </div>

                                            {/* Experience and Jobs */}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                {employee.employeeProfile?.experience > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <FiBriefcase />
                                                        <span>{employee.employeeProfile.experience} yrs exp</span>
                                                    </div>
                                                )}
                                                {employee.employeeProfile?.completedJobs > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <FiAward />
                                                        <span>{employee.employeeProfile.completedJobs} jobs done</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex justify-between">
                            <button 
                                type="button" 
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={prevStep}
                            >
                                Back
                            </button>
                            <button 
                                type="button" 
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={nextStep}
                                disabled={employees.length === 0}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Schedule and Details */}
                {step === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Schedule and Details</h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="scheduledDate" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FiCalendar /> Date *
                                </label>
                                <input
                                    type="date"
                                    id="scheduledDate"
                                    name="scheduledDate"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="scheduledTime" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <FiClock /> Time *
                                </label>
                                <select
                                    id="scheduledTime"
                                    name="scheduledTime"
                                    value={formData.scheduledTime}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select time slot</option>
                                    {TIME_SLOTS.map((slot) => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin /> Service Location *
                            </label>
                            <LocationPicker
                                value={formData.address}
                                coordinates={formData.addressCoordinates}
                                onChange={(address) => setFormData(prev => ({ ...prev, address }))}
                                onCoordinatesChange={(coords) => setFormData(prev => ({ ...prev, addressCoordinates: coords }))}
                                placeholder="Enter address or use current location"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                You can type an address, use your current location, or pick on the map
                            </p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="customerPhone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiUser /> Contact Phone
                            </label>
                            <input
                                type="tel"
                                id="customerPhone"
                                name="customerPhone"
                                value={formData.customerPhone}
                                onChange={handleChange}
                                placeholder="Your contact number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiFileText /> Description (optional)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the service you need..."
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Booking Summary */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Booking Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Service:</span>
                                    <span className="font-medium">{SERVICE_CATEGORIES.find(c => c.value === formData.serviceCategory)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Provider:</span>
                                    <span className="font-medium">{(() => {
                                        const emp = employees.find(e => e._id === formData.employee);
                                        return emp ? `${emp.firstName} ${emp.lastName}` : 'Selected';
                                    })()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rate:</span>
                                    <span className="font-medium text-green-600">{(() => {
                                        const emp = employees.find(e => e._id === formData.employee);
                                        return emp?.employeeProfile?.hourlyRate
                                            ? `Rs. ${emp.employeeProfile.hourlyRate}/hr`
                                            : 'Price on request';
                                    })()}</span>
                                </div>
                                {formData.scheduledDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium">{new Date(formData.scheduledDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {formData.scheduledTime && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-medium">{formData.scheduledTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button 
                                type="button" 
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={prevStep}
                            >
                                Back
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : <><FiSend /> Confirm Booking</>}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Employee Info Modal */}
            {selectedEmployeeInfo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmployeeInfo(null)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Provider Details</h3>
                            <button
                                onClick={() => setSelectedEmployeeInfo(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX className="text-xl text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {selectedEmployeeInfo.avatar?.url ? (
                                        <img src={selectedEmployeeInfo.avatar.url} alt={`${selectedEmployeeInfo.firstName} ${selectedEmployeeInfo.lastName}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <FiUser className="text-3xl text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800">
                                        {selectedEmployeeInfo.firstName} {selectedEmployeeInfo.lastName}
                                    </h4>
                                    <p className="text-gray-600 capitalize">
                                        {selectedEmployeeInfo.employeeProfile?.serviceCategories?.join(', ') || formData.serviceCategory}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        {selectedEmployeeInfo.employeeProfile?.rating?.average ? (
                                            <div className="flex items-center gap-1 text-yellow-600">
                                                <FiStar className="fill-yellow-500" />
                                                <span className="font-medium">{selectedEmployeeInfo.employeeProfile.rating.average.toFixed(1)}</span>
                                                <span className="text-gray-500 text-sm">({selectedEmployeeInfo.employeeProfile.rating.count || 0} reviews)</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">No reviews yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="bg-green-50 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 text-green-700">
                                    <FiDollarSign className="text-xl" />
                                    <span className="text-lg font-semibold">
                                        {selectedEmployeeInfo.employeeProfile?.hourlyRate
                                            ? `Rs. ${selectedEmployeeInfo.employeeProfile.hourlyRate} per hour`
                                            : 'Price on request'
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                        <FiBriefcase />
                                        <span className="font-semibold">{selectedEmployeeInfo.employeeProfile?.experience || 0} years</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Experience</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                                        <FiAward />
                                        <span className="font-semibold">{selectedEmployeeInfo.employeeProfile?.completedJobs || 0}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Jobs Completed</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {selectedEmployeeInfo.employeeProfile?.bio && (
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-800 mb-2">About</h5>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {selectedEmployeeInfo.employeeProfile.bio}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {selectedEmployeeInfo.employeeProfile?.skills?.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-800 mb-2">Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEmployeeInfo.employeeProfile.skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Working Hours */}
                            {selectedEmployeeInfo.employeeProfile?.availability?.workingHours && (
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-800 mb-2">Working Hours</h5>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                        <FiClock />
                                        <span>
                                            {selectedEmployeeInfo.employeeProfile.availability.workingHours.start || '9:00 AM'} - {selectedEmployeeInfo.employeeProfile.availability.workingHours.end || '6:00 PM'}
                                        </span>
                                    </div>
                                    {selectedEmployeeInfo.employeeProfile.availability.workingDays?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {selectedEmployeeInfo.employeeProfile.availability.workingDays.map((day, index) => (
                                                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t bg-gray-50">
                            <button
                                onClick={() => {
                                    handleEmployeeSelect(selectedEmployeeInfo._id);
                                    setSelectedEmployeeInfo(null);
                                }}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Select This Provider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateBooking;
