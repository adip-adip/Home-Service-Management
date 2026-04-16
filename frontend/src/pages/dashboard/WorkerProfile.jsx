/**
 * Enhanced Worker Profile Component
 * Combines profile management with document status
 */

import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiFileText, FiCheckCircle, FiClock, FiXCircle, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store';
import { userAPI, documentAPI } from '../../api';
import { Button } from '../../components/common';

const WorkerProfile = () => {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [documentStats, setDocumentStats] = useState({});
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Nepal'
        },
        employeeProfile: {
            skills: [],
            experience: '',
            serviceCategories: [],
            availability: {
                isAvailable: true,
                days: [],
                hours: { start: '', end: '' }
            },
            hourlyRate: '',
            bio: ''
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipCode: user.address?.zipCode || '',
                    country: user.address?.country || 'Nepal'
                },
                employeeProfile: {
                    skills: user.employeeProfile?.skills || [],
                    experience: user.employeeProfile?.experience || '',
                    serviceCategories: user.employeeProfile?.serviceCategories || [],
                    availability: {
                        isAvailable: user.employeeProfile?.availability?.isAvailable ?? true,
                        days: user.employeeProfile?.availability?.days || [],
                        hours: user.employeeProfile?.availability?.hours || { start: '', end: '' }
                    },
                    hourlyRate: user.employeeProfile?.hourlyRate || '',
                    bio: user.employeeProfile?.bio || ''
                }
            });
        }
        fetchDocuments();
    }, [user]);

    const fetchDocuments = async () => {
        try {
            const response = await documentAPI.getUserDocuments();
            const docs = response.data?.documents || [];
            setDocuments(docs);
            
            // Calculate document statistics
            const stats = {
                total: docs.length,
                approved: docs.filter(doc => doc.status === 'approved').length,
                pending: docs.filter(doc => doc.status === 'pending').length,
                rejected: docs.filter(doc => doc.status === 'rejected').length
            };
            setDocumentStats(stats);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [field]: value }
            }));
        } else if (name.startsWith('employeeProfile.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                employeeProfile: { ...prev.employeeProfile, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSkillsChange = (e) => {
        const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
        setFormData(prev => ({
            ...prev,
            employeeProfile: { ...prev.employeeProfile, skills }
        }));
    };

    const handleAvailabilityChange = (type, value) => {
        setFormData(prev => ({
            ...prev,
            employeeProfile: {
                ...prev.employeeProfile,
                availability: {
                    ...prev.employeeProfile.availability,
                    [type]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Update basic profile
            const basicProfile = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                address: formData.address
            };

            // Update both profiles - employee profile response has the complete user data
            const [profileResponse, employeeProfileResponse] = await Promise.all([
                userAPI.updateProfile(basicProfile),
                userAPI.updateEmployeeProfile(formData.employeeProfile)
            ]);

            // Use employee profile response as it contains the full updated user
            // Merge with basic profile response to ensure all data is current
            const updatedUser = {
                ...profileResponse.data?.user,
                ...employeeProfileResponse.data?.user,
                employeeProfile: employeeProfileResponse.data?.user?.employeeProfile
            };

            // Update auth store and localStorage
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setUploadingAvatar(true);
        try {
            const response = await userAPI.uploadAvatar(file);
            setUser(response.data.user);
            toast.success('Avatar updated successfully!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const getVerificationStatus = () => {
        if (documentStats.total === 0) return 'not_submitted';
        if (documentStats.pending > 0) return 'pending';
        if (documentStats.approved === documentStats.total) return 'approved';
        return 'rejected';
    };

    const verificationStatus = getVerificationStatus();

    const availabilityDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Worker Profile</h1>
                <p className="text-gray-600 mt-2">Manage your profile and work preferences</p>
            </div>

            {/* Verification Status Alert */}
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                verificationStatus === 'approved' 
                    ? 'bg-green-50 border-green-400'
                    : verificationStatus === 'pending'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-red-50 border-red-400'
            }`}>
                <div className="flex items-center">
                    <div className="mr-3">
                        {verificationStatus === 'approved' && <FiCheckCircle className="w-5 h-5 text-green-600" />}
                        {verificationStatus === 'pending' && <FiClock className="w-5 h-5 text-yellow-600" />}
                        {verificationStatus === 'not_submitted' && <FiAlertTriangle className="w-5 h-5 text-red-600" />}
                        {verificationStatus === 'rejected' && <FiXCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                            Verification Status: {verificationStatus.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                            Documents: {documentStats.approved || 0} approved, {documentStats.pending || 0} pending, {documentStats.rejected || 0} rejected
                        </p>
                    </div>
                    <Button 
                        onClick={() => window.location.href = '/dashboard/worker-documents'}
                        variant="outline"
                        size="sm"
                    >
                        Manage Documents
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {user?.avatar?.url ? (
                                    <img 
                                        src={user.avatar.url} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border cursor-pointer hover:bg-gray-50">
                                <FiCamera className="w-4 h-4 text-gray-600" />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload}
                                    className="hidden" 
                                    disabled={uploadingAvatar}
                                />
                            </label>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Click the camera icon to upload a new profile picture.
                                {uploadingAvatar && ' Uploading...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="inline w-4 h-4 mr-1" />
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="inline w-4 h-4 mr-1" />
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMail className="inline w-4 h-4 mr-1" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiPhone className="inline w-4 h-4 mr-1" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        <FiMapPin className="inline w-5 h-5 mr-2" />
                        Address Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                            <input
                                type="text"
                                name="address.street"
                                value={formData.address.street}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                            <input
                                type="text"
                                name="address.zipCode"
                                value={formData.address.zipCode}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <select
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Nepal">Nepal</option>
                                <option value="India">India</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
                    <div className="space-y-6">
                        {/* Availability Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Available for Work</label>
                                <p className="text-sm text-gray-500">Toggle off if you're not accepting new bookings</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAvailabilityChange('isAvailable', !formData.employeeProfile.availability.isAvailable)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    formData.employeeProfile.availability.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        formData.employeeProfile.availability.isAvailable ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Service Categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Categories *</label>
                            <p className="text-sm text-gray-500 mb-3">Select the services you provide (you must select at least one to appear in search)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { value: 'plumbing', label: 'Plumbing' },
                                    { value: 'electrical', label: 'Electrical' },
                                    { value: 'cleaning', label: 'Cleaning' },
                                    { value: 'painting', label: 'Painting' },
                                    { value: 'carpentry', label: 'Carpentry' },
                                    { value: 'appliance-repair', label: 'Appliance Repair' },
                                    { value: 'ac-repair', label: 'AC Repair' },
                                    { value: 'gardening', label: 'Gardening' },
                                    { value: 'pest-control', label: 'Pest Control' },
                                    { value: 'other', label: 'Other' }
                                ].map((category) => (
                                    <label
                                        key={category.value}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                            formData.employeeProfile.serviceCategories.includes(category.value)
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.employeeProfile.serviceCategories.includes(category.value)}
                                            onChange={(e) => {
                                                const newCategories = e.target.checked
                                                    ? [...formData.employeeProfile.serviceCategories, category.value]
                                                    : formData.employeeProfile.serviceCategories.filter(c => c !== category.value);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    employeeProfile: { ...prev.employeeProfile, serviceCategories: newCategories }
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                            <input
                                type="text"
                                value={formData.employeeProfile.skills.join(', ')}
                                onChange={handleSkillsChange}
                                placeholder="e.g., Plumbing, Electrical, Carpentry"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                            <input
                                type="number"
                                name="employeeProfile.experience"
                                value={formData.employeeProfile.experience}
                                onChange={handleChange}
                                min="0"
                                max="50"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (NPR)</label>
                            <input
                                type="number"
                                name="employeeProfile.hourlyRate"
                                value={formData.employeeProfile.hourlyRate}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                name="employeeProfile.bio"
                                value={formData.employeeProfile.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Brief description about yourself and your work..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex items-center px-8 py-3"
                    >
                        <FiSave className="w-5 h-5 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default WorkerProfile;