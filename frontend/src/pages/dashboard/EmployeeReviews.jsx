/**
 * Employee Reviews Page
 * Displays customer reviews for the logged-in employee
 */

import { useEffect, useState } from 'react';
import { FiRefreshCw, FiStar, FiMessageSquare } from 'react-icons/fi';
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

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
                    <p className="text-gray-600">What customers are saying about your work</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={fetchReviews}
                >
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-wrap items-center gap-4 justify-between">
                <div>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-bold text-gray-800">{Number(averageRating).toFixed(1)}</span>
                        <span className="text-gray-500">/ 5</span>
                    </div>
                </div>
                <div className="text-right">
                    {renderStars(Math.round(averageRating))}
                    <p className="text-sm text-gray-500 mt-1">{reviews.length} total review(s)</p>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                    <FiMessageSquare className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Customer feedback will appear here once submitted.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {review.customer?.firstName} {review.customer?.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-1">
                                    {renderStars(review.rating || 0)}
                                    <span className="text-sm text-gray-600">{review.rating || 0}/5</span>
                                </div>
                            </div>

                            {review.booking?.serviceCategory && (
                                <p className="text-sm text-blue-700 bg-blue-50 inline-flex px-2 py-1 rounded-md mb-3">
                                    {review.booking.serviceCategory}
                                </p>
                            )}

                            <p className="text-gray-700 whitespace-pre-wrap">
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