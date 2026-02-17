"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAllOrders,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  initiateRefund,
} from "@/redux/slice/OrderSlice";
import {
  ShoppingBag,
  IndianRupee,
  Package,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  CreditCard,
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Users,
  ShoppingCart,
  Percent,
  Mail,
  Phone,
  MapPin,
  Building,
  Home,
  CalendarDays,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Receipt,
  DownloadCloud,
  Printer,
  AlertTriangle,
} from "lucide-react";

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending_payment: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      label: "Pending Payment"
    },
    payment_initiated: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CreditCard,
      label: "Payment Initiated"
    },
    order_success: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
      label: "Order Success"
    },
    processing: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Package,
      label: "Processing"
    },
    shipped: {
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: Truck,
      label: "Shipped"
    },
    delivered: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
      label: "Delivered"
    },
    cancelled: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      label: "Cancelled"
    },
    refunded: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: RotateCcw,
      label: "Refunded"
    },
       created: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
      label: "created"
    },
       failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      label: "failed"
    },

  };

  const config = statusConfig[status] || statusConfig.pending_payment;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border-0 px-3 py-1.5 text-xs font-medium`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </Badge>
  );
};

// Payment Status Badge
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      label: "Pending"
    },
    initiated: {
      color: "bg-blue-100 text-blue-800",
      icon: CreditCard,
      label: "Initiated"
    },
    processing: {
      color: "bg-purple-100 text-purple-800",
      icon: RefreshCw,
      label: "Processing"
    },
    charged: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle2,
      label: "Paid"
    },
    failed: {
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
      label: "Failed"
    },
    refunded: {
      color: "bg-gray-100 text-gray-800",
      icon: RotateCcw,
      label: "Refunded"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border-0`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: any) => {
  const colorVariants: Record<string, string> = {
    primary: "from-primary/10 to-primary/5 text-primary",
    green: "from-green-500/10 to-green-500/5 text-green-600",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-600",
    orange: "from-orange-500/10 to-orange-500/5 text-orange-600",
    red: "from-red-500/10 to-red-500/5 text-red-600",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
    yellow: "from-yellow-500/10 to-yellow-500/5 text-yellow-600",
  };

  return (
    <Card className="p-6 border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <TrendingUpIcon className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}% vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${colorVariants[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

// Order Details Dialog Component - FIXED VERSION
const OrderDetailsDialog = ({ orderId, open, onClose }: { orderId: string; open: boolean; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const { order, loading } = useAppSelector((state: any) => state.order);
  const [updating, setUpdating] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | undefined>();
  const [cancelReason, setCancelReason] = useState("");
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    trackingUrl: "",
    carrier: "",
  });

  useEffect(() => {
    if (open && orderId) {
      dispatch(getOrderById(orderId));
    }
    // Reset states when dialog opens
    setCancelReason("");
    setRefundAmount(undefined);
    setTrackingInfo({ trackingNumber: "", trackingUrl: "", carrier: "" });
  }, [dispatch, orderId, open]);

  const handleStatusUpdate = async (status: string) => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setUpdating(true);
    try {
      const payload: any = { id: orderId, status };
      
      if (status === 'shipped') {
        if (!trackingInfo.trackingNumber) {
          toast.error("Tracking number is required for shipped status");
          setUpdating(false);
          return;
        }
        if (!trackingInfo.carrier) {
          toast.error("Carrier is required for shipped status");
          setUpdating(false);
          return;
        }
        payload.trackingNumber = trackingInfo.trackingNumber;
        payload.trackingUrl = trackingInfo.trackingUrl;
        payload.carrier = trackingInfo.carrier;
      }

      const result = await dispatch(updateOrderStatus(payload));
      if (updateOrderStatus.fulfilled.match(result)) {
        toast.success(`Order status updated to ${status.replace('_', ' ')}`);
        dispatch(getOrderById(orderId));
        setTrackingInfo({ trackingNumber: "", trackingUrl: "", carrier: "" });
      } else {
        toast.error(result.payload || "Failed to update order status");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setUpdating(true);
    try {
      const result = await dispatch(cancelOrder({ 
        id: orderId, 
        reason: cancelReason 
      }));
      
      if (cancelOrder.fulfilled.match(result)) {
        toast.success("Order cancelled successfully");
        dispatch(getOrderById(orderId));
        setCancelReason("");
      } else {
        toast.error(result.payload || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || refundAmount <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (refundAmount > order?.total) {
      toast.error(`Refund amount cannot exceed ₹${order?.total}`);
      return;
    }

    setUpdating(true);
    try {
      const result = await dispatch(initiateRefund({ 
        id: orderId, 
        amount: refundAmount 
      }));
      
      if (initiateRefund.fulfilled.match(result)) {
        toast.success("Refund initiated successfully");
        dispatch(getOrderById(orderId));
        setRefundAmount(undefined);
      } else {
        toast.error(result.payload || "Failed to initiate refund");
      }
    } catch (error) {
      toast.error("Failed to initiate refund");
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Receipt className="w-6 h-6 text-primary" />
            Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            View and manage order details, update status, process refunds
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Status & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <PaymentStatusBadge status={order.payment?.status || 'pending'} />
                <Badge variant="outline" className="px-3 py-1.5">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={updating}>
                      {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Package className="w-4 h-4 mr-2" />}
                      Update Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Change Order Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate('processing')}
                      disabled={order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate('shipped')}
                      disabled={order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Shipped
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate('delivered')}
                      disabled={order.status === 'delivered' || order.status === 'cancelled' || order.status === 'refunded'}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Delivered
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        document.getElementById('cancel-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-red-600"
                      disabled={order.status === 'cancelled' || order.status === 'delivered' || order.status === 'refunded'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Customer Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-gray-500 text-xs">Customer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customerEmail}</p>
                      <p className="text-gray-500 text-xs">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customerPhone}</p>
                      <p className="text-gray-500 text-xs">Phone</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Shipping Address
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{order.shippingAddress?.addressLine1}</p>
                      {order.shippingAddress?.addressLine2 && (
                        <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </p>
                      <p className="text-sm text-gray-600">{order.shippingAddress?.postalCode}</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress?.country || 'India'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Shipping Method
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{order.shippingMethod?.name || 'Standard Delivery'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium">₹{order.shippingCost || 0}</span>
                  </div>
                  {order.trackingNumber && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tracking #:</span>
                          <span className="font-medium font-mono text-sm">{order.trackingNumber}</span>
                        </div>
                        {order.carrier && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Carrier:</span>
                            <span className="font-medium">{order.carrier}</span>
                          </div>
                        )}
                        {order.trackingUrl && (
                          <Button variant="link" className="p-0 h-auto" asChild>
                            <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                              Track Shipment
                            </a>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">
                      {order.payment?.method || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium font-mono text-sm">{order.payment?.txnId || 'N/A'}</span>
                  </div>
                  {order.payment?.gatewayReferenceId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gateway Ref:</span>
                      <span className="font-medium font-mono text-sm">{order.payment.gatewayReferenceId}</span>
                    </div>
                  )}
                  {order.payment?.cardDetails && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Card:</span>
                      <span className="font-medium">•••• {order.payment.cardDetails.last4}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Payment Status:</span>
                    <PaymentStatusBadge status={order.payment?.status || 'pending'} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Tracking Update for Shipped Status */}
            {order.status === 'processing' && (
              <Card className="p-6 border-0 shadow-md bg-blue-50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-700">
                  <Truck className="w-5 h-5" />
                  Mark as Shipped
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="trackingNumber">Tracking Number *</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      value={trackingInfo.trackingNumber}
                      onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carrier">Carrier *</Label>
                    <Select
                      value={trackingInfo.carrier}
                      onValueChange={(value) => setTrackingInfo({ ...trackingInfo, carrier: value })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delhivery">Delhivery</SelectItem>
                        <SelectItem value="bluedart">Blue Dart</SelectItem>
                        <SelectItem value="fedex">FedEx</SelectItem>
                        <SelectItem value="dtdc">DTDC</SelectItem>
                        <SelectItem value="indiapost">India Post</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trackingUrl">Tracking URL (Optional)</Label>
                    <Input
                      id="trackingUrl"
                      placeholder="https://..."
                      value={trackingInfo.trackingUrl}
                      onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingUrl: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleStatusUpdate('shipped')}
                  disabled={!trackingInfo.trackingNumber || !trackingInfo.carrier || updating}
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                  {updating ? 'Updating...' : 'Confirm Shipment'}
                </Button>
              </Card>
            )}

            {/* Cancel Order Section */}
            {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'refunded' && (
              <Card id="cancel-section" className="p-6 border-0 shadow-md border-red-200 bg-red-50/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Cancel Order
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cancelReason" className="text-red-700">
                      Reason for Cancellation *
                    </Label>
                    <Textarea
                      id="cancelReason"
                      placeholder="Please provide a reason for cancelling this order..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-1.5 border-red-200 focus:border-red-400 focus:ring-red-400"
                    />
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleCancelOrder}
                    disabled={!cancelReason.trim() || updating}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    {updating ? 'Cancelling...' : 'Confirm Cancellation'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Refund Section */}
            {order.status === 'delivered' && order.payment?.status === 'charged' && (
              <Card className="p-6 border-0 shadow-md border-orange-200 bg-orange-50/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-600">
                  <RotateCcw className="w-5 h-5" />
                  Process Refund
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="refundAmount">Refund Amount (Max: ₹{order.total})</Label>
                    <div className="relative mt-1.5">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="refundAmount"
                        type="number"
                        placeholder="Enter amount"
                        className="pl-9"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                        max={order.total}
                        min="1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum refund amount: ₹{order.total}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={handleRefund}
                    disabled={!refundAmount || refundAmount > order.total || refundAmount <= 0 || updating}
                  >
                    {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                    {updating ? 'Processing...' : 'Initiate Refund'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Order Items */}
            <Card className="p-6 border-0 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.attributes).map(([key, value]: any) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-600 mt-1">SKU: {item.sku || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-primary mt-1">
                            Subtotal: ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <Badge variant="outline" className="text-sm">
                  Order Total
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">₹{order.shippingCost || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST):</span>
                  <span className="font-medium">₹{order.tax || 0}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{order.total || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <Link href={`/admin/orders/${order._id}`}>
              <FileText className="w-4 h-4 mr-2" />
              View Invoice
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Admin Orders Page
export default function AdminOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Redux
  const { orders, stats, loading } = useAppSelector((state: any) => state.order);
  const { pagination } = useAppSelector((state: any) => state.order) || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchOrders();
    dispatch(getOrderStats());
  }, [dispatch, currentPage, itemsPerPage, statusFilter, paymentStatusFilter]);

  const fetchOrders = () => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };
    
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    if (paymentStatusFilter !== 'all') {
      params.paymentStatus = paymentStatusFilter;
    }
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    dispatch(getAllOrders(params));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setViewDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchOrders();
    dispatch(getOrderStats());
    toast.success("Orders refreshed");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-primary" />
                Orders Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and track all customer orders, process payments, and handle shipments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {/* <Button variant="outline">
                <DownloadCloud className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button> */}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
            icon={IndianRupee}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            icon={Clock}
            color="yellow"
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Delivered Orders"
            value={stats?.deliveredOrders || 0}
            icon={CheckCircle2}
            color="emerald"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 border-0 bg-white shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Today's Orders</p>
                <p className="text-xl font-bold text-gray-900">{stats?.todayOrders || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">{stats?.monthOrders || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Paid Orders</p>
                <p className="text-xl font-bold text-gray-900">{stats?.paidOrders || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-gray-900">{stats?.cancelledOrders || 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg. Order Value</p>
                <p className="text-xl font-bold text-gray-900">
                  ₹{stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Percent className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Conversion</p>
                <p className="text-xl font-bold text-gray-900">68%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-6 border-0 bg-white shadow-lg mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by order #, customer, email, phone..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
            
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="charged">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="border-0 bg-white shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[100px]">Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Shiprocket</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-gray-600">Loading orders...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-700">No orders found</h3>
                        <p className="text-gray-500 max-w-sm">
                          {searchTerm || statusFilter !== 'all' || paymentStatusFilter !== 'all'
                            ? 'Try adjusting your filters to see more results'
                            : 'No orders have been placed yet'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order: any) => (
                    <TableRow key={order._id} className="hover:bg-gray-50/80 transition-colors">
                      <TableCell className="font-mono font-medium">
                        <Link 
                          href={`/admin/orders/${order._id}`}
                          className="text-primary hover:underline"
                        >
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-500">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100">
                          {order.items?.length || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-gray-900">₹{order.total?.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={order.payment?.gatewayResponse?.status || 'pending'} />
                      </TableCell>
                         <TableCell>
                       <StatusBadge status= {order.shiprocketDetails.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewOrder(order._id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order._id}`}>
                                <FileText className="w-4 h-4 mr-2" />
                                View Invoice
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && orders?.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} of{' '}
                {pagination?.total || 0} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 text-sm bg-gray-100 rounded-lg">
                  Page {currentPage} of {pagination?.pages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination?.pages || 1))}
                  disabled={currentPage === (pagination?.pages || 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pagination?.pages || 1)}
                  disabled={currentPage === (pagination?.pages || 1)}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Order Details Dialog */}
      {selectedOrderId && (
        <OrderDetailsDialog
          orderId={selectedOrderId}
          open={viewDialogOpen}
          onClose={() => {
            setViewDialogOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </div>
  );
}
