import React, { useState, useEffect } from 'react';
import { Star, Filter, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getProductReviews } from '@/redux/slice/ReviewSlice';
import ReviewStats from './ReviewStats';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId, productName }) => {
  const dispatch = useAppDispatch();
  const { 
    reviews, 
    stats, 
    pagination, 
    loading,
    error 
  } = useAppSelector((state) => state.review);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    dispatch(getProductReviews({ 
      productId, 
      page: currentPage, 
      sort: sortBy,
      limit: 10
    }));
  }, [dispatch, productId, currentPage, sortBy]);

  const handleMarkHelpful = (reviewId: string, helpful: boolean) => {
    // This will be handled in the parent component
    console.log('Mark helpful:', reviewId, helpful);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Refresh reviews
    dispatch(getProductReviews({ 
      productId, 
      page: 1, 
      sort: sortBy 
    }));
  };

  return (
    <div className="mt-12 md:mt-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews
          </h2>
          <p className="text-gray-600 mt-1">
            Read what other customers think about {productName}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm 
            productId={productId} 
            onClose={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Stats and Controls */}
      <div className="space-y-6">
        {/* Rating Stats */}
        {stats && stats.totalReviews > 0 && (
          <ReviewStats stats={stats} />
        )}

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {reviews.length} of {stats?.totalReviews || 0} reviews
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Review List */}
        <ReviewList 
          reviews={reviews} 
          onMarkHelpful={handleMarkHelpful}
          loading={loading}
        />

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            {[...Array(pagination.pages)].map((_, i) => {
              const page = i + 1;
              // Show limited page numbers
              if (
                page === 1 ||
                page === pagination.pages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;