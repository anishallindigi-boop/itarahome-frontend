"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getOrdersByCustomer,
  updateOrderStatus,
} from "@/redux/slice/OrderSlice";
import type { RootState } from "@/redux/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector(
    (state: RootState) => state.order
  );

  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOrdersByCustomer());
  }, [dispatch]);

  const handleStatusChange = async (
    orderId: string,
    status: string
  ) => {
    setUpdatingOrderId(orderId);
    try {
      await dispatch(
        updateOrderStatus({ id: orderId, status })
      ).unwrap();
    } catch (error) {
      alert("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-gray-500">
          You haven’t placed any orders yet.
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="border rounded-xl shadow-sm bg-white overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-gray-50">
                <div>
                  <p className="font-semibold">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* STATUS BADGE */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm capitalize
                    ${
                      order.status === "processing"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>

                  {/* STATUS SELECT */}
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order._id}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="border rounded-md px-2 py-1 text-sm capitalize"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  {/* DETAILS TOGGLE */}
                  <button
                    onClick={() =>
                      setOpenOrder(
                        openOrder === order._id ? null : order._id
                      )
                    }
                    className="flex items-center gap-1 text-sm font-medium"
                  >
                    Details
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openOrder === order._id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* DETAILS */}
              {openOrder === order._id && (
                <div className="p-6 space-y-6">
                  {/* ITEMS */}
                  <div>
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item: any) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4"
                        >
                          <img
                            src={`${API_URL}/uploads/${item.productId.mainImage}`}
                            alt={item.productId.name}
                            className="w-20 h-20 object-cover rounded border"
                          />

                          <div className="flex-1">
                            <p className="font-medium">
                              {item.productId.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <p className="font-semibold">
                            ₹{item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADDRESS + TOTAL */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">
                        Shipping Address
                      </h3>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                        </p>
                        <p>{order.shippingAddress.pincode}</p>
                        <p>{order.shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Shipping</span>
                        <span>₹{order.shippingCost}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tax</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
