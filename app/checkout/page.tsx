"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearCart } from "@/redux/slice/CartItemSlice";
import { GetAllShipping } from "@/redux/slice/ShippingMethodSlice";
import { createOrder } from "@/redux/slice/OrderSlice";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
const GST_RATE = 0.18;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  /* ---------------- CART ---------------- */
  const rawCart = useAppSelector((s: any) => s.usercart.cart);

  /**
   * IMPORTANT:
   * If variation exists → use variation data
   * Else → use product data
   */
  const items = useMemo(
    () =>
      rawCart?.map((c: any) => {
        const hasVariation = !!c.productvariationid;

        return {
          productId: c.productId._id,
          variationId: hasVariation ? c.productvariationid._id : null,

          name: c.productId.name,
          image: c.productId.mainImage,
          qty: c.quantity,

          price: hasVariation
            ? Number(c.productvariationid.sellingPrice)
            : Number(c.productId.discountPrice || c.productId.price),

          attributes: hasVariation
            ? c.productvariationid.attributes || {}
            : {},
        };
      }) || [],
    [rawCart]
  );

  const subtotal = items.reduce(
    (sum: number, i: any) => sum + i.price * i.qty,
    0
  );

  /* ---------------- SHIPPING ---------------- */
  const { shippingMethods } = useAppSelector(
    (s: any) => s.shippingmethod
  );

  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  useEffect(() => {
    const fetchShipping = async () => {
      const res: any = await dispatch(GetAllShipping());
      if (res.payload?.length) {
        setSelectedShipping(res.payload[0]); // default select
      }
    };

    fetchShipping();
  }, [dispatch]);

  const shippingCost = selectedShipping?.price || 0;

  /* ---------------- TAX & TOTAL ---------------- */
  const tax = Math.round(subtotal * GST_RATE);
  const total = subtotal + tax + shippingCost;

  /* ---------------- ADDRESS ---------------- */
  const [address, setAddress] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e: any) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  /* ---------------- ORDER STATE ---------------- */
  const { loading } = useAppSelector((s: any) => s.order);



  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    if (!selectedShipping) {
      alert("Please select shipping method");
      return;
    }

    if (!address.name || !address.email || !address.address) {
      alert("Please fill required address fields");
      return;
    }

    /**
     * IMPORTANT:
     * Send variationId ONLY if exists
     */
    const orderItems = items.map((i: any) => ({
      productId: i.productId,
      productVariationId: i.variationId, // null for simple products
      quantity: i.qty,
      price: i.price,
    }));

    const payload = {
      status: "order success",
      customerEmail: address.email,
      customerName: address.name,
      customerPhone: address.phone,

      shippingAddress: address,
      billingAddress: address,

      shippingMethodId: selectedShipping._id,
      shippingCost,

      subtotal,
      tax,
      total,
      notes: "",

      items: orderItems,
    };

    const res = await dispatch(createOrder(payload));
    
    if (createOrder.fulfilled.match(res)) {
      const orderId = res.payload?.order?._id;
      dispatch(clearCart());
      router.push(`/orders?from=checkout&id=${orderId}`);
    } else {
      alert("Order failed");
    }
  };

  /* ---------------- EMPTY CART ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl">Your cart is empty</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-[100px]">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ADDRESS + SHIPPING */}
        <Card className="md:col-span-2 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Shipping Address</h2>

          {["name", "email", "phone", "address", "city", "state", "pincode"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={field.toUpperCase()}
                className="w-full p-3 border rounded"
                onChange={handleChange}
              />
            )
          )}

          <h2 className="text-xl font-semibold pt-4">Shipping Method</h2>

          <div className="space-y-3">
            {shippingMethods?.map((m: any) => (
              <label
                key={m._id}
                className={`flex justify-between p-3 border rounded cursor-pointer ${
                  selectedShipping?._id === m._id ? "border-black" : ""
                }`}
              >
                <div>
                  <input
                    type="radio"
                    name="shipping"
                    className="mr-2"
                    checked={selectedShipping?._id === m._id}
                    onChange={() => setSelectedShipping(m)}
                  />
                  <span className="font-medium">{m.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {m.estimatedDays}
                  </p>
                </div>
                <span>₹{m.price}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* ORDER SUMMARY */}
        <Card className="p-6 h-fit space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          {items.map((i: any, idx: number) => (
            <div key={idx} className="flex gap-3">
              <img
                src={`${IMAGE_URL}/${i.image}`}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1">
                <p className="text-sm">{i.name}</p>

                {/* VARIATION ATTRIBUTES */}
                {Object.keys(i.attributes).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(i.attributes).map(([k, v]: any) => (
                      <p key={k}>
                        {k.toUpperCase()}: {v}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-xs">Qty {i.qty}</p>
              </div>
              <p>₹{i.price * i.qty}</p>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>GST (18%)</span>
            <span>₹{tax}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>₹{shippingCost}</span>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <Button onClick={placeOrder} disabled={loading} className="w-full">
            {loading ? "Placing Order..." : "Place Order"}
          </Button>

          <Link href="/cart" className="text-sm text-center block">
            ← Back to Cart
          </Link>
        </Card>
      </div>
    </div>
  );
}
