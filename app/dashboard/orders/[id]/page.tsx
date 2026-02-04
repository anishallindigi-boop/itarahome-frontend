'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;

// Status configuration
const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  "order success": { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  processing: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Package },
  shipped: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  delivered: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: Package },
  refunded: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: IndianRupee },
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;

  const dispatch = useAppDispatch();
  const { order: orderData, loading } = useAppSelector((state: any) => state.order);
  const order = orderData?.order || orderData;

  useEffect(() => {
    if (orderId) {
      dispatch(getOrder(orderId));
    }
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary" />
        <p className="text-base sm:text-lg text-muted-foreground">Loading your order...</p>
      </div>
    );
  }

  if (!order || Object.keys(order).length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 sm:px-6 py-12">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">Order not found</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            The order you're looking for doesn't exist or has expired.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="w-4 h-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG["processing"];
  const StatusIcon = statusConfig.icon;
  const savings = order.couponDetails?.discountAmount || order.discount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12 sm:pb-16 md:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg sm:shadow-xl border-0 mt-6 sm:mt-10 rounded-xl sm:rounded-2xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide font-medium">
                    Order Details
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all sm:break-normal">
                  #{order.orderNumber}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <Badge
                className={cn(
                  "text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-semibold border whitespace-nowrap",
                  statusConfig.color
                )}
              >
                <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                {order.status?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {/* Order Items */}
            <div className="space-y-5 sm:space-y-6 mb-8">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Items Ordered ({order.items?.length || 0})
              </h3>

              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => {
                  const itemName = item.name || "Product";
                  const itemImage = item.image;
                  const itemPrice = item.price || 0;
                  const itemOriginalPrice = item.originalPrice || itemPrice;
                  const hasDiscount = itemOriginalPrice > itemPrice;
                  const attributes = item.attributes || {};
                  const attributeEntries = Object.entries(attributes);

                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={`${IMAGE_URL}${itemImage}`}
                          alt={itemName}
                          className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                          }}
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {itemName}
                        </h4>

                        {attributeEntries.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                            {attributeEntries.map(([key, value]: [string, any]) => (
                              <span
                                key={key}
                                className="text-xs px-2.5 py-1 bg-white rounded-md text-gray-600 border"
                              >
                                <span className="capitalize font-medium">{key}:</span> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-3 justify-center sm:justify-start">
                          <span className="font-semibold text-gray-900 text-base">₹{itemPrice}</span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{itemOriginalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-center sm:text-right mt-2 sm:mt-0">
                        <p className="font-bold text-base sm:text-lg">
                          ₹{itemPrice * item.quantity}
                        </p>
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

            <Separator className="my-6 sm:my-8" />

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-5 sm:mb-6 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Order Summary
              </h3>

              <div className="space-y-2.5 sm:space-y-3 text-sm sm:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{order.tax}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span className={order.shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                    {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Tag className="w-4 h-4" />
                      Discount {order.couponDetails?.code && `(${order.couponDetails.code})`}
                    </span>
                    <span className="font-medium">-₹{savings}</span>
                  </div>
                )}

                <Separator className="my-3 sm:my-4" />

                <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{order.total}</span>
                </div>

                {savings > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 You saved ₹{savings} on this order!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6 sm:my-8" />

            {/* Shipping & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Shipping Address */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 text-sm sm:text-base">
                  <p className="font-semibold text-gray-900">
                    {order.shippingAddress?.name || order.customerName}
                  </p>
                  <p className="text-gray-600 leading-relaxed break-words">
                    {order.shippingAddress?.address}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    <br />
                    PIN: {order.shippingAddress?.pincode}
                  </p>
                  {order.shippingAddress?.landmark && (
                    <p className="text-sm text-gray-500">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {order.shippingAddress?.phone || order.customerPhone}
                    </p>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Method & Tracking */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Shipping Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-4 text-sm sm:text-base">
                  <div>
                    <p className="text-gray-500 mb-1">Shipping Method</p>
                    <p className="font-semibold text-gray-900">
                      {order.shippingMethodId?.name || "Standard Delivery"}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {order.shippingMethodId?.estimatedDays || "5-7 business days"}
                    </p>
                  </div>

                  {order.trackingNumber && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-500 mb-1">Tracking Number</p>
                      <p className="font-mono font-semibold text-primary break-all">
                        {order.trackingNumber}
                      </p>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                        >
                          Track Package <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coupon Info */}
            {order.couponDetails && (
              <div className="mt-8 p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">
                      Coupon Applied: {order.couponDetails.code}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {order.couponDetails.type === "percentage"
                        ? `${order.couponDetails.value}% off`
                        : order.couponDetails.type === "fixed"
                        ? `₹${order.couponDetails.value} off`
                        : "Free shipping"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="gap-2 w-full sm:w-auto">
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