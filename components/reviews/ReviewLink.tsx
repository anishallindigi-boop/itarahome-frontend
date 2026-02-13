import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewLinkProps {
  slug: string;
  averageRating: number;
  totalReviews: number;
}

const ReviewLink: React.FC<ReviewLinkProps> = ({ 
  slug, 
  averageRating, 
  totalReviews 
}) => {
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Stars */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${
              i < Math.floor(averageRating) 
                ? 'fill-amber-400 text-amber-400' 
                : i < averageRating 
                  ? 'fill-amber-400/50 text-amber-400' 
                  : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Rating and Link */}
      <button
        onClick={scrollToReviews}
        className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-primary transition-colors"
      >
        <span className="font-medium">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-gray-400 mx-1">|</span>
        <span>
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </span>
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ReviewLink;