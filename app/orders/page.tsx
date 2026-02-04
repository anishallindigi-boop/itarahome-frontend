'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getOrder } from "@/redux/slice/OrderSlice";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Tag,
  IndianRupee,
  Home,
  ArrowRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;

// Status configuration for badges
const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  'order success': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  'processing': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package },
  'shipped': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  'delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  'cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: Package },
  'refunded': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: IndianRupee },
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const fromCheckout = searchParams.get("from") === "checkout";

  const dispatch = useAppDispatch();
  // Handle nested response structure
  const { order: orderData, loading } = useAppSelector((state: any) => state.order);
  
  // Extract order from nested structure if needed
  const order = orderData?.order || orderData;

  useEffect(() => {
    if (orderId) {
      dispatch(getOrder(orderId));
    }
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading your order...</p>
      </div>
    );
  }

  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
          <p className="text-muted-foreground max-w-md">
            The order you're looking for doesn't exist or has expired.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="w-4 h-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Get status config or default
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['processing'];
  const StatusIcon = statusConfig.icon;

  // Calculate savings from coupon
  const savings = order.couponDetails?.discountAmount || order.discount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        {fromCheckout && (
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              Thank you for your purchase. We've sent a confirmation email to{' '}
              <span className="font-medium text-gray-900">{order.customerEmail}</span>
            </p>
          </div>
        )}

        <Card className="overflow-hidden shadow-xl border-0">
          {/* Order Header Banner */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-sm text-gray-600 uppercase tracking-wide font-medium">
                    Order Details
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  #{order.orderNumber}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <Badge
                className={cn(
                  "text-sm px-4 py-2 font-semibold border",
                  statusConfig.color
                )}
              >
                <StatusIcon className="w-4 h-4 mr-2" />
                {order.status?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="p-8">
            {/* Order Items */}
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Items Ordered ({order.items?.length || 0})
              </h3>
              
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => {
                  // Use enriched data from new schema
                  const itemName = item.name || 'Product';
                  const itemImage = item.image;
                  const itemPrice = item.price || 0;
                  const itemOriginalPrice = item.originalPrice || itemPrice;
                  const hasDiscount = itemOriginalPrice > itemPrice;
                  
                  // Handle attributes (could be Map or plain object)
                  const attributes = item.attributes || {};
                  const attributeEntries = Object.entries(attributes);

                  return (
                    <div 
                      key={index} 
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={`${IMAGE_URL}${itemImage}`}
                          alt={itemName}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {itemName}
                        </h4>

                        {/* Variation Attributes */}
                        {attributeEntries.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {attributeEntries.map(([key, value]: [string, any]) => (
                              <span 
                                key={key} 
                                className="text-xs px-2 py-1 bg-white rounded-md text-gray-600 border"
                              >
                                <span className="capitalize font-medium">{key}:</span> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-3">
                          <span className="font-semibold text-gray-900">₹{itemPrice}</span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{itemOriginalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-lg">₹{itemPrice * item.quantity}</p>
                        {hasDiscount && (
                          <p className="text-xs text-green-600 mt-1">
                            Saved ₹{(itemOriginalPrice - itemPrice) * item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{order.tax}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span className={order.shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                    {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}
                  </span>
                </div>

                {/* Coupon Discount */}
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Discount {order.couponDetails?.code && `(${order.couponDetails.code})`}
                    </span>
                    <span className="font-medium">-₹{savings}</span>
                  </div>
                )}

                <Separator className="my-4" />
                
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{order.total}</span>
                </div>

                {/* Savings Summary */}
                {savings > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 text-center font-medium">
                      🎉 You saved ₹{savings} on this order!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Shipping & Customer Info */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <p className="font-semibold text-gray-900 text-lg">
                    {order.shippingAddress?.name || order.customerName}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {order.shippingAddress?.address}<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                    PIN: {order.shippingAddress?.pincode}
                  </p>
                  {order.shippingAddress?.landmark && (
                    <p className="text-sm text-gray-500">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {order.shippingAddress?.phone || order.customerPhone}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Shipping Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Shipping Method</p>
                    <p className="font-semibold text-gray-900">
                      {order.shippingMethodId?.name || "Standard Delivery"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.shippingMethodId?.estimatedDays || "5-7 business days"}
                    </p>
                  </div>

                  {/* Tracking Info */}
                  {order.trackingNumber && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                      <p className="font-mono font-semibold text-primary">
                        {order.trackingNumber}
                      </p>
                      {order.trackingUrl && (
                        <a 
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                          Track Package <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coupon Info Banner */}
            {order.couponDetails && (
              <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Coupon Applied: {order.couponDetails.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.couponDetails.type === 'percentage' 
                        ? `${order.couponDetails.value}% off`
                        : order.couponDetails.type === 'fixed'
                        ? `₹${order.couponDetails.value} off`
                        : 'Free shipping'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="gap-2">
                <Link href="/dashboard/orders">
                  <Package className="w-4 h-4" />
                  View All Orders
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}