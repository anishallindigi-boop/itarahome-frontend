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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { checkPaymentStatus, clearOrder } from "@/redux/slice/OrderSlice";
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Wallet,
  Smartphone,
  Landmark,
  Banknote,
  IndianRupee,
  Calendar,
  Hash,
  Eye,
  Receipt,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Copy,
  Package,
  ShoppingBag,
  History,
} from "lucide-react";

// Order Status Badge
const OrderStatusBadge = ({ status }: { status: string }) => {
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
      icon: Package,
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
      icon: RefreshCw,
      label: "Refunded"
    }
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Clock,
    label: status || "Unknown"
  };
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
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      label: "Pending"
    },
    initiated: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CreditCard,
      label: "Initiated"
    },
    processing: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: RefreshCw,
      label: "Processing"
    },
    charged: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
      label: "Paid"
    },
    pending_vbv: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: Shield,
      label: "Pending Verification"
    },
    authentication_failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: AlertTriangle,
      label: "Auth Failed"
    },
    authorization_failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      label: "Auth Failed"
    },
    failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: AlertCircle,
      label: "Failed"
    },
    refunded: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: RefreshCw,
      label: "Refunded"
    },
    partially_refunded: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: RefreshCw,
      label: "Partially Refunded"
    }
  };

  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Clock,
    label: status || "Unknown"
  };
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border-0 px-3 py-1.5 text-xs font-medium`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </Badge>
  );
};

// Payment Method Badge
const PaymentMethodBadge = ({ method }: { method?: string }) => {
  const methodConfig: Record<string, { color: string; icon: any; label: string }> = {
    card: {
      color: "bg-blue-100 text-blue-800",
      icon: CreditCard,
      label: "Card"
    },
    upi: {
      color: "bg-green-100 text-green-800",
      icon: Smartphone,
      label: "UPI"
    },
    netbanking: {
      color: "bg-purple-100 text-purple-800",
      icon: Landmark,
      label: "Net Banking"
    },
    wallet: {
      color: "bg-orange-100 text-orange-800",
      icon: Wallet,
      label: "Wallet"
    },
    emi: {
      color: "bg-indigo-100 text-indigo-800",
      icon: Banknote,
      label: "EMI"
    }
  };

  if (!method) return (
    <Badge className="bg-gray-100 text-gray-800 border-0">
      <CreditCard className="w-3 h-3 mr-1" />
      <span className="text-xs">Not specified</span>
    </Badge>
  );

  const config = methodConfig[method] || { 
    color: "bg-gray-100 text-gray-800", 
    icon: CreditCard, 
    label: method 
  };
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} border-0`}>
      <Icon className="w-3 h-3 mr-1" />
      <span className="text-xs">{config.label}</span>
    </Badge>
  );
};

// Payment Details Dialog
const PaymentDetailsDialog = ({ 
  order, 
  open, 
  onClose 
}: { 
  order: {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt?: string;
    paymentMethod?: string;
    txnId?: string;
  } | null; 
  open: boolean; 
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`${field} copied to clipboard`);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Receipt className="w-6 h-6 text-primary" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Order #{order.orderNumber} - Payment transaction information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Order Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
            <Badge variant="outline" className="px-3 py-1.5">
              <Hash className="w-3.5 h-3.5 mr-1.5" />
              {order.orderNumber}
            </Badge>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-0 shadow-sm bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{order.txnId || 'N/A'}</p>
                {order.txnId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(order.txnId!, 'Transaction ID')}
                  >
                    {copied === 'Transaction ID' ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                )}
              </div>
            </Card>
            <Card className="p-4 border-0 shadow-sm bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
              <PaymentMethodBadge method={order.paymentMethod} />
            </Card>
            <Card className="p-4 border-0 shadow-sm bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Amount</p>
              <p className="text-lg font-bold text-primary">₹{order.total}</p>
            </Card>
            <Card className="p-4 border-0 shadow-sm bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Order Date</p>
              <p className="text-sm">
                {order.createdAt 
                  ? new Date(order.createdAt).toLocaleDateString('en-IN')
                  : 'N/A'}
              </p>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button asChild>
              <Link href={`/admin/orders/${order.orderNumber}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Order
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Payment Status Page
export default function PaymentStatusPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // State
  const [orderNumber, setOrderNumber] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Redux state
  const { loading, error } = useAppSelector((state: any) => state.order);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('paymentStatusHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast.error("Please enter an order number");
      return;
    }

    try {
      const result = await dispatch(checkPaymentStatus(orderNumber.trim())).unwrap();
      
      if (result.success) {
        setSearchResult(result);
        toast.success("Payment status fetched successfully");
        
        // Add to history
        const newEntry = {
          ...result.order,
          checkedAt: new Date().toISOString()
        };
        
        const updatedHistory = [
          newEntry,
          ...searchHistory.filter(h => h.orderNumber !== newEntry.orderNumber)
        ].slice(0, 10);
        
        setSearchHistory(updatedHistory);
        localStorage.setItem('paymentStatusHistory', JSON.stringify(updatedHistory));
        
        setOrderNumber("");
      }
    } catch (err: any) {
      toast.error(err || "Order not found");
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('paymentStatusHistory');
    toast.success("History cleared");
  };

  // Filter history
  const filteredHistory = searchHistory.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (paymentFilter !== 'all' && item.paymentStatus !== paymentFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                    <CreditCard className="w-8 h-8 text-primary" />
                  </div>
                  Payment Status
                </h1>
                <p className="text-gray-600 mt-1">
                  Check real-time payment status from Juspay gateway
                </p>
              </div>
            </div>
            {searchHistory.length > 0 && (
              <Button variant="outline" onClick={handleClearHistory}>
                Clear History
              </Button>
            )}
          </div>
        </div>

        {/* Quick Check Card */}
        <Card className="p-8 border-0 bg-gradient-to-br from-primary/5 to-white shadow-xl rounded-2xl mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Payment Verification</h2>
                <p className="text-gray-600">
                  Enter order number to check real-time payment status
                </p>
              </div>
            </div>
            <form onSubmit={handleCheckStatus} className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter order number (e.g., ORD-123)"
                    className="pl-10 h-12 text-base bg-white border-2 focus:border-primary"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Checking...' : 'Verify Payment'}
                </Button>
              </div>
            </form>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="mt-8 p-6 bg-white rounded-xl border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Order #{searchResult.order.orderNumber}
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(searchResult.order)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Order Status</p>
                  <OrderStatusBadge status={searchResult.order.status} />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Payment Status</p>
                  <PaymentStatusBadge status={searchResult.order.paymentStatus} />
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Amount</p>
                  <p className="text-xl font-bold text-primary">₹{searchResult.order.total}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Transaction ID</p>
                  <p className="font-mono text-sm">{searchResult.order.txnId || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Search History */}
        <Card className="border-0 bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Payment Checks</h2>
                  <p className="text-sm text-gray-600">
                    {searchHistory.length > 0 
                      ? `Last ${searchHistory.length} verified orders` 
                      : 'No payment checks yet'}
                  </p>
                </div>
              </div>
              
              {searchHistory.length > 0 && (
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Order Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-[160px]">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="charged">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Checked At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <History className="w-12 h-12 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-700">No payment checks yet</h3>
                        <p className="text-gray-500">
                          Enter an order number above to verify payment status
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item, index) => (
                    <TableRow key={`${item.orderNumber}-${index}`} className="hover:bg-gray-50/80">
                      <TableCell className="font-mono font-medium">
                        <Link 
                          href={`/admin/orders/${item.orderNumber}`}
                          className="text-primary hover:underline"
                        >
                          {item.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={item.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">₹{item.total}</span>
                      </TableCell>
                      <TableCell>
                        <PaymentMethodBadge method={item.paymentMethod} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{item.txnId || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">
                          {item.checkedAt 
                            ? new Date(item.checkedAt).toLocaleString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short'
                              })
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Real-time status from Juspay gateway
            </p>
          </div>
        </Card>
      </div>

      {/* Payment Details Dialog */}
      {selectedOrder && (
        <PaymentDetailsDialog
          order={selectedOrder}
          open={detailsDialogOpen}
          onClose={() => {
            setDetailsDialogOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}