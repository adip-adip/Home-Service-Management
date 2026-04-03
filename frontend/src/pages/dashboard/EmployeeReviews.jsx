/**
 * Employee Reviews Page
 * Displays customer reviews for the logged-in employee
 * Updated with premium theme styling
 */

import { useEffect, useState } from 'react';
import { FiRefreshCw, FiStar, FiMessageSquare, FiUser } from 'react-icons/fi';
import { bookingAPI } from '../../api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const EmployeeReviews = () => {
    const { user } = useAuthStore();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        if (!user?._id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await bookingAPI.getEmployeeReviews(user._id, { limit: 50 });
            setReviews(response.data?.reviews || []);
            setAverageRating(response.data?.averageRating || 0);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [user?._id]);

    const renderStars = (rating, size = 'sm') => {
        const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`${sizeClass} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500">Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
                    <p className="text-slate-500 mt-1">What customers are saying about your work</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                    onClick={fetchReviews}
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Rating Summary Card */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-brand-100 text-sm font-medium mb-1">Your Average Rating</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold">{Number(averageRating).toFixed(1)}</span>
                            <span className="text-brand-200 text-lg">/ 5</span>
                        </div>
                        <p className="text-brand-100 text-sm mt-2">{reviews.length} total review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {renderStars(Math.round(averageRating), 'lg')}
                        <p className="text-brand-100 text-sm">
                            {averageRating >= 4.5 ? 'Excellent!' : averageRating >= 4 ? 'Great job!' : averageRating >= 3 ? 'Good work' : 'Keep improving'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FiMessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h3>
                    <p className="text-slate-500 text-center max-w-sm">
                        Customer feedback will appear here once they submit reviews for your completed jobs.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-200 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold text-sm">
                                            {review.customer?.firstName?.[0]}{review.customer?.lastName?.[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {review.customer?.firstName} {review.customer?.lastName}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-1">
                                    {renderStars(review.rating || 0)}
                                    <span className="text-sm font-medium text-slate-600">{review.rating || 0}/5</span>
                                </div>
                            </div>

                            {review.booking?.serviceCategory && (
                                <span className="inline-flex px-3 py-1.5 text-xs font-medium bg-brand-50 text-brand-700 rounded-lg mb-4">
                                    {review.booking.serviceCategory}
                                </span>
                            )}

                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {review.text || 'No written feedback provided.'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeReviews;
