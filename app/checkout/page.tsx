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
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Wallet,
  Landmark,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  clearCart,
  updateCartQuantity,
  removeCartItem,
  getCartItems 
} from "@/redux/slice/CartItemSlice";
import { GetAllShipping } from "@/redux/slice/ShippingMethodSlice";
import { 
  createOrder, 
  initiatePayment,
  resetOrderState,
  clearOrder 
} from "@/redux/slice/OrderSlice";
import { applyCoupon, clearAppliedCoupon } from "@/redux/slice/CouponSlice";
import { Order } from "@/redux/slice/OrderSlice";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL as string;
const GST_RATE = 0.05; // 18% GST

// Payment method options
const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay via Visa, Mastercard, RuPay, Amex',
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'Pay via Google Pay, PhonePe, Paytm, BHIM',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: Landmark,
    description: 'All major banks supported',
  },
  {
    id: 'wallet',
    name: 'Wallet',
    icon: Wallet,
    description: 'Paytm, PhonePe, Amazon Pay, Mobikwik',
  },
  {
    id: 'emi',
    name: 'EMI',
    icon: Banknote,
    description: 'No cost EMI options available',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  /* ---------------- LOADING STATES ---------------- */
  const [loadingItems, setLoadingItems] = useState<string[]>([]);
  const [loadingClear, setLoadingClear] = useState(false);

  /* ---------------- PAYMENT STATE ---------------- */
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('card');
  const [processingPayment, setProcessingPayment] = useState(false);

  /* ---------------- CART DATA ---------------- */
  const rawCart = useAppSelector((s: any) => s.usercart.cart) as any[] | undefined;

  // Order state
  const { loading: orderLoading, paymentUrl, sessionId, order: createdOrder } = useAppSelector(
    (s: any) => s.order
  );

  // Fetch fresh cart data on mount
  useEffect(() => {
    dispatch(getCartItems());
    // Reset order state when component mounts
    dispatch(resetOrderState());
    dispatch(clearOrder());
  }, [dispatch]);

  // Redirect to payment when payment URL is available
  useEffect(() => {
    if (paymentUrl && sessionId) {
      // Store order ID in session storage for reference
      if (createdOrder?._id) {
        sessionStorage.setItem('pendingOrderId', createdOrder._id);
        sessionStorage.setItem('paymentSessionId', sessionId);
      }
      
      // Redirect to payment gateway
      window.location.href = paymentUrl;
    }
  }, [paymentUrl, sessionId, createdOrder]);

  const items = useMemo(() => {
    if (!rawCart || rawCart.length === 0) return [];

    return rawCart.map((c: any) => {
      const hasVariation = !!c.variationId;
      const variation = c.variationId;

      return {
        cartId: c._id,
        productId: c.productId._id,
        variationId: hasVariation ? variation?._id : null,
        name: c.productId.name,
        image: hasVariation && variation?.image
          ? variation.image
          : c.productId.mainImage,
        qty: c.quantity,
        stock: hasVariation ? variation?.stock ?? null : c.productId.stock ?? null,
        price: hasVariation
          ? (variation?.discountPrice ?? variation?.price ?? c.productId.price)
          : (c.productId.discountPrice ?? c.productId.price),
        originalPrice: hasVariation
          ? (variation?.price ?? c.productId.price)
          : c.productId.price,
        attributes: hasVariation ? (variation?.attributes ?? {}) : {},
      };
    });
  }, [rawCart]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  /* ---------------- CART HANDLERS ---------------- */
  const changeQty = async (cartId: string, newQty: number, stock: number | null) => {
    if (stock !== null && newQty > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }

    setLoadingItems((prev) => [...prev, cartId]);

    try {
      if (newQty <= 0) {
        await dispatch(removeCartItem(cartId));
        toast.success("Item removed from cart");
      } else {
        await dispatch(updateCartQuantity({ cartId, quantity: newQty }));
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== cartId));
    }
  };

  const removeItem = async (cartId: string) => {
    setLoadingItems((prev) => [...prev, cartId]);
    try {
      await dispatch(removeCartItem(cartId));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== cartId));
    }
  };

  const clearAllItems = async () => {
    setLoadingClear(true);
    try {
      await dispatch(clearCart());
      toast.success("Cart cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cart");
    } finally {
      setLoadingClear(false);
    }
  };

  /* ---------------- COUPON STATE ---------------- */
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const { appliedCoupon, loading: couponLoading, error: couponError } = useAppSelector(
    (state: any) => state.coupon
  );

  /* ---------------- SHIPPING METHODS ---------------- */
  const { shippingMethods, loading: shippingLoading } = useAppSelector(
    (s: any) => s.shippingmethod
  );

  const [selectedShipping, setSelectedShipping] = useState<any>(null);

  // Fetch shipping methods on component mount
  useEffect(() => {
    dispatch(GetAllShipping());
  }, [dispatch]);

  // Auto-select first shipping method when methods are loaded
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

  // Calculate total items
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

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
      cartTotal: subtotal,
      shippingCost: shippingCost,
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
    
    if (name === 'pincode') {
      const pincode = value.replace(/\D/g, '').slice(0, 6);
      setAddress({ ...address, [name]: pincode });
    } else {
      setAddress({ ...address, [name]: value });
    }
    
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

  /* ---------------- PLACE ORDER & INITIATE PAYMENT ---------------- */
  /* ---------------- PLACE ORDER & INITIATE PAYMENT ---------------- */
const placeOrderAndPay = async () => {
  // Validation
  if (!validateForm()) {
    toast.error("Please fix the errors in the form");
    return;
  }
  
  if (!selectedShipping) {
    toast.error("Please select a shipping method");
    return;
  }

  if (!selectedPaymentMethod) {
    toast.error("Please select a payment method");
    return;
  }

  setProcessingPayment(true);

  try {
    // Step 1: Create Order - matches your backend expected format
    const orderItems = items.map((item) => ({
      productId: item.productId,
      productVariationId: item.variationId || undefined,
      quantity: item.qty,
      price: item.price,
      // These fields are optional but your backend might use them
      name: item.name,
      image: item.image,
      attributes: item.attributes,
      originalPrice: item.originalPrice,
    }));

    const orderData: Partial<Order> = {
      customerName: address.name,
      customerEmail: address.email,
      customerPhone: address.phone,
      shippingAddress: {
        addressLine1: address.address,
        addressLine2: address.landmark || "",
        city: address.city,
        state: address.state,
        postalCode: address.pincode,
        country: "India",
      },
      billingAddress: {
        addressLine1: address.address,
        addressLine2: address.landmark || "",
        city: address.city,
        state: address.state,
        postalCode: address.pincode,
        country: "India",
      },
      shippingMethodId: selectedShipping._id,
      shippingCost: selectedShipping.price || 0,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      notes: "",
      items: orderItems,
      ipAddress: null as any, // Will be set by backend
      userAgent: navigator.userAgent,
        couponCode: appliedCoupon?.code || null,

    };

    // Add coupon code if applied
    if (appliedCoupon?.code) {
      orderData.couponCode = appliedCoupon.code;
    }

    console.log("Creating order with data:", orderData); // Debug log

    const orderResult: any = await dispatch(createOrder(orderData));

    if (createOrder.fulfilled.match(orderResult)) {
      const createdOrder = orderResult.payload?.order;
      const orderId = createdOrder?._id;
      
      if (!orderId) {
        throw new Error("Order ID not received from server");
      }

      console.log("Order created successfully:", createdOrder);

      // Step 2: Initiate Payment
      toast.info("Redirecting to payment gateway...");
      
      const paymentResult: any = await dispatch(initiatePayment(orderId));

      if (initiatePayment.fulfilled.match(paymentResult)) {
        console.log("Payment initiated:", paymentResult.payload);
        
        // Clear cart and coupon after successful initiation
        await dispatch(clearCart());
        dispatch(clearAppliedCoupon());
        
        // Store order info in session storage for reference
        sessionStorage.setItem('lastOrder', JSON.stringify({
          orderNumber: createdOrder.orderNumber,
          orderId: createdOrder._id,
          total: createdOrder.total
        }));
        
        // Payment URL will trigger redirect via useEffect
      } else {
        throw new Error(paymentResult.payload || "Payment initiation failed");
      }
    } else {
      throw new Error(orderResult.payload?.message || "Order creation failed");
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    toast.error(error.message || "Failed to process order");
    setProcessingPayment(false);
  }
};

  // Check for existing pending order on page load
  useEffect(() => {
    const pendingOrderId = sessionStorage.getItem('pendingOrderId');
    const paymentSessionId = sessionStorage.getItem('paymentSessionId');
    
    if (pendingOrderId && paymentSessionId) {
      // Ask user if they want to continue with pending payment
      toast.info("You have a pending payment. Redirecting to payment...");
      
      // Clear stored data
      sessionStorage.removeItem('pendingOrderId');
      sessionStorage.removeItem('paymentSessionId');
    }
  }, []);

  /* ---------------- EMPTY CART ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="text-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-24 h-24 text-primary/40" />
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
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
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <Link href="/cart">
              <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              onClick={clearAllItems}
              disabled={loadingClear}
              className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address, Shipping & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cart Items with Quantity Controls */}
            <Card className="p-6 border-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Review Your Items</h2>
                  <p className="text-gray-600">You can adjust quantities here</p>
                </div>
              </div>

              <div className="space-y-6">
                {items.map((item) => {
                  const isLoading = loadingItems.includes(item.cartId);
                  const isOutOfStock = item.stock !== null && item.qty >= item.stock;
                  const itemTotal = item.price * item.qty;

                  return (
                    <div key={item.cartId} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-colors">
                      {/* Product Image */}
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={`${IMAGE_URL}${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {item.stock !== null && item.qty >= item.stock && (
                          <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                            Max Stock
                          </Badge>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {item.name}
                            </h3>
                            
                            {/* Attributes */}
                            {Object.keys(item.attributes).length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {Object.entries(item.attributes).map(([key, value]: any) => (
                                  <Badge 
                                    key={key} 
                                    variant="outline" 
                                    className="text-xs px-2 py-0.5 capitalize"
                                  >
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-primary">₹{item.price}</span>
                              {item.originalPrice > item.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{item.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Item Total</p>
                            <p className="text-lg font-bold text-gray-900">₹{itemTotal}</p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => changeQty(item.cartId, item.qty - 1, item.stock)}
                              disabled={isLoading || item.qty <= 1}
                              className="rounded-full w-8 h-8 border-gray-300 hover:border-primary"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>

                            <span className="w-12 text-center font-semibold text-lg">
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                item.qty
                              )}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => changeQty(item.cartId, item.qty + 1, item.stock)}
                              disabled={isLoading || isOutOfStock}
                              className="rounded-full w-8 h-8 border-gray-300 hover:border-primary"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.cartId)}
                            disabled={isLoading}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Stock Status */}
                        {item.stock !== null && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${Math.min((item.qty / item.stock) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {item.stock - item.qty} left
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

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
                  
                  <div>
                    <Label htmlFor="landmark" className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4" />
                      Landmark (Optional)
                    </Label>
                    <Input 
                      id="landmark" 
                      name="landmark" 
                      value={address.landmark} 
                      onChange={handleChange} 
                      className="h-12"
                      placeholder="Near City Mall, Opposite Park"
                    />
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="pincode" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        PIN Code *
                      </Label>
                    </div>
                    <div className="relative">
                      <Input 
                        id="pincode" 
                        name="pincode" 
                        value={address.pincode} 
                        onChange={handleChange} 
                        className={`h-12 pl-9 ${formErrors.pincode ? 'border-red-500' : ''}`}
                        placeholder="400001"
                        maxLength={6}
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {formErrors.pincode && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Method */}
            <Card className="p-8 border-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-green-50">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Method</h2>
                    <p className="text-gray-600">
                      Select your preferred delivery option
                    </p>
                  </div>
                </div>
                {selectedShipping && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Estimated Delivery: {selectedShipping.estimatedDays || '3-5 business days'}
                  </Badge>
                )}
              </div>
              
              {shippingLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="text-gray-600">Loading shipping methods...</p>
                </div>
              ) : shippingMethods?.length > 0 ? (
                <RadioGroup 
                  value={selectedShipping?._id} 
                  onValueChange={(value) => {
                    const method = shippingMethods.find((m: any) => m._id === value);
                    setSelectedShipping(method);
                    // Recalculate coupon with new shipping cost if coupon is applied
                    if (appliedCoupon) {
                      dispatch(applyCoupon({
                        code: appliedCoupon.code,
                        cartTotal: subtotal,
                        shippingCost: method?.price || 0,
                      }));
                    }
                  }}
                  className="space-y-4"
                >
                  {shippingMethods.map((m: any) => (
                    <label
                      key={m._id}
                      className={`flex items-center justify-between p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                        selectedShipping?._id === m._id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={m._id} className="h-5 w-5" />
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${m.price === 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Truck className={`w-5 h-5 ${m.price === 0 ? 'text-green-600' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{m.name}</p>
                              {m.price === 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  Free Delivery
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {m.estimatedDays || '3-5 business days'}
                              </p>
                            </div>
                            {m.description && (
                              <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${
                          m.price === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {m.price === 0 ? 'FREE' : `₹${m.price}`}
                        </span>
                        {m.price > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Delivery charge</p>
                        )}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No Shipping Methods Available
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Please contact customer support for assistance with your delivery.
                  </p>
                </div>
              )}

              {/* Delivery Promise */}
              {selectedShipping && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Delivery Promise</p>
                    <p className="text-xs text-blue-600">
                      Your order will be delivered by {selectedShipping.estimatedDays || '3-5 business days'}. 
                      Tracking information will be provided once shipped.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card className="p-8 border-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-gray-600">Select your preferred payment option</p>
                </div>
              </div>
              
              <RadioGroup 
                value={selectedPaymentMethod} 
                onValueChange={setSelectedPaymentMethod}
                className="space-y-4"
              >
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                        selectedPaymentMethod === method.id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={method.id} className="h-5 w-5" />
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-gray-100">
                            <Icon className="w-5 h-5 text-gray-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600 mt-0.5">{method.description}</p>
                          </div>
                        </div>
                      </div>
                      {method.id === 'upi' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Instant
                        </Badge>
                      )}
                      {method.id === 'emi' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          No Cost EMI
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </RadioGroup>

              {/* Secure Payment Badge */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Your payment information is secure. We use 256-bit encryption and are PCI DSS compliant.
                </p>
              </div>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" />
                Order Summary
              </h2>

              {/* Order Items Summary (Compact) */}
              <div className="space-y-3 mb-6 pr-1 sm:pr-2 max-h-48 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden border border-gray-200">
                        <img
                          src={`${IMAGE_URL}${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-1">
                        {item.name}
                      </span>
                      <span className="text-gray-500">×{item.qty}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
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
                          disabled={orderLoading || processingPayment}
                        />
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim() || orderLoading || processingPayment}
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
                        disabled={orderLoading || processingPayment}
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
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    GST (05%)
                  </span>
                  <span className="text-blue-600 font-semibold">+₹{tax}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <div className="text-right">
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingCost === 0 ? 'FREE' : `+₹${shippingCost}`}
                    </span>
                    {selectedShipping && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedShipping.name}
                      </p>
                    )}
                  </div>
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
                    <p className="text-xs text-gray-500 mt-1">Including all taxes & charges</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">₹{total}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{subtotal} + ₹{tax} GST + {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`} shipping
                      {appliedCoupon && ` - ₹${discountAmount} discount`}
                    </p>
                  </div>
                </div>

                {/* Place Order & Pay Button */}
                <Button
                  size="lg"
                  className="w-full mt-8 !text-white h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={placeOrderAndPay}
                  disabled={
                    orderLoading || 
                    shippingLoading || 
                    !selectedShipping ||
                    !selectedPaymentMethod ||
                    items.length === 0 ||
                    processingPayment
                  }
                >
                  {orderLoading || processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {orderLoading ? 'Creating Order...' : 'Redirecting to Payment...'}
                    </>
                  ) : !selectedShipping ? (
                    <>
                      <Truck className="w-5 h-5 mr-2" />
                      Select Shipping Method
                    </>
                  ) : !selectedPaymentMethod ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Select Payment Method
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay ₹{total} via {
                        PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name || 'Card'
                      }
                    </>
                  )}
                </Button>

                {/* Selected Shipping & Payment Summary */}
                <div className="mt-4 space-y-2 text-xs text-gray-500">
                  {selectedShipping && (
                    <div className="flex items-center justify-between">
                      <span>Delivery by:</span>
                      <span className="font-medium text-gray-700">
                        {selectedShipping.estimatedDays || '3-5 business days'}
                      </span>
                    </div>
                  )}
                  {selectedPaymentMethod && (
                    <div className="flex items-center justify-between">
                      <span>Payment:</span>
                      <span className="font-medium text-gray-700">
                        {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    By placing your order, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* Security Badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    SSL Secure
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    Encrypted
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    PCI DSS
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
