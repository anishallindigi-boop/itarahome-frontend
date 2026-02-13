import { Star } from 'lucide-react';
import { RatingStats } from '@/redux/slice/ReviewSlice';

interface ReviewStatsProps {
  stats: RatingStats;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const { averageRating, totalReviews, ratingCounts } = stats;
  
  const renderRatingBar = (rating: number, count: number) => {
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex items-center gap-1 w-12">
          <span className="text-sm text-gray-600">{rating}</span>
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        </div>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-400 rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-8 text-right">
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Overall Rating */}
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating) 
                    ? 'fill-amber-400 text-amber-400' 
                    : i < averageRating 
                      ? 'fill-amber-400/50 text-amber-400' 
                      : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating}>
              {renderRatingBar(rating, ratingCounts[rating as keyof typeof ratingCounts])}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;