"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getOrderById } from "@/redux/slice/OrderSlice";
import {
  Printer,
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Home,
  Building,
  Navigation,
  CreditCard,
  Shield,
  FileText,
  Loader2,
  Receipt,
  Store,
  Hash,
  User,
  CalendarDays,
  Tag,
  Percent,
  Landmark,
  IndianRupee,
  Stamp,
} from "lucide-react";

// Company details
const COMPANY_DETAILS = {
  name: "Itara Home",
  address: "house no - 1, sadar bazar, shankar bhawan, karnal, haryana, 132001",
  city: "Karnal",
  state: "Haryana",
  pincode: "132001",
  country: "India",
  phone: "+91 9978996817",
  email: "itaradesigns.sj@gmail.com",
  website: "www.itarahome.com",
  gstin: "06CGJPJ3628L1Z4",
  // pan: "ABCDE1234F",
  // cin: "U12345MH2020PTC123456",
  // signature: "/signature.png",
};

// Bank details
const BANK_DETAILS = {
  bankName: "State Bank of India",
  accountName: "Your Store Pvt Ltd",
  accountNumber: "12345678901234",
  ifscCode: "SBIN0001234",
  branch: "Mumbai Main Branch",
  upiId: "yourstore@okhdfcbank",
};

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
      icon: Clock,
      label: "Cancelled"
    },
    refunded: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Clock,
      label: "Refunded"
    }
  };

  const config = statusConfig[status] || statusConfig.pending_payment;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border-0 px-4 py-2 text-sm font-medium`}>
      <Icon className="w-4 h-4 mr-2" />
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
      icon: Loader2,
      label: "Processing"
    },
    charged: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle2,
      label: "Paid"
    },
    failed: {
      color: "bg-red-100 text-red-800",
      icon: Clock,
      label: "Failed"
    },
    refunded: {
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
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

// Number to words converter
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  
  return convert(num) + ' Rupees Only';
};

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [isPrinting, setIsPrinting] = useState(false);
  
  const orderId = params.id as string;
  const { order, loading } = useAppSelector((state: any) => state.order);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-primary/40" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Loading Invoice...</h3>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the order details</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Package className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invoice Not Found</h2>
          <p className="text-gray-600 mb-8">
            The invoice you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link href="/admin/orders">
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all">
                <ShoppingBag className="w-4 h-4" />
                All Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase()}`;
  const invoiceNumber = `INV-${orderNumber}`;
  const totalInWords = numberToWords(order.total || 0);
  const subtotal = order.subtotal || 0;
  const shippingCost = order.shippingCost || 0;
  const tax = order.tax || 0;
  const discount = order.discount || 0;
  const total = order.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 print:py-0 print:bg-white">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside {
            break-inside: avoid;
          }
          .print-shadow {
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {/* Action Buttons - Only Print */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="gap-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              Tax Invoice
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePrint} 
              disabled={isPrinting}
              className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              {isPrinting ? 'Preparing...' : 'Print Invoice'}
            </Button>
          </div>
        </div>

        {/* Invoice Document - Original Premium UI */}
        <div 
          className="bg-white rounded-2xl shadow-xl print:shadow-none p-8 lg:p-12 print:p-8 border border-gray-100 print:border-0 transition-all duration-300 hover:shadow-2xl"
        >
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{COMPANY_DETAILS.name}</h2>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    GST: {COMPANY_DETAILS.gstin}
                  </Badge>
                  {/* <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    PAN: {COMPANY_DETAILS.pan}
                  </Badge> */}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 py-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                <p className="text-2xl font-bold text-primary">{invoiceNumber}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Invoice Date</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <StatusBadge status={order.status} />
              <PaymentStatusBadge status={order.payment?.status || 'pending'} />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <Hash className="w-4 h-4 text-primary" />
                <span className="font-medium">Order #{orderNumber}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5 text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Company & Customer Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                Billed From
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-900 text-lg mb-2">{COMPANY_DETAILS.name}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>
                      {COMPANY_DETAILS.address},<br />
                      {COMPANY_DETAILS.city}, {COMPANY_DETAILS.state} - {COMPANY_DETAILS.pincode}<br />
                      {COMPANY_DETAILS.country}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {COMPANY_DETAILS.phone}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {COMPANY_DETAILS.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-50">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                Billed To
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-900 text-lg mb-2">{order.customerName}</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                    <span>
                      {order.shippingAddress?.addressLine1},<br />
                      {order.shippingAddress?.addressLine2 && `${order.shippingAddress.addressLine2},<br />`}
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
                      {order.shippingAddress?.country || 'India'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    {order.customerPhone}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    {order.customerEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50">
                  <Truck className="w-5 h-5 text-indigo-600" />
                </div>
                Shipping Information
              </h3>
              <div className="bg-gradient-to-br from-indigo-50/50 to-white p-5 rounded-xl border border-indigo-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Method:</p>
                    <p className="text-sm font-semibold text-gray-900">{order.shippingMethod?.name || 'Standard Delivery'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Cost:</p>
                    <p className="text-sm font-semibold text-indigo-600">₹{shippingCost}</p>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Tracking #:</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.carrier && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Carrier:</p>
                      <p className="text-sm font-semibold capitalize text-gray-900">{order.carrier}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                    <p className="text-sm text-gray-600">Est. Delivery:</p>
                    <p className="text-sm font-semibold text-indigo-600">{order.shippingMethod?.estimatedDays || '3-5 business days'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                Payment Information
              </h3>
              <div className="bg-gradient-to-br from-emerald-50/50 to-white p-5 rounded-xl border border-emerald-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Method:</p>
                    <p className="text-sm font-semibold capitalize text-gray-900">{order.payment?.gatewayResponse?.payment_method_type || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Transaction ID:</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">{order.payment?.txnId || 'N/A'}</p>
                  </div>
                  {/* {order.payment?.gatewayResponse && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Gateway Ref:</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">{order.payment.gatewayResponse.status}</p>
                    </div>
                  )} */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                    <p className="text-sm text-gray-600">Paid On:</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.payment?.initiatedAt 
                        ? new Date(order.payment.initiatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              Order Items
            </h3>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {order.items?.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                            <img
                              src={item.image || '/placeholder-product.png'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.sku && (
                              <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.attributes && Object.keys(item.attributes).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.attributes).map(([key, value]: any) => (
                              <Badge key={key} variant="outline" className="text-xs bg-gray-50 border-gray-300">
                                {key}: {value}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <p className="text-xs text-gray-400 line-through mt-0.5">₹{item.originalPrice}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900">{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coupon Details */}
          {order.couponCode && order.couponDetails && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Tag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">Coupon Applied: {order.couponCode}</p>
                    <p className="text-sm text-green-700">
                      {order.couponDetails.type === 'percentage' 
                        ? `${order.couponDetails.value}% off` 
                        : order.couponDetails.type === 'fixed'
                        ? `₹${order.couponDetails.value} off`
                        : 'Free shipping'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Discount Amount</p>
                  <p className="text-xl font-bold text-green-600">-₹{order.couponDetails.discountAmount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                Additional Notes
              </h3>
              <div className="bg-gradient-to-br from-amber-50/50 to-white p-5 rounded-xl border border-amber-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-3">
                  1. Goods once sold will not be taken back or exchanged.
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  2. This is a computer generated invoice, no signature required.
                </p>
                {/* <p className="text-sm text-gray-600 mb-3">
                  3. All disputes are subject to Mumbai jurisdiction.
                </p> */}
                {order.notes && (
                  <>
                    <Separator className="my-3 bg-amber-200" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Order Notes:</p>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </>
                )}
              </div>

              {/* Bank Details */}
              {/* <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-200 to-gray-100">
                    <Landmark className="w-4 h-4 text-gray-700" />
                  </div>
                  Bank Details
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Name:</span>
                    <span className="font-medium text-gray-900">{BANK_DETAILS.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-medium text-gray-900">{BANK_DETAILS.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account No.:</span>
                    <span className="font-medium text-gray-900 font-mono">{BANK_DETAILS.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IFSC Code:</span>
                    <span className="font-medium text-gray-900 font-mono">{BANK_DETAILS.ifscCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">UPI ID:</span>
                    <span className="font-medium text-gray-900">{BANK_DETAILS.upiId}</span>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                Invoice Summary
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold text-gray-900">₹{shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (GST 05%):</span>
                    <span className="font-semibold text-blue-600">+₹{tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator className="my-3" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-primary text-xl">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Amount in words:</p>
                    <p className="text-sm font-medium text-gray-900 mt-1 italic">{totalInWords}</p>
                  </div>
                </div>
              </div>

              {/* Tax Breakdown */}
             
            </div>
          </div>

          {/* Declaration & Signature */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Declaration
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2 rounded-lg w-fit">
                <Shield className="w-4 h-4" />
                <span>Digitally Signed Document</span>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block text-left">
                <p className="text-sm font-medium text-gray-900 mb-4">For {COMPANY_DETAILS.name}</p>
                {/* <div className="mb-2">
                  <img 
                    src={COMPANY_DETAILS.signature} 
                    alt="Signature" 
                    className="h-12 object-contain"
                  />
                </div> */}
                <Separator className="w-48 mb-2 bg-gray-300" />
                <p className="text-xs text-gray-600">Authorized Signatory</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <Stamp className="w-4 h-4" />
                  <span>Digitally Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-6 text-center text-xs text-gray-600">
              <div>
                <p className="font-semibold text-gray-900 mb-1">{COMPANY_DETAILS.website}</p>
                <p>Visit our website for more products</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{COMPANY_DETAILS.email}</p>
                <p>24/7 Customer Support</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{COMPANY_DETAILS.phone}</p>
                <p>Call us for any queries</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                This is a system generated invoice and does not require a physical signature.
                Thank you for shopping with us!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}