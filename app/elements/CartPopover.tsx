'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';
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
  if (!Array.isArray(items)) return null;

  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const subTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
              {itemCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[450px] p-4 bg-white shadow-lg rounded-2xl border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800">My Cart</h3>
          <span className="text-sm text-gray-500">{itemCount} items</span>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-16">
            Your cart is empty 🛒
          </p>
        ) : (
          <>
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition relative shadow-sm"
                >
                  <div className="flex-shrink-0 w-16 h-16 relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${item.image}`}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg border"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <p className="text-sm font-bold text-gray-900">₹{item.price * item.qty}</p>
                    <button className="text-red-500 hover:text-red-600 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* STICKY SUBTOTAL */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900 text-lg">₹{subTotal}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="hover:bg-gray-100 transition"
                  asChild
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button className=" bg-indigo-600 hover:bg-indigo-700 transition text-white">
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
