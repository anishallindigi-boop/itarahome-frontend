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

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

/* ---------------- TYPE ---------------- */
type CartResolvedItem = {
  cartId: string;
  productId: string;
  variationId: string | null;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number | null;
  attributes: Record<string, string>;
};

export default function CartPage() {
  const dispatch = useAppDispatch();
  const rawCart = useAppSelector(
    (s: any) => s.usercart.cart
  ) as any[] | undefined;

  useOnce(() => dispatch(getCartItems()));

  const [loadingItems, setLoadingItems] = useState<string[]>([]);
  const [loadingClear, setLoadingClear] = useState(false);

  /* ---------------- RESOLVE CART (IMPORTANT) ---------------- */
  const items: CartResolvedItem[] = useMemo(() => {
    return (rawCart || []).map((c) => {
      const hasVariation = !!c.productvariationid;

      return {
        cartId: c._id,
        productId: c.productId._id,
        variationId: hasVariation ? c.productvariationid._id : null,

        name: c.productId.name,
        image: c.productId.mainImage,

        price: hasVariation
          ? Number(c.productvariationid.sellingPrice)
          : Number(c.productId.discountPrice || c.productId.price),

        stock: hasVariation
          ? c.productvariationid.stock
          : c.productId.stock ?? null,

        attributes: hasVariation
          ? c.productvariationid.attributes || {}
          : {},

        qty: c.quantity,
      };
    });
  }, [rawCart]);

  /* ---------------- HANDLERS ---------------- */
  const changeQty = async (cartId: string, qty: number, stock: number | null) => {
    if (stock !== null && qty > stock) return;

    setLoadingItems((p) => [...p, cartId]);
    try {
      if (qty <= 0) {
        await dispatch(removeCartItem(cartId));
      } else {
        await dispatch(updateCartQuantity({ cartId, quantity: qty }));
      }
    } finally {
      setLoadingItems((p) => p.filter((id) => id !== cartId));
    }
  };

  const removeItem = async (cartId: string) => {
    setLoadingItems((p) => [...p, cartId]);
    try {
      await dispatch(removeCartItem(cartId));
    } finally {
      setLoadingItems((p) => p.filter((id) => id !== cartId));
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
  const subTotal = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const shipping = 0;
  const total = subTotal + shipping;

  /* ---------------- EMPTY ---------------- */
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
    <div className="max-w-5xl mx-auto px-4 py-[100px]">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ITEMS */}
        <div className="md:col-span-2 space-y-4">
          {items.map((it) => {
            const isLoading = loadingItems.includes(it.cartId);

            return (
              <Card key={it.cartId} className="p-4">
                <div className="flex gap-6">
                  <img
                    src={`${IMAGE_URL}/${it.image}`}
                    alt={it.name}
                    className="w-24 h-24 rounded object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{it.name}</p>

                    {/* VARIATION ATTRIBUTES */}
                    {Object.keys(it.attributes).length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.entries(it.attributes).map(([k, v]) => (
                          <p key={k}>
                            {k.toUpperCase()}: {v}
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-sm mt-1">₹{it.price}</p>

                    {/* QTY */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          changeQty(it.cartId, it.qty - 1, it.stock)
                        }
                        disabled={isLoading}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <span className="w-10 text-center">{it.qty}</span>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          changeQty(it.cartId, it.qty + 1, it.stock)
                        }
                        disabled={
                          isLoading ||
                          (it.stock !== null && it.qty >= it.stock)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <p className="font-semibold">
                      ₹{it.price * it.qty}
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(it.cartId)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* SUMMARY */}
        <Card className="p-6 h-fit">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={loadingClear}
              className="text-rose-600"
            >
              <Trash className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sub-total</span>
              <span>₹{subTotal}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button className="w-full mt-6" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
