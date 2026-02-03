/**
 * Create Booking Page
 * Allows customers to book a service
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiUser, FiCalendar, FiClock, FiMapPin, 
    FiFileText, FiSend, FiArrowLeft, FiCheck
} from 'react-icons/fi';
import { bookingAPI } from '../../api';
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

    const [formData, setFormData] = useState({
        serviceCategory: '',
        employee: '',
        scheduledDate: '',
        scheduledTime: '',
        address: '',
        description: '',
        customerPhone: ''
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!formData.serviceCategory) {
                setEmployees([]);
                return;
            }

            try {
                setLoadingEmployees(true);
                const response = await bookingAPI.getAvailableEmployees(formData.serviceCategory);
                setEmployees(response.data?.employees || []);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        };

        fetchEmployees();
    }, [formData.serviceCategory]);

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
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose a Service Provider</h2>
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
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {employee.avatar?.url ? (
                                                    <img src={employee.avatar.url} alt={`${employee.firstName} ${employee.lastName}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiUser className="text-xl text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800">{employee.firstName} {employee.lastName}</h4>
                                                <p className="text-sm text-gray-600 capitalize">
                                                    {employee.employeeProfile?.serviceCategories?.[0] || formData.serviceCategory}
                                                </p>
                                                {employee.employeeProfile?.rating?.average && (
                                                    <div className="text-sm text-yellow-600">
                                                        ⭐ {employee.employeeProfile.rating.average.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                            {formData.employee === employee._id && (
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                                                    <FiCheck className="text-white text-sm" />
                                                </div>
                                            )}
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
                            <label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin /> Address *
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter your full address"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all"
                            />
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
        </div>
    );
};

export default CreateBooking;
