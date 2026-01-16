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

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const fromCheckout = searchParams.get("from") === "checkout";

  const dispatch = useAppDispatch();
  const { order, loading } = useAppSelector((state: any) => state.order);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrder(orderId));
    }
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
          <p className="text-muted-foreground">The order you're looking for doesn't exist or has expired.</p>
        </div>
        <Link href="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-[100px]">
      {/* Success Header - Only show if coming from checkout */}
      {fromCheckout && (
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="mt-2 text-sm">
            Order ID: <span className="font-mono font-semibold">{order.orderNumber || order._id}</span>
          </p>
        </div>
      )}

      <Card className="p-8 shadow-lg">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

          <Badge
            variant={
              order.status === "paid" || order.status === "success"
                ? "default"
                : order.status === "pending"
                ? "secondary"
                : order.status === "cancelled"
                ? "destructive"
                : "outline"
            }
            className="text-lg px-4 py-2"
          >
            {order.status?.toUpperCase() || "PROCESSING"}
          </Badge>
        </div>

        <Separator className="mb-8" />

        {/* Order Items */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold">Items Ordered</h3>
          {order.items?.map((item: any, index: number) => {
            const hasVariation = !!item.productVariationId;
            const variation = hasVariation ? item.productVariationId : null;

            const displayImage = hasVariation && variation?.image
              ? variation.image
              : item.productId.mainImage;

            const displayPrice = hasVariation
              ? (variation?.discountPrice ?? variation?.price ?? item.productId.price)
              : (item.productId.discountPrice ?? item.productId.price);

            return (
              <div key={index} className="flex gap-6 py-4">
                <img
                  src={`${IMAGE_URL}${displayImage}`}
                  alt={item.productId.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-sm"
                />

                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{item.productId.name}</h4>

                  {/* Variation Attributes */}
                  {hasVariation && variation?.attributes && Object.keys(variation.attributes).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(variation.attributes).map(([key, value]: any) => (
                        <p key={key} className="text-sm text-muted-foreground">
                          <span className="capitalize font-medium">{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">Quantity: <strong>{item.quantity}</strong></span>
                    <span>₹{displayPrice} each</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">₹{displayPrice * item.quantity}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-8" />

        {/* Order Summary */}
        <div className="space-y-3 text-lg max-w-md ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹{order.tax}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className={order.shippingCost === 0 ? "text-emerald-600" : ""}>
              {order.shippingCost === 0 ? "Free" : `₹${order.shippingCost}`}
            </span>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-xl font-bold">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Shipping Address */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
            <div className="text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              <p>Phone: {order.shippingAddress?.phone}</p>
              <p>Email: {order.customerEmail || order.shippingAddress?.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Shipping Method</h3>
            <p className="font-medium">{order.shippingMethodId?.name || "Standard Delivery"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Estimated: {order.shippingMethodId?.estimatedDays || "5-7 business days"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="!text-white">
            <Link href="/">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/dashboard/orders">View All Orders</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}