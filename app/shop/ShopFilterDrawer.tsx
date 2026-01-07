'use client';

import { X } from 'lucide-react';
import ShopFilters from './ShopFilters';

export default function ShopFilterDrawer({ open, onClose }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[320px] bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Filters</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <ShopFilters />
      </div>
    </div>
  );
}
