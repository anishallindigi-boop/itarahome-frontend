'use client';
import React, { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  getAllReviews, 
  getReviewsByStatus, 
  resetState 
} from '@/redux/slice/ReviewSlice';
import AdminReviewStats from './AdminReviewStats';
import AdminReviewList from './AdminReviewList';

const AdminReviewsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    adminReviews, 
    loading, 
    error,
    adminPagination 
  } = useAppSelector((state) => state.review);
  
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReviews();
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, activeTab, currentPage]);

  const loadReviews = async () => {
    try {
      if (activeTab === 'all') {
        await dispatch(getAllReviews({ 
          page: currentPage, 
          limit: 10,
          status: 'all',
          search: searchQuery
        })).unwrap();
      } else {
        await dispatch(getReviewsByStatus({ 
          status: activeTab,
          page: currentPage,
          limit: 10
        })).unwrap();
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadReviews();
  };

  const handleExportCSV = () => {
    // CSV export logic
    const csvContent = [
      ['User', 'Product', 'Rating', 'Title', 'Comment', 'Status', 'Date'],
      ...adminReviews.map(review => [
        review.userId?.name || 'Unknown',
        (review as any).productName || '',
        review.rating,
        review.title || '',
        review.comment,
        review.status,
        new Date(review.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and moderate customer reviews
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminReviewStats reviews={adminReviews} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleTabChange('all')}
              >
                All Reviews
                <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                  {adminReviews.length}
                </span>
              </Button>
              
              <Button
                variant={activeTab === 'pending' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleTabChange('pending')}
              >
                Pending Review
                <span className="ml-auto bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                  {adminReviews.filter(r => r.status === 'pending').length}
                </span>
              </Button>
              
              <Button
                variant={activeTab === 'approved' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleTabChange('approved')}
              >
                Approved
                <span className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {adminReviews.filter(r => r.status === 'approved').length}
                </span>
              </Button>
              
              <Button
                variant={activeTab === 'rejected' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleTabChange('rejected')}
              >
                Rejected
                <span className="ml-auto bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                  {adminReviews.filter(r => r.status === 'rejected').length}
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Rating</span>
                <span className="font-semibold">
                  {adminReviews.length > 0 
                    ? (adminReviews.reduce((acc, r) => acc + r.rating, 0) / adminReviews.length).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Today's Reviews</span>
                <span className="font-semibold">
                  {adminReviews.filter(r => {
                    const today = new Date();
                    const reviewDate = new Date(r.createdAt);
                    return reviewDate.toDateString() === today.toDateString();
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Verified Purchases</span>
                <span className="font-semibold">
                  {adminReviews.filter(r => r.verifiedPurchase).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === 'all' && 'All Reviews'}
                    {activeTab === 'pending' && 'Pending Reviews'}
                    {activeTab === 'approved' && 'Approved Reviews'}
                    {activeTab === 'rejected' && 'Rejected Reviews'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminReviewList 
                    reviews={adminReviews} 
                    loading={loading}
                    onRefresh={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {adminPagination && adminPagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, adminPagination.pages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === adminPagination.pages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsDashboard;