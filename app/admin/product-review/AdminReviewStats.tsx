import React from 'react';
import { 
  Star, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Review } from '@/redux/slice/ReviewSlice';

interface AdminReviewStatsProps {
  reviews: Review[];
}

const AdminReviewStats: React.FC<AdminReviewStatsProps> = ({ reviews }) => {
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    averageRating: reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0,
    verifiedPurchases: reviews.filter(r => r.verifiedPurchase).length,
  };

  const statCards = [
    {
      title: 'Total Reviews',
      value: stats.total,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-50',
      trend: '+12%'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-50',
      trend: `${stats.pending > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%`
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600 bg-green-50',
      trend: `${stats.approved > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%`
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-600 bg-red-50',
      trend: `${stats.rejected > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.color}`}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              {stat.trend} from last month
            </p>
          </CardContent>
        </Card>
      ))}
      
      {/* Average Rating Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Average Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="text-gray-500">out of 5</div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(stats.averageRating) 
                    ? 'fill-amber-400 text-amber-400' 
                    : i < stats.averageRating 
                      ? 'fill-amber-400/50 text-amber-400' 
                      : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{stats.verifiedPurchases} verified purchases</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.pending}</span>
                <span className="text-gray-500 text-sm">
                  ({stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.approved}</span>
                <span className="text-gray-500 text-sm">
                  ({stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Rejected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.rejected}</span>
                <span className="text-gray-500 text-sm">
                  ({stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviewStats;