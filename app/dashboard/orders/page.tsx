"use client";

import { useEffect, useState } from "react";
// import Image from "next/image";
import { ChevronDown, XCircle, Package, Calendar, MapPin, CreditCard, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getOrdersByCustomer, updateOrderStatus } from "@/redux/slice/OrderSlice";
import type { RootState } from "@/redux/store";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrdersPage() {

  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state: RootState) => state.order);

  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOrdersByCustomer());
  }, [dispatch]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: "cancelled" })).unwrap();
      dispatch(getOrdersByCustomer());
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setCancellingId(null);
    }
  };

  const orderList = Array.isArray(orders) ? orders : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 lg:py-10">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Orders</h1>
            <span className="text-xs sm:text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {orderList.length} Total
            </span>
          </div>

          {orderList.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No orders yet</h3>
              <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-6 px-4">
                Looks like you haven't placed any orders yet. Start shopping to see your history here.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-sm sm:text-base"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-5 sm:space-y-6">
              {orderList.map((order: any) => {
                const isOpen = openOrderId === order._id;
                const isCancelling = cancellingId === order._id;

                const statusConfig = {
                  processing: { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Processing" },
                  shipped: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Shipped" },
                  delivered: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Delivered" },
                  cancelled: { color: "bg-rose-100 text-rose-800 border-rose-200", label: "Cancelled" },
                  "order success": { color: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Confirmed" },
                };

                const statusStyle = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.processing;
                const canCancel = order.status !== "cancelled" && order.status !== "delivered";

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                                #{order.orderNumber}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusStyle.color}`}
                              >
                                {statusStyle.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-0">
                          <span className="font-bold text-slate-900 text-base sm:text-lg">
                            ₹{order.total}
                          </span>

                          <button
                            onClick={() => setOpenOrderId(isOpen ? null : order._id)}
                            className="flex items-center gap-1 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {isOpen ? "Hide" : "Details"}
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {canCancel && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="flex items-center gap-1 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200">
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-slate-900">
                                    Cancel Order #{order.orderNumber}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-500">
                                    This action cannot be undone. The order will be permanently cancelled and
                                    any payment will be refunded.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                  <AlertDialogCancel className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">
                                    Keep Order
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelOrder(order._id)}
                                    disabled={isCancelling}
                                    className="bg-rose-600 text-white hover:bg-rose-700"
                                  >
                                    {isCancelling ? (
                                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Yes, Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="px-4 py-1.5 sm:py-2 bg-slate-900 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 space-y-6">
                        {/* Order Items */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-indigo-500" />
                            Order Items ({order.items?.length || 0})
                          </h4>

                          <div className="space-y-3">
                            {(order.items || []).map((item: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200"
                              >
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                  <img
                                    src={`${API_URL}${item.productId?.mainImage || ""}`}
                                    alt={item.productId?.name || "Product"}
                                    // fill
                                    className="object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                    }}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                                    {item.productId?.name}
                                  </h5>
                                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    Qty: {item.quantity}
                                  </p>
                                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                                      ₹{item.price} each
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                                    ₹{item.price * item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                          {/* Shipping Address */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-indigo-500" />
                              Shipping Address
                            </h4>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 text-xs sm:text-sm text-slate-600 break-words">
                              <p className="font-semibold text-slate-900">{order.shippingAddress?.name}</p>
                              <p>{order.shippingAddress?.address}</p>
                              <p>
                                {order.shippingAddress?.city}, {order.shippingAddress?.state}
                              </p>
                              <p className="font-mono text-slate-400">
                                {order.shippingAddress?.pincode}
                              </p>
                              <p className="pt-2 text-slate-500">
                                {order.shippingAddress?.phone}
                              </p>
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-indigo-500" />
                              Payment Summary
                            </h4>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs sm:text-sm">
                              <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-medium">₹{order.subtotal}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Shipping</span>
                                <span className="font-medium">₹{order.shippingCost}</span>
                              </div>
                              <div className="flex justify-between text-slate-600">
                                <span>Tax</span>
                                <span className="font-medium">₹{order.tax}</span>
                              </div>

                              {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span className="text-slate-600">Coupon Discount</span>
                                  <span>-₹{order.discount}</span>
                                </div>
                              )}

                              <div className="h-px bg-slate-100 my-2" />

                              {order.couponCode && (
                                <div className="pt-2 border-t border-gray-200">
                                  <p className="text-xs sm:text-sm text-slate-600">
                                    Coupon Applied:{" "}
                                    <span className="font-medium text-green-600">
                                      {order.couponCode}
                                    </span>
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between font-bold text-slate-900 text-base sm:text-lg">
                                <span>Total</span>
                                <span className="text-indigo-600">₹{order.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}