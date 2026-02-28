/**
 * Customer Review Page
 * Allows customers to leave reviews for completed services
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    FiArrowLeft, FiStar, FiUser, FiCalendar, 
    FiMapPin, FiDollarSign, FiAlertCircle 
} from 'react-icons/fi';
import { bookingAPI } from '../../api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const CustomerReview = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState('');
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    useEffect(() => {
        if (isAuthenticated && bookingId && !hasFetched.current) {
            hasFetched.current = true;
            fetchBooking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, bookingId]);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.getBooking(bookingId);
            setBooking(response.data?.booking);
            
            // Check if booking is completed
            if (response.data?.booking?.status !== 'completed') {
                setError('Only completed bookings can be reviewed');
            }
            
            // Check if review already exists
            if (response.data?.booking?.review) {
                setError('You have already reviewed this booking');
                setReview(response.data.booking.review.text);
                setRating(response.data.booking.review.rating);
            }
        } catch (err) {
            console.error('Failed to fetch booking:', err);
            toast.error('Failed to load booking details');
            navigate('/dashboard/bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!review.trim()) {
            toast.error('Please write a review');
            return;
        }

        if (review.trim().length < 10) {
            toast.error('Review must be at least 10 characters long');
            return;
        }

        setSubmitting(true);
        try {
            await bookingAPI.submitReview(bookingId, {
                rating,
                text: review.trim()
            });
            toast.success('Review submitted successfully!');
            navigate('/dashboard/bookings');
        } catch (err) {
            console.error('Error submitting review:', err);
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                    <FiAlertCircle className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking not found</h3>
                    <p className="text-gray-600 mb-6">This booking does not exist.</p>
                    <button 
                        onClick={() => navigate('/dashboard/bookings')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    const isAlreadyReviewed = !!booking?.review;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
                <FiArrowLeft /> Back
            </button>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {isAlreadyReviewed ? 'Your Review' : 'Write a Review'}
            </h1>
            <p className="text-gray-600 mb-6">
                {isAlreadyReviewed 
                    ? 'Thank you for your review!' 
                    : 'Share your experience with this service'}
            </p>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800">{error}</p>
                </div>
            )}

            {/* Booking Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Service Details</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500">Service</p>
                                <p className="text-gray-800 font-medium">{booking.serviceCategory || 'Service'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <FiCalendar className="text-gray-400" />
                                    {formatDate(booking.scheduledDate)}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                    <FiDollarSign className="text-gray-400" />
                                    Rs. {booking.totalAmount?.toLocaleString() || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Service Provider</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500">Name</p>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <FiUser className="text-gray-400" />
                                    {booking.employee?.fullName || 'Unassigned'}
                                </div>
                            </div>
                            {booking.address && (
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <div className="flex items-start gap-2 text-gray-800">
                                        <FiMapPin className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span>{booking.address}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rating
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                disabled={isAlreadyReviewed}
                                className={`text-3xl transition-all ${
                                    (hoveredRating || rating) >= star
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                } ${isAlreadyReviewed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <FiStar 
                                    fill={(hoveredRating || rating) >= star ? 'currentColor' : 'none'}
                                    size={32}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {rating === 5 && 'Excellent!'}
                        {rating === 4 && 'Good!'}
                        {rating === 3 && 'Okay'}
                        {rating === 2 && 'Poor'}
                        {rating === 1 && 'Very Poor'}
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-3">
                        Your Review
                    </label>
                    <textarea
                        id="review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        disabled={isAlreadyReviewed}
                        placeholder="Share your experience with this service... (minimum 10 characters)"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                            isAlreadyReviewed ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        rows="5"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        {review.length} / 500 characters
                    </p>
                </div>

                {!isAlreadyReviewed && (
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                )}

                {isAlreadyReviewed && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <FiStar className="text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" />
                        <div>
                            <p className="font-medium text-green-800">Review Submitted</p>
                            <p className="text-sm text-green-700">Thank you for sharing your feedback!</p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CustomerReview;
