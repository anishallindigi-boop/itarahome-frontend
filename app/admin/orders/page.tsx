"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAllOrders,
  updateOrderStatus,
} from "@/redux/slice/OrderSlice";
import type { RootState } from "@/redux/store";
import {
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_COLORS: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  "order success": "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  processing: <Clock className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  "order success": <CheckCircle className="w-4 h-4" />,
};

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((state: RootState) => state.order);

  // DEBUG: Log what's in Redux state

  
  // Extract orders array - check multiple possibilities
  let ordersData = orders;




  const [openDetails, setOpenDetails] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<"today" | "yesterday" | "week" | "all">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    // console.log("Dispatching getAllOrders...");
    dispatch(getAllOrders());
  }, [dispatch]);

 const handleStatusChange = async (orderId: string, newStatus: string) => {
  setUpdating(orderId);
  try {
    // Dispatch the update and wait for it
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
    
    // Success - no need to refetch all orders
    // console.log(`Order ${orderId} status updated to ${newStatus}`);
    
  } catch (err: any) {
    // console.error("Status update failed:", err);
    
    // Show specific error message if available
    const errorMessage = err?.message || err || "Update failed";
    alert(`Failed to update status: ${errorMessage}`);
    
    // Refetch orders to reset any partial changes
    dispatch(getAllOrders());
  } finally {
    setUpdating(null);
  }
};

  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // If no orders after loading, show empty state
  if (!ordersData || ordersData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No orders found</h3>
            <p className="mt-2 text-gray-500">
              There are no orders in the system yet.
            </p>
            <button
              onClick={() => dispatch(getAllOrders())}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Group orders by relative date (only if we have data)
  // ────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const grouped = ordersData.reduce((acc: Record<string, any[]>, order: any) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);

    let group = "older";

    if (orderDate.getTime() === today.getTime()) group = "today";
    else if (orderDate.getTime() === yesterday.getTime()) group = "yesterday";
    else if (orderDate >= weekStart) group = "thisWeek";

    if (!acc[group]) acc[group] = [];
    acc[group].push(order);
    return acc;
  }, {});

  // Apply quick filter + custom date range
  let filteredOrders = ordersData;

  if (quickFilter !== "all") {
    if (quickFilter === "today") filteredOrders = grouped.today || [];
    else if (quickFilter === "yesterday") filteredOrders = grouped.yesterday || [];
    else if (quickFilter === "week") filteredOrders = grouped.thisWeek || [];
  }

  // Custom date range filter (overrides quick filter when both dates are set)
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    filteredOrders = filteredOrders.filter((order: any) => {
      const d = new Date(order.createdAt);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }

  // Re-group filtered orders for display
  const displayGrouped = filteredOrders.reduce((acc: Record<string, any[]>, order: any) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);

    let group = "older";
    if (orderDate.getTime() === today.getTime()) group = "today";
    else if (orderDate.getTime() === yesterday.getTime()) group = "yesterday";
    else if (orderDate >= weekStart) group = "thisWeek";

    if (!acc[group]) acc[group] = [];
    acc[group].push(order);
    return acc;
  }, {});

  // console.log("Display grouped:", displayGrouped);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + Filters */}
        <div className="mb-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders Dashboard</h1>
              <p className="mt-1 text-gray-600">
                {ordersData.length} total orders
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setQuickFilter("today")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  quickFilter === "today" ? "bg-indigo-600 text-white shadow" : "bg-white border hover:bg-gray-50"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setQuickFilter("yesterday")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  quickFilter === "yesterday" ? "bg-indigo-600 text-white shadow" : "bg-white border hover:bg-gray-50"
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => setQuickFilter("week")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  quickFilter === "week" ? "bg-indigo-600 text-white shadow" : "bg-white border hover:bg-gray-50"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setQuickFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  quickFilter === "all" ? "bg-indigo-600 text-white shadow" : "bg-white border hover:bg-gray-50"
                }`}
              >
                All
              </button>

              <button
                onClick={() => dispatch(getAllOrders())}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by date:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setQuickFilter("all");
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Orders Content */}
        {!filteredOrders || filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No orders found with current filters</h3>
            <p className="mt-2 text-gray-500">
              Try changing the date filter or refresh the list.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(displayGrouped).map(([groupKey, groupOrders]) =>
              groupOrders && groupOrders.length > 0 ? (
                <section key={groupKey}>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    {groupKey === "today" ? "Today" :
                     groupKey === "yesterday" ? "Yesterday" :
                     groupKey === "thisWeek" ? "This Week" : "Older Orders"}
                    <span className="text-gray-500 font-normal text-base">
                      ({groupOrders.length})
                    </span>
                  </h2>

                  <div className="space-y-5">
                    {groupOrders.map((order: any) => {
                      const isOpen = openDetails === order._id;

                      return (
                        <div
                          key={order._id}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Order Header */}
                          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                              <div className="bg-indigo-100 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  #{order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {new Date(order.createdAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {order.customerName} • {order.customerEmail}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}
                              >
                                {STATUS_ICONS[order.status] || <Clock className="w-4 h-4" />}
                                {order.status}
                              </span>

                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                disabled={updating === order._id}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white min-w-[140px]"
                              >
                                <option value="">select status</option>

                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <button
                                onClick={() => setOpenDetails(isOpen ? null : order._id)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                              >
                                {isOpen ? "Hide" : "View Details"}
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Details */}
                          {isOpen && (
                            <div className="p-6 bg-gray-50">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Items */}
                                <div className="lg:col-span-2">
                                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-indigo-600" />
                                    Items ({order.items.length})
                                  </h3>

                                  <div className="space-y-4">
                                    {order.items.map((item: any,index: number) => {
                                      const variation = item.productId?.variations?.find(
                                        (v: any) => v._id === item.productVariationId
                                      );

                                      const imageSrc = variation?.image || item.productId?.mainImage;

                                      const attributesText = variation?.attributes
                                        ? Object.entries(variation.attributes)
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(" • ")
                                        : "";


                                          const itemKey = item._id || `${order._id}-item-${index}`;
                                      return (
                                        <div
                                          key={itemKey}
                                          className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200"
                                        >
                                          <div className="flex-shrink-0">
                                            <img
                                              src={`${API_URL}${imageSrc}`}
                                              alt={item.productId?.name}
                                              className="w-20 h-20 object-cover rounded-md border"
                                              onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                                            />
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">
                                              {item.productId?.name}
                                              {variation && (
                                                <span className="text-sm text-gray-500 ml-2">
                                                  ({variation.sku || "variant"})
                                                </span>
                                              )}
                                            </p>

                                            {attributesText && (
                                              <p className="text-sm text-gray-600 mt-1">
                                                {attributesText}
                                              </p>
                                            )}

                                            <div className="mt-2 text-sm text-gray-600">
                                              Qty: <strong>{item.quantity}</strong> × ₹{item.price}
                                            </div>
                                          </div>

                                          <div className="text-right font-medium">
                                            ₹{item.price * item.quantity}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Summary & Address */}
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 space-y-3 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>₹{order.subtotal}</span>
                                      </div>
                                      
                                      {/* Show coupon discount if applied */}
                                      {order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                          <span className="text-gray-600">Coupon Discount</span>
                                          <span>-₹{order.discount}</span>
                                        </div>
                                      )}
                                      
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>₹{order.shippingCost}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span>₹{order.tax}</span>
                                      </div>
                                      <div className="flex justify-between pt-3 border-t font-semibold text-base">
                                        <span>Total</span>
                                        <span className="text-indigo-700">₹{order.total}</span>
                                      </div>
                                      
                                      {/* Show coupon code if applied */}
                                      {order.couponCode && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                          <p className="text-sm text-gray-600">
                                            Coupon Applied: <span className="font-medium text-green-600">{order.couponCode}</span>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
                                    <div className="bg-white p-5 rounded-lg border border-gray-200 text-sm space-y-1 text-gray-700">
                                      <p className="font-medium">{order.shippingAddress.name}</p>
                                      <p>{order.shippingAddress.email}</p>
                                      <p>{order.shippingAddress.phone}</p>
                                      <p>{order.shippingAddress.address}</p>
                                      <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                      </p>
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
                </section>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}