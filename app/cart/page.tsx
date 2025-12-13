'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCartItems,
  updateCartQuantity,
  removeCartItem,
  clearCart, // <-- NEW
} from '@/redux/slice/CartItemSlice';
import { useOnce } from '@/lib/useOnce';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

/* ---------- flatten shape ---------- */
type TCartRec = {
  _id: string;
  productId: {
    _id: string;
    name: string;
    mainImage: string;
    discountPrice: number | string;
    price: number | string;
  };
  quantity: number;
};

export default function CartPage() {
  const dispatch = useAppDispatch();
  const rawCart = useAppSelector((s) => (s as any).usercart.cart) as TCartRec[] | undefined;
  useOnce(() => dispatch(getCartItems()));

  const items = React.useMemo(
    () =>
      (rawCart || []).map((c) => ({
        cartId: c._id,
        productId: c.productId._id,
        name: c.productId.name,
        image: c.productId.mainImage,
        qty: c.quantity,
        price: Number(c.productId.discountPrice || c.productId.price),
      })),
    [rawCart]
  );

  /* ---------- handlers ---------- */
  const changeQty = (cartId: string, qty: number) => {
    if (qty <= 0) dispatch(removeCartItem(cartId));
    else dispatch(updateCartQuantity({ cartId, quantity: qty }));
  };
  const remove = (cartId: string) => dispatch(removeCartItem(cartId));
  const clear = () => dispatch(clearCart()); // <-- NEW

  /* ---------- totals ---------- */
  const subTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 0; // free
  const total = subTotal + shipping;

  /* ---------- empty ---------- */
  if (items.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl">Your cart is empty</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-[100px]">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ---------- items list ---------- */}
        <div className="md:col-span-2 space-y-4">
          {items.map((it) => (
            <Card key={it.cartId} className="gap-4 p-4">
              <div className='flex gap-6'>
              <img
                src={`${IMAGE_URL}/${it.image}`}
                alt={it.name}
                width={96}
                height={96}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{it.name}</p>
                <p className="text-sm text-muted-foreground">₹{it.price}</p>

                {/* qty changer */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeQty(it.cartId, it.qty - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-10 text-center">{it.qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeQty(it.cartId, it.qty + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <p className="font-semibold">₹{it.price * it.qty}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(it.cartId)}
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </Button>
              </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ---------- order summary ---------- */}
        <Card className="p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-rose-600 hover:text-rose-700"
            >
              <Trash className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sub-total</span>
              <span>₹{subTotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
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