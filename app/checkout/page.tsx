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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShieldCheck,
  Truck,
  Package,
  Lock,
  ArrowLeft,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle2,
  IndianRupee,
  Phone,
  Mail,
  Home,
  Building,
  Navigation,
  Clock,
  Gift,
  Tag,
  X,
  Loader2,
  Percent,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearCart } from "@/redux/slice/CartItemSlice";
import { GetAllShipping } from "@/redux/slice/ShippingMethodSlice";
import { createOrder } from "@/redux/slice/OrderSlice";
import { applyCoupon, clearAppliedCoupon } from "@/redux/slice/CouponSlice";

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

  /* ---------------- COUPON STATE ---------------- */
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const { appliedCoupon, loading: couponLoading, error: couponError } = useAppSelector(
    (state: any) => state.coupon
  );

  // Apply coupon handler
  const handleApplyCoupon = async () => {
  if (!couponCode.trim()) {
    toast.error("Please enter a coupon code");
    return;
  }
  
  if (couponCode.length < 3) {
    toast.error("Coupon code must be at least 3 characters");
    return;
  }

  setApplyingCoupon(true);
  
  const result: any = await dispatch(applyCoupon({
    code: couponCode.trim(),
    cartTotal: subtotal, // Send calculated subtotal
    shippingCost: shippingCost, // Send shipping cost
  }));
  
  setApplyingCoupon(false);

  if (applyCoupon.fulfilled.match(result)) {
    toast.success(`Coupon applied! You saved ₹${result.payload.discountAmount}`);
    setCouponCode("");
  } else {
    toast.error(result.payload || "Invalid coupon code");
  }
};

  // Remove coupon handler
  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
    toast.info("Coupon removed");
  };

  // Clear coupon error
  useEffect(() => {
    if (couponError) {
      toast.error(couponError);
    }
  }, [couponError]);

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
  
  // Calculate discount
  const discountAmount = appliedCoupon?.discountAmount || 0;
  
  // Calculate total with coupon
  const total = Math.max(0, subtotal + tax + shippingCost - discountAmount);

  /* ---------------- ADDRESS FORM ---------------- */
  const [address, setAddress] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!address.name.trim()) errors.name = "Name is required";
    if (!address.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(address.email)) {
      errors.email = "Invalid email format";
    }
    if (!address.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(address.phone)) {
      errors.phone = "Invalid phone number (10 digits required)";
    }
    if (!address.address.trim()) errors.address = "Address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.pincode.trim()) {
      errors.pincode = "PIN Code is required";
    } else if (!/^\d{6}$/.test(address.pincode)) {
      errors.pincode = "Invalid PIN Code (6 digits required)";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------------- ORDER STATE ---------------- */
  const { loading: orderLoading } = useAppSelector((s: any) => s.order);

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    // Validation
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    if (!selectedShipping) {
      toast.error("Please select a shipping method");
      return;
    }

    const orderItems = items.map((item) => ({
      productId: item.productId,
      productVariationId: item.variationId || undefined,
      quantity: item.qty,
      price: item.price,
    }));

    const payload: any = {
      status: "processing",
      customerName: address.name,
      customerEmail: address.email,
      customerPhone: address.phone,
      shippingAddress: {
        ...address,
      },
      billingAddress: {
        ...address,
      },
      shippingMethodId: selectedShipping._id,
      shippingCost,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      notes: "",
      items: orderItems,
    };

    // Add coupon code if applied
    if (appliedCoupon?.code) {
      payload.couponCode = appliedCoupon.code;
    }

    const res: any = await dispatch(createOrder(payload));

    if (createOrder.fulfilled.match(res)) {
      const orderId = res.payload?.order?._id;
      await dispatch(clearCart());
      dispatch(clearAppliedCoupon()); // Clear coupon after successful order
      toast.success("Order placed successfully!");
      router.push(`/orders?from=checkout&id=${orderId}`);
    } else {
      toast.error(res.payload?.message || "Order failed. Please try again.");
    }
  };

  /* ---------------- EMPTY CART ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
            <Package className="w-24 h-24 text-primary/40" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Add some amazing products to your cart before proceeding to checkout.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <Button size="lg" variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
          <Link href="/cart">
            <Button size="lg" className="gap-2">
              <Package className="w-4 h-4" />
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 my-20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Secure Checkout</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <Link href="/cart">
              <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </Button>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Complete checkout in 5 minutes
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address & Shipping */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <Card className="p-8 border-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
                  <p className="text-gray-600">Where should we deliver your order?</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4" />
                      Full Name *
                    </Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={address.name} 
                      onChange={handleChange} 
                      className={`h-12 ${formErrors.name ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={address.email} 
                      onChange={handleChange} 
                      className={`h-12 ${formErrors.email ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number *
                    </Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={address.phone} 
                      onChange={handleChange} 
                      className={`h-12 ${formErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="9876543210"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                      <Navigation className="w-4 h-4" />
                      Street Address *
                    </Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={address.address} 
                      onChange={handleChange} 
                      className={`h-12 ${formErrors.address ? 'border-red-500' : ''}`}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="mb-2 block">City *</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={address.city} 
                        onChange={handleChange} 
                        className={`h-12 ${formErrors.city ? 'border-red-500' : ''}`}
                        placeholder="Mumbai"
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="state" className="mb-2 block">State *</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={address.state} 
                        onChange={handleChange} 
                        className={`h-12 ${formErrors.state ? 'border-red-500' : ''}`}
                        placeholder="Maharashtra"
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode" className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4" />
                      PIN Code *
                    </Label>
                    <Input 
                      id="pincode" 
                      name="pincode" 
                      value={address.pincode} 
                      onChange={handleChange} 
                      className={`h-12 ${formErrors.pincode ? 'border-red-500' : ''}`}
                      placeholder="400001"
                    />
                    {formErrors.pincode && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Method */}
            <Card className="p-8 border-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-50">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Method</h2>
                  <p className="text-gray-600">How would you like your order delivered?</p>
                </div>
              </div>
              
              {shippingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : shippingMethods?.length > 0 ? (
                <RadioGroup 
                  value={selectedShipping?._id} 
                  onValueChange={(value) => {
                    const method = shippingMethods.find((m: any) => m._id === value);
                    setSelectedShipping(method);
                  }}
                  className="space-y-4"
                >
                  {shippingMethods.map((m: any) => (
                    <label
                      key={m._id}
                      className={`flex items-center justify-between p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                        selectedShipping?._id === m._id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={m._id} className="h-5 w-5" />
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <Truck className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{m.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{m.estimatedDays}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${
                          m.price === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {m.price === 0 ? 'FREE' : `₹${m.price}`}
                        </span>
                        {m.price === 0 && (
                          <p className="text-sm text-green-600 mt-1">Limited time offer</p>
                        )}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-center py-12">
                  <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No shipping methods available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6 pr-1 sm:pr-2 max-h-64">
  {items.map((item, idx) => {
    const itemTotal = item.price * item.qty;
    
    return (
      <div key={idx} className="flex gap-3 sm:gap-4 p-3 rounded-lg sm:rounded-xl transition-colors hover:bg-gray-50 group">
        {/* Product Image */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 group-hover:border-primary/50 transition-colors">
            <img
              src={`${IMAGE_URL}${item.image}`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Quantity Badge */}
          <div className="absolute -top-1.5 -right-1.5 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
            {item.qty}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
            <div className="flex-1 min-w-0">
              {/* Product Name */}
              <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1 sm:line-clamp-2">
                {item.name}
              </p>
              
              {/* Variation Attributes */}
              {Object.keys(item.attributes).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(item.attributes).slice(0, 2).map(([key, value]: any) => (
                    <Badge 
                      key={key} 
                      variant="outline" 
                      className="text-xs px-1.5 sm:px-2 py-0.5 capitalize"
                    >
                      {key}: {value}
                    </Badge>
                  ))}
                  {Object.keys(item.attributes).length > 2 && (
                    <Badge variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5">
                      +{Object.keys(item.attributes).length - 2} more
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Price per unit - Mobile Only */}
              <p className="sm:hidden text-sm text-gray-600 mt-1">
                ₹{item.price} × {item.qty}
              </p>
            </div>

            {/* Item Total - Desktop Only */}
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-gray-900 text-base">
                ₹{itemTotal}
              </p>
              <p className="text-sm text-gray-600">
                ₹{item.price} × {item.qty}
              </p>
            </div>
          </div>
        </div>

        {/* Item Total - Mobile Only */}
        <div className="sm:hidden flex items-center">
          <p className="font-semibold text-gray-900">
            ₹{itemTotal}
          </p>
        </div>
      </div>
    );
  })}
</div>

              <Separator className="my-6" />

              {/* COUPON CODE SECTION */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="w-4 h-4" />
                      Have a coupon code?
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          placeholder="Enter code (e.g., SAVE20)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="h-11 pl-9 uppercase"
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="h-11 px-4"
                      >
                        {applyingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter your coupon code to get exclusive discounts
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-sm text-green-700">
                            {appliedCoupon.type === 'percentage' 
                              ? `${appliedCoupon.value}% off` 
                              : appliedCoupon.type === 'fixed'
                              ? `₹${appliedCoupon.value} off`
                              : 'Free shipping'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-green-800 flex items-center justify-between">
                        <span>You saved:</span>
                        <span className="font-bold text-lg">₹{discountAmount}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Price Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    GST (18%)
                  </span>
                  <span className="text-blue-600 font-semibold">+₹{tax}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingCost === 0 ? 'FREE' : `+₹${shippingCost}`}
                  </span>
                </div>

                {/* Discount Row */}
                {appliedCoupon && (
                  <div className="flex justify-between text-lg">
                    <span className="text-green-600 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Discount ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold text-green-600">-₹{discountAmount}</span>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">Total Amount</span>
                    <p className="text-sm text-gray-500 mt-1">Including all taxes and charges</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">₹{total}</span>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{subtotal} + ₹{tax} GST + ₹{shippingCost} shipping
                      {appliedCoupon && ` - ₹${discountAmount} discount`}
                    </p>
                  </div>
                </div>

                {/* Savings Badge */}
                {appliedCoupon && (
                  <div className="bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-lg text-center">
                    🎉 You saved ₹{discountAmount} on this order!
                  </div>
                )}

                {/* Place Order Button */}
                <Button
                  size="lg"
                  className="w-full mt-8 !text-white h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={placeOrder}
                  disabled={orderLoading || shippingLoading}
                >
                  {orderLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Place Order • ₹{total}
                    </>
                  )}
                </Button>

                {/* Continue Shopping */}
                <div className="text-center pt-6">
                  <Link href="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}