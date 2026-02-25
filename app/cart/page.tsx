'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, ShieldCheck, Truck, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCartItems,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} from '@/redux/slice/CartItemSlice';
import { useOnce } from '@/lib/useOnce';

const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL as string;

type CartItem = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    mainImage: string;
    price: number;
    discountPrice?: number;
    stock?: number;
  };
  variationId: {
    _id?: string;
    price: number;
    discountPrice?: number;
    image?: string;
    attributes?: Record<string, string>;
    stock?: number;
  } | null;
  quantity: number;
};

export default function CartPage() {
  const dispatch = useAppDispatch();
  const rawCart = useAppSelector((s: any) => s.usercart.cart) as CartItem[] | undefined;

  const [loadingItems, setLoadingItems] = useState<string[]>([]);
  const [loadingClear, setLoadingClear] = useState(false);

  useOnce(() => dispatch(getCartItems()));

  /* ---------------- RESOLVED CART ITEMS ---------------- */
  const items = useMemo(() => {
    if (!rawCart) return [];

    return rawCart.map((item) => {
      const hasVariation = !!item.variationId;
      const variation = item.variationId;

      const basePrice = hasVariation
        ? (variation?.price ?? item.productId.price)
        : item.productId.price;

      const finalPrice = hasVariation
        ? (variation?.discountPrice ?? variation?.price ?? item.productId.price)
        : (item.productId.discountPrice ?? item.productId.price);

      return {
        cartId: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        originalPrice: basePrice,
        price: finalPrice,
        image: hasVariation && variation?.image
          ? variation.image
          : item.productId.mainImage,
        stock: hasVariation ? variation?.stock ?? null : item.productId.stock ?? null,
        attributes: hasVariation ? variation?.attributes ?? {} : {},
        qty: item.quantity,
        hasDiscount: hasVariation
          ? (variation?.discountPrice && variation.discountPrice < (variation?.price ?? item.productId.price))
          : (item.productId.discountPrice && item.productId.discountPrice < item.productId.price)
      };
    });
  }, [rawCart]);

  /* ---------------- HANDLERS ---------------- */
  const changeQty = async (cartId: string, newQty: number, stock: number | null) => {
    if (stock !== null && newQty > stock) return;

    setLoadingItems((prev) => [...prev, cartId]);

    try {
      if (newQty <= 0) {
        await dispatch(removeCartItem(cartId));
      } else {
        await dispatch(updateCartQuantity({ cartId, quantity: newQty }));
      }
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== cartId));
    }
  };

  const removeItem = async (cartId: string) => {
    setLoadingItems((prev) => [...prev, cartId]);
    try {
      await dispatch(removeCartItem(cartId));
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== cartId));
    }
  };

  const clearAll = async () => {
    setLoadingClear(true);
    try {
      await dispatch(clearCart());
    } finally {
      setLoadingClear(false);
    }
  };

  /* ---------------- TOTALS ---------------- */
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  const totalSavings = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.hasDiscount) {
        return sum + (item.originalPrice - item.price) * item.qty;
      }
      return sum;
    }, 0);
  }, [items]);

  /* ---------------- EMPTY STATE ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <ShoppingBag className="w-24 h-24 text-primary/40" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10"></div>
        </div>
        
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Your cart feels lonely</h2>
          <p className="text-gray-600 mb-8">Your shopping cart is empty. Let's find something special for you!</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/shop">
            <Button size="lg" variant="outline" className="gap-2">
              <Package className="w-4 h-4" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white my-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
              </div>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <Link href="/shop">
              <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              onClick={clearAll}
              disabled={loadingClear}
              className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const isLoading = loadingItems.includes(item.cartId);
              const isOutOfStock = item.stock !== null && item.qty >= item.stock;
              const itemTotal = item.price * item.qty;

              return (
                <Card key={item.cartId} className="p-6 shadow-sm border-0 bg-white rounded-2xl hover:shadow-lg transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="shrink-0 relative">
                      <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-primary/20 transition-colors">
                        <img
                          src={`${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {item.hasDiscount && (
                        <Badge className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                          SALE
                        </Badge>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{item.name}</h3>
                          
                          {Object.keys(item.attributes).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {Object.entries(item.attributes).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="capitalize text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                            {item.hasDiscount && (
                              <>
                                <span className="text-lg text-gray-400 line-through">₹{item.originalPrice}</span>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  Save ₹{(item.originalPrice - item.price) * item.qty}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.cartId)}
                          disabled={isLoading}
                          className="hidden sm:flex text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      {item.stock !== null && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min((item.qty / item.stock) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {item.stock - item.qty} left in stock
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-6 sm:hidden">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => changeQty(item.cartId, item.qty - 1, item.stock)}
                            disabled={isLoading || item.qty <= 1}
                            className="rounded-full border-gray-300 hover:border-primary"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>

                          <span className="w-12 text-center font-semibold text-lg">{item.qty}</span>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => changeQty(item.cartId, item.qty + 1, item.stock)}
                            disabled={isLoading || isOutOfStock}
                            className="rounded-full border-gray-300 hover:border-primary"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.cartId)}
                          disabled={isLoading}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end justify-between min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => changeQty(item.cartId, item.qty - 1, item.stock)}
                          disabled={isLoading || item.qty <= 1}
                          className="rounded-full border-gray-300 hover:border-primary"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <span className="w-12 text-center font-semibold text-lg">{item.qty}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => changeQty(item.cartId, item.qty + 1, item.stock)}
                          disabled={isLoading || isOutOfStock}
                          className="rounded-full border-gray-300 hover:border-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Item Total</p>
                        <p className="text-2xl font-bold text-primary">₹{itemTotal}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 p-8 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Tag className="w-6 h-6 text-primary" />
                Order Summary
              </h3>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-gray-900">₹{subtotal}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Total Savings</span>
                      <span className="font-semibold text-green-600">-₹{totalSavings}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center text-2xl font-bold pt-2">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-primary">₹{subtotal}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full mt-8 !text-white h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>

                <div className="text-center pt-4">
                  <Link href="/shop" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fast Shipping</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <RefreshCw className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Easy Returns</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Checkout</h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}