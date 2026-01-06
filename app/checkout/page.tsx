'use client';
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearCart } from "@/redux/slice/CartItemSlice";
import { GetAllShipping } from "@/redux/slice/ShippingMethodSlice";
import { createOrder } from "@/redux/slice/OrderSlice";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;
const GST_RATE = 0.18; // 18% GST

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  /* ---------------- CART DATA ---------------- */
  const rawCart = useAppSelector((s: any) => s.usercart.cart) as any[] | undefined;

  const items = useMemo(() => {
    if (!rawCart || rawCart.length === 0) return [];

    return rawCart.map((c: any) => {
      const hasVariation = !!c.variationId;
      const variation = c.variationId;

      return {
        productId: c.productId._id,
        variationId: hasVariation ? variation?._id : null,
        name: c.productId.name,
        image: hasVariation && variation?.image
          ? variation.image
          : c.productId.mainImage,
        qty: c.quantity,
        price: hasVariation
          ? (variation?.discountPrice ?? variation?.price ?? c.productId.price)
          : (c.productId.discountPrice ?? c.productId.price),
        attributes: hasVariation ? (variation?.attributes ?? {}) : {},
      };
    });
  }, [rawCart]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  /* ---------------- SHIPPING METHODS ---------------- */
  const { shippingMethods, loading: shippingLoading } = useAppSelector(
    (s: any) => s.shippingmethod
  );

  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  useEffect(() => {
    dispatch(GetAllShipping());
  }, [dispatch]);

  useEffect(() => {
    if (shippingMethods?.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingMethods[0]);
    }
  }, [shippingMethods, selectedShipping]);

  const shippingCost = selectedShipping?.price || 0;

  /* ---------------- TAX & TOTAL ---------------- */
  const tax = Math.round(subtotal * GST_RATE);
  const total = subtotal + tax + shippingCost;

  /* ---------------- ADDRESS FORM ---------------- */
  const [address, setAddress] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  /* ---------------- ORDER STATE ---------------- */
  const { loading: orderLoading } = useAppSelector((s: any) => s.order);

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    // Basic validation
    if (!selectedShipping) {
      alert("Please select a shipping method");
      return;
    }
    if (!address.name || !address.email || !address.phone || !address.address || !address.city || !address.pincode) {
      alert("Please fill all required fields");
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      productVariationId: item.variationId || undefined, // send only if exists
      quantity: item.qty,
      price: item.price,
    }));

    const payload = {
      status: "processing", // or "order success" as per your backend
      customerName: address.name,
      customerEmail: address.email,
      customerPhone: address.phone,
      shippingAddress: {
        ...address,
      },
      billingAddress: {
        ...address, // assuming same as shipping
      },
      shippingMethodId: selectedShipping._id,
      shippingCost,
      subtotal,
      tax,
      total,
      notes: "",
      items: orderItems,
    };

    const res: any = await dispatch(createOrder(payload));

    if (createOrder.fulfilled.match(res)) {
      const orderId = res.payload?.order?._id;
      await dispatch(clearCart());
      router.push(`/orders?from=checkout&id=${orderId}`);
    } else {
      alert(res.payload?.message || "Order failed. Please try again.");
    }
  };

  /* ---------------- EMPTY CART ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground">Add items to proceed to checkout.</p>
        </div>
        <Link href="/cart">
          <Button size="lg">Go to Cart</Button>
        </Link>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-[100px]">
      <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Address & Shipping */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" value={address.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" value={address.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" value={address.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input id="address" name="address" value={address.address} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" value={address.city} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input id="state" name="state" value={address.state} onChange={handleChange} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pincode">PIN Code *</Label>
                <Input id="pincode" name="pincode" value={address.pincode} onChange={handleChange} required />
              </div>
            </div>
          </Card>

          {/* Shipping Method */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Shipping Method</h2>
            {shippingLoading ? (
              <p>Loading shipping options...</p>
            ) : shippingMethods?.length > 0 ? (
              <RadioGroup value={selectedShipping?._id} onValueChange={(value) => {
                const method = shippingMethods.find((m: any) => m._id === value);
                setSelectedShipping(method);
              }}>
                {shippingMethods.map((m: any) => (
                  <label
                    key={m._id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={m._id} />
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-sm text-muted-foreground">{m.estimatedDays}</p>
                      </div>
                    </div>
                    <span className="font-semibold">₹{m.price}</span>
                  </label>
                ))}
              </RadioGroup>
            ) : (
              <p>No shipping methods available</p>
            )}
          </Card>
        </div>

        {/* Right: Order Summary */}
        <Card className="p-6 h-fit shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <img
                  src={`${IMAGE_URL}${item.image}`}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  {Object.keys(item.attributes).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Object.entries(item.attributes).map(([key, value]: any) => (
                        <span key={key}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                          {", "}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-3 text-lg">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? "text-emerald-600" : ""}>
                {shippingCost === 0 ? "Free" : `₹${shippingCost}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full mt-8"
            onClick={placeOrder}
            disabled={orderLoading}
          >
            {orderLoading ? "Placing Order..." : "Place Order"}
          </Button>

          <div className="text-center mt-4">
            <Link href="/cart" className="text-sm text-muted-foreground hover:underline">
              ← Back to Cart
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}