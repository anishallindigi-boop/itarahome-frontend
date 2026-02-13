import React, { useEffect, useState } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addReview } from '@/redux/slice/ReviewSlice';

interface ReviewFormProps {
  productId: string;
  onClose?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error, success } = useAppSelector((state) => state.review);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle success state
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter your review comment');
      return;
    }

    dispatch(addReview({
      productId,
      reviewData: {
        rating,
        title: title.trim(),
        comment: comment.trim()
      }
    }));
  };

  const handleReset = () => {
    setRating(5);
    setTitle('');
    setComment('');
    setShowSuccess(false);
    if (onClose) onClose();
  };

  // Success message component
  if (showSuccess) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Review Submitted!
          </h3>
          
          <p className="text-gray-600 mb-4">
            Thank you for your review. It will be visible after approval.
          </p>
          
          <div className="text-sm text-gray-500 mb-6">
            <p>This dialog will close automatically in a few seconds...</p>
          </div>
          
          <Button
            onClick={handleReset}
            variant="outline"
            className="min-w-[120px]"
          >
            Close Now
          </Button>
        </div>
      </div>
    );
  }

  // Original form
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating}.0 out of 5
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <Input
            id="review-title"
            placeholder="Summarize your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {title.length}/100
          </div>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <Textarea
            id="review-comment"
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            required
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-right mt-1">
            {comment.length}/1000
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewForm;