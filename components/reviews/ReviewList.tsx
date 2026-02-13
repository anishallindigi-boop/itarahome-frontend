import React from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Calendar } from 'lucide-react';
import { Review } from '@/redux/slice/ReviewSlice';

interface ReviewListProps {
  reviews: Review[];
  onMarkHelpful: (reviewId: string, helpful: boolean) => void;
  loading?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onMarkHelpful, loading }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {review.userId.avatar ? (
                  <img
                    src={review.userId.avatar}
                    alt={review.userId.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-semibold">
                    {review.userId.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{review.userId.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            {review.verifiedPurchase && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3" />
                Verified Purchase
              </div>
            )}
          </div>

          {/* Review Title */}
          {review.title && (
            <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
          )}

          {/* Review Comment */}
          <p className="text-gray-600 mb-4">{review.comment}</p>

          {/* Admin Response */}
          {review.response && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-semibold">
                    A
                  </span>
                </div>
                <span className="font-medium text-blue-900">Admin Response</span>
                <span className="text-xs text-blue-600">
                  {formatDate(review.response.respondedAt)}
                </span>
              </div>
              <p className="text-blue-800 text-sm">{review.response.message}</p>
            </div>
          )}

          {/* Helpful Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onMarkHelpful(review._id, true)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
              <button
                onClick={() => onMarkHelpful(review._id, false)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ThumbsDown className="w-4 h-4" />
                Not Helpful ({review.notHelpful})
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;