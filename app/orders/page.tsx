"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getOrder } from "@/redux/slice/OrderSlice";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

export default function OrdersPage({ params }: { params: { id: string } }) {
 const searchParams = useSearchParams();

  const orderId = searchParams.get("id");


  const dispatch = useAppDispatch();

  // Assuming you store user email in auth slice or localStorage


  const { order, loading } = useAppSelector((s: any) => s.order);


  useEffect(() => {
if(orderId){

  dispatch(getOrder(orderId));
}

  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!order || order.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl">You have no order yet.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-[100px] space-y-6">
      <h1 className="text-3xl font-bold mb-6">My order</h1>

     
        <Card key={order._id} className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
            <span
              className={`px-3 py-1 rounded text-white ${
                order.status === "pending"
                  ? "bg-yellow-500"
                  : order.status === "paid"
                  ? "bg-green-500"
                  : order.status === "cancelled"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            >
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
           
              <div  className="flex gap-3 orders-center">
                <img
                  src={`${IMAGE_URL}/${order.items[0].productId.mainImage}`}
                  className="w-14 h-14 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{order.items[0].productId.name}</p>
                  <p className="text-xs">Qty: {order.items[0].quantity}</p>
                </div>
                <p>₹{order.subtotal}</p>
              </div>
          
          </div>

          <Separator />

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{order.tax}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{order.shippingCost}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>

          <Link href={`/orders/${order._id}`} className="text-blue-500 text-sm">
            View Details
          </Link>
        </Card>
   
    </div>
  );
}
