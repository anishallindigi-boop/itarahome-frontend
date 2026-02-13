'use client';
import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Package,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Review, updateReviewStatus } from '@/redux/slice/ReviewSlice';
import { useAppDispatch } from '@/redux/hooks';

interface AdminReview extends Review {
  productId?: string;
  productName?: string;
  productSlug?: string;
}

interface AdminReviewListProps {
  reviews: AdminReview[];
  loading: boolean;
  onRefresh: () => void;
}

const AdminReviewList: React.FC<AdminReviewListProps> = ({ 
  reviews, 
  loading, 
  onRefresh 
}) => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [currentReview, setCurrentReview] = useState<AdminReview | null>(null);

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}.0</span>
      </div>
    );
  };

  const handleApproveClick = (review: AdminReview) => {
    if (!review.productId) return;
    
    setCurrentReview(review);
    setAdminResponse('');
    setApproveDialog(true);
  };

  const handleRejectClick = (review: AdminReview) => {
    if (!review.productId) return;
    
    setCurrentReview(review);
    setAdminResponse('');
    setRejectDialog(true);
  };

  const submitApprove = async () => {
    if (!currentReview || !currentReview.productId) return;

    try {
      await dispatch(updateReviewStatus({
        productId: currentReview.productId,
        reviewId: currentReview._id,
        status: 'approved',
        responseMessage: adminResponse || undefined
      })).unwrap();
      
      setApproveDialog(false);
      setAdminResponse('');
      setCurrentReview(null);
      onRefresh(); // Refresh the list
      
      // Show success message
      alert('Review approved successfully!');
    } catch (error) {
      console.error('Failed to approve review:', error);
      alert('Failed to approve review');
    }
  };

  const submitReject = async () => {
    if (!currentReview || !currentReview.productId) return;

    try {
      await dispatch(updateReviewStatus({
        productId: currentReview.productId,
        reviewId: currentReview._id,
        status: 'rejected',
        responseMessage: adminResponse || undefined
      })).unwrap();
      
      setRejectDialog(false);
      setAdminResponse('');
      setCurrentReview(null);
      onRefresh(); // Refresh the list
      
      // Show success message
      alert('Review rejected successfully!');
    } catch (error) {
      console.error('Failed to reject review:', error);
      alert('Failed to reject review');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>User & Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No reviews found
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review, index) => (
                <TableRow key={review._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{review.userId.name}</span>
                      </div>
                      {review.productName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{review.productName}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(review.rating)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {review.title && (
                        <div className="font-medium text-sm mb-1">{review.title}</div>
                      )}
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {review.comment}
                      </div>
                      {review.verifiedPurchase && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(review.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {review.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveClick(review)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectClick(review)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-3xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Review Details</DialogTitle>
                <DialogDescription>
                  Review by {selectedReview.userId.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Product Info */}
                {selectedReview.productName && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Product:</span>
                      <span className="text-primary">{selectedReview.productName}</span>
                    </div>
                    {selectedReview.productSlug && (
                      <div className="text-sm text-gray-600">
                        Slug: {selectedReview.productSlug}
                      </div>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rating:</span>
                    {renderStars(selectedReview.rating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                  {selectedReview.verifiedPurchase && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Verified Purchase
                    </Badge>
                  )}
                </div>

                {/* Review Content */}
                <div className="space-y-2">
                  {selectedReview.title && (
                    <div>
                      <h4 className="font-semibold text-lg">{selectedReview.title}</h4>
                    </div>
                  )}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(selectedReview.createdAt)}</span>
                  </div>
                  {selectedReview.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {formatDate(selectedReview.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Admin Response (if exists) */}
                {selectedReview.response && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-blue-800">Admin Response:</span>
                      <span className="text-sm text-blue-600">
                        {formatDate(selectedReview.response.respondedAt)}
                      </span>
                    </div>
                    <p className="text-blue-700">{selectedReview.response.message}</p>
                  </div>
                )}

                {/* Helpful Counts */}
                <div className="flex gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Helpful:</span> {selectedReview.helpful}
                  </div>
                  <div>
                    <span className="font-medium">Not Helpful:</span> {selectedReview.notHelpful}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReview(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Approve Review
            </DialogTitle>
            <DialogDescription>
              Add an optional response to the user (optional)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Thank you for your review! (Optional)"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              This response will be visible to the user below their review.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setApproveDialog(false);
                setAdminResponse('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Review
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this review (optional)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Please provide more details about your experience. (Optional)"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              This response will be visible to the user below their review.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectDialog(false);
                setAdminResponse('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitReject}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviewList;