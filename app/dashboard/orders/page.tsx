"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, XCircle } from "lucide-react"; // added cancel icon
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


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector(
    (state: RootState) => state.order
  );

  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null);

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getOrdersByCustomer());
  }, [dispatch]);

  const handleCancelOrder = async () => {
    if (!confirmOrderId) return;

    setUpdatingOrderId(confirmOrderId);
    try {
      await dispatch(
        updateOrderStatus({ id: confirmOrderId, status: "cancelled" })
      ).unwrap();

      dispatch(getOrdersByCustomer())
      setConfirmOrderId(null);
    } catch (error: any) {

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
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${order.status === "processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "order success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}>
                    {order.status}
                  </span>

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
                      className={`w-4 h-4 transition-transform ${openOrder === order._id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* CANCEL ORDER BUTTON */}
                  {order.status !== "Order cancelled" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => setConfirmOrderId(order._id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      </AlertDialogTrigger>


                      <Link href={`/dashboard/orders/${order.orderNumber}`}

                        className="border-1 p-2 bg-primary !text-white cursor-pointer text-sm font-medium"
                      >
                        View

                      </Link>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancel this order?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your order will be permanently cancelled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setConfirmOrderId(null)}
                          >
                            No, keep order
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={handleCancelOrder}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {updatingOrderId === order._id ? "Cancelling..." : "Yes, cancel"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

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
                        <div key={item._id} className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                            <img
                              src={`${API_URL}${item.productId.mainImage}`}
                              alt={item.productId.name}
                              // fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <p className="font-medium">{item.productId.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>

                          <p className="font-semibold">₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADDRESS + TOTAL */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* ADDRESS */}
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <p>{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>{order.shippingAddress.pincode}</p>
                        <p>{order.shippingAddress.phone}</p>
                      </div>
                    </div>

                    {/* TOTAL */}
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
