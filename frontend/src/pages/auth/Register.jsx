/**
 * Register Page - Premium Human-Crafted Design
 * Clean, step-free registration with refined aesthetics
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiHome, FiArrowRight, FiBriefcase, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register, isLoading } = useAuthStore();

    const initialRole = searchParams.get('role') === 'employee' ? 'employee' : 'customer';

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: initialRole,
        serviceCategories: [],
        experience: 0
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    const serviceOptions = [
        { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
        { value: 'electrical', label: 'Electrical', icon: '⚡' },
        { value: 'cleaning', label: 'Cleaning', icon: '✨' },
        { value: 'painting', label: 'Painting', icon: '🎨' },
        { value: 'carpentry', label: 'Carpentry', icon: '🪵' },
        { value: 'appliance_repair', label: 'Appliance Repair', icon: '🔌' },
        { value: 'pest_control', label: 'Pest Control', icon: '🐛' },
        { value: 'gardening', label: 'Gardening', icon: '🌱' },
        { value: 'ac_repair', label: 'AC Repair', icon: '❄️' },
        { value: 'other', label: 'Other', icon: '🛠️' }
    ];

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'At least 2 characters';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'At least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'At least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Include uppercase, lowercase and number';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.role === 'employee') {
            if (!formData.serviceCategories || formData.serviceCategories.length === 0) {
                newErrors.serviceCategories = 'Select at least one service';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'role') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                serviceCategories: [],
                experience: 0
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        const result = await register(formData);

        if (result.success) {
            toast.success('Account created! Please check your email to verify.');
            navigate('/login');
        } else {
            if (result.errors && result.errors.length > 0) {
                const backendErrors = {};
                result.errors.forEach(err => {
                    backendErrors[err.field] = err.message;
                });
                setErrors(backendErrors);
                toast.error('Please fix the errors below');
            } else {
                toast.error(result.error);
            }
        }
    };

    const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, optional = false }) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label} {optional && <span className="text-slate-400 font-normal">(Optional)</span>}
            </label>
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    focusedField === name ? 'text-brand-500' : 'text-slate-400'
                }`}>
                    <Icon className="w-[18px] h-[18px]" />
                </div>
                <input
                    type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(name)}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-11 ${type === 'password' ? 'pr-12' : 'pr-4'} py-3 rounded-xl border-2 bg-slate-50 transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                        errors[name]
                            ? 'border-red-300 focus:border-red-500 focus:bg-white'
                            : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                    } focus:outline-none focus:ring-4 focus:ring-brand-500/10`}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FiEyeOff className="w-[18px] h-[18px]" /> : <FiEye className="w-[18px] h-[18px]" />}
                    </button>
                )}
            </div>
            {errors[name] && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                    {errors[name]}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative flex flex-col justify-between w-full p-10 xl:p-12">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                            <FiHome className="text-white text-xl" />
                        </div>
                        <span className="font-bold text-2xl text-white tracking-tight">
                            Home<span className="text-brand-400">Service</span>
                        </span>
                    </Link>

                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                            {formData.role === 'employee'
                                ? 'Turn your skills into income'
                                : 'Get things done, hassle-free'
                            }
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            {formData.role === 'employee'
                                ? 'Join our network of professionals and connect with customers who need your expertise.'
                                : 'Create your account and access hundreds of verified professionals for all your home needs.'
                            }
                        </p>

                        {/* Benefits List */}
                        <div className="mt-10 space-y-4">
                            {(formData.role === 'employee' ? [
                                'Flexible working hours',
                                'Secure payment processing',
                                'Build your reputation with reviews',
                                'No subscription fees'
                            ] : [
                                'Verified professionals only',
                                'Transparent pricing',
                                'Quality guarantee',
                                'Easy booking process'
                            ]).map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                                        <FiCheck className="w-3 h-3 text-brand-400" />
                                    </div>
                                    <span className="text-slate-300">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
                <div className="w-full max-w-lg py-8">
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <FiHome className="text-white text-lg" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">
                            Home<span className="text-brand-600">Service</span>
                        </span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Create your account
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Join thousands of users on HomeService
                        </p>
                    </div>

                    {/* Role Selector */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-slate-700 mb-3">I want to</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label
                                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                    formData.role === 'customer'
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="customer"
                                    checked={formData.role === 'customer'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                                    formData.role === 'customer' ? 'bg-brand-100' : 'bg-slate-100'
                                }`}>
                                    <FiUser className={`w-5 h-5 ${formData.role === 'customer' ? 'text-brand-600' : 'text-slate-500'}`} />
                                </div>
                                <span className={`font-medium text-sm ${formData.role === 'customer' ? 'text-brand-700' : 'text-slate-700'}`}>
                                    Hire Services
                                </span>
                                {formData.role === 'customer' && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                                        <FiCheck className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </label>
                            <label
                                className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                    formData.role === 'employee'
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="employee"
                                    checked={formData.role === 'employee'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                                    formData.role === 'employee' ? 'bg-brand-100' : 'bg-slate-100'
                                }`}>
                                    <FiBriefcase className={`w-5 h-5 ${formData.role === 'employee' ? 'text-brand-600' : 'text-slate-500'}`} />
                                </div>
                                <span className={`font-medium text-sm ${formData.role === 'employee' ? 'text-brand-700' : 'text-slate-700'}`}>
                                    Provide Services
                                </span>
                                {formData.role === 'employee' && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                                        <FiCheck className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="First Name" name="firstName" placeholder="Hari" icon={FiUser} />
                            <InputField label="Last Name" name="lastName" placeholder="Sharma" icon={FiUser} />
                        </div>

                        <InputField label="Email" name="email" type="email" placeholder="hari@example.com" icon={FiMail} />
                        <InputField label="Phone" name="phone" type="tel" placeholder="9841234567" icon={FiPhone} optional />

                        {/* Employee Specific Fields */}
                        {formData.role === 'employee' && (
                            <>
                                {/* Service Category */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        Your service specialty
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {serviceOptions.slice(0, 6).map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        serviceCategories: [option.value]
                                                    }));
                                                    if (errors.serviceCategories) {
                                                        setErrors(prev => ({ ...prev, serviceCategories: '' }));
                                                    }
                                                }}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                                    formData.serviceCategories.includes(option.value)
                                                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <span>{option.icon}</span>
                                                <span>{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <select
                                        value={formData.serviceCategories[0] || ''}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                serviceCategories: e.target.value ? [e.target.value] : []
                                            }));
                                        }}
                                        className="w-full mt-2 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                                    >
                                        <option value="">Other services...</option>
                                        {serviceOptions.slice(6).map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.icon} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.serviceCategories && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full" />
                                            {errors.serviceCategories}
                                        </p>
                                    )}
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Years of experience
                                    </label>
                                    <input
                                        type="number"
                                        name="experience"
                                        min="0"
                                        max="50"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                                    />
                                </div>
                            </>
                        )}

                        {/* Password Fields */}
                        <InputField label="Password" name="password" type="password" placeholder="Min 8 characters" icon={FiLock} />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm password
                            </label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                                    focusedField === 'confirmPassword' ? 'text-brand-500' : 'text-slate-400'
                                }`}>
                                    <FiLock className="w-[18px] h-[18px]" />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Repeat your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-slate-50 transition-all duration-200 text-slate-900 placeholder:text-slate-400 ${
                                        errors.confirmPassword
                                            ? 'border-red-300 focus:border-red-500 focus:bg-white'
                                            : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                                    } focus:outline-none focus:ring-4 focus:ring-brand-500/10`}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create account</span>
                                    <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Terms */}
                        <p className="text-center text-sm text-slate-500">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="text-brand-600 hover:text-brand-700">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-brand-600 hover:text-brand-700">Privacy Policy</a>
                        </p>
                    </form>

                    {/* Sign In Link (Mobile) */}
                    <p className="lg:hidden text-center text-slate-600 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
