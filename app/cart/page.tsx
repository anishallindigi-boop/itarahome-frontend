'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  // Fetch cart on mount
  useOnce(() => dispatch(getCartItems()));

  /* ---------------- RESOLVED CART ITEMS ---------------- */
  const items = useMemo(() => {
    if (!rawCart) return [];

    return rawCart.map((item) => {
      const hasVariation = !!item.variationId;
      const variation = item.variationId;

      return {
        cartId: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        // Image priority: variation image → product mainImage
        image: hasVariation && variation?.image
          ? variation.image
          : item.productId.mainImage,
        // Price priority: variation discount → variation price → product discount → product price
        price: hasVariation
          ? (variation?.discountPrice ?? variation?.price ?? item.productId.price)
          : (item.productId.discountPrice ?? item.productId.price),
        // Stock from variation or product
        stock: hasVariation ? variation?.stock ?? null : item.productId.stock ?? null,
        // Attributes only if variation exists
        attributes: hasVariation ? variation?.attributes ?? {} : {},
        qty: item.quantity,
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
  const subTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  const total = subTotal; // Shipping is free

  /* ---------------- EMPTY STATE ---------------- */
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
        </div>
        <Link href="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-[100px]">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
            const isLoading = loadingItems.includes(item.cartId);
            const isOutOfStock = item.stock !== null && item.qty >= item.stock;

            return (
              <Card key={item.cartId} className="p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="shrink-0">
                    <img
                      src={`${IMAGE_URL}${item.image}`}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>

                    {/* Variation Attributes */}
                    {Object.keys(item.attributes).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <p key={key} className="text-sm text-muted-foreground capitalize">
                            {key}: <span className="font-medium text-foreground">{value}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <p className="text-xl font-semibold mt-4">₹{item.price}</p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => changeQty(item.cartId, item.qty - 1, item.stock)}
                        disabled={isLoading || item.qty <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <span className="w-12 text-center font-medium">{item.qty}</span>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => changeQty(item.cartId, item.qty + 1, item.stock)}
                        disabled={isLoading || isOutOfStock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Item Total + Remove */}
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{item.price * item.qty}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.cartId)}
                        disabled={isLoading}
                        className="mt-2 text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <Card className="p-6 h-fit shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Order Summary</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={loadingClear}
              className="text-rose-600 hover:bg-rose-50"
            >
              <Trash className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subTotal}</span>
            </div>

         

            <Separator className="my-4" />

            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button size="lg" className="w-full mt-8" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/" className="underline hover:text-foreground">
              Continue Shopping
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}