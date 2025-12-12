'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export type CartItem = {
  _id: string;
  name: string;
  image: string;
  qty: number;
  price: number;
};

export function CartPopover({ items }: { items: CartItem[] }) {
  /* guard + debug */
console.log(items,"items")

  if (!Array.isArray(items)) return null;

  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const subTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">My Cart</h3>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item._id} className="flex gap-3 items-center">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.image}`}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md border object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Sub-total</span>
              <span className="font-semibold">₹{subTotal}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}