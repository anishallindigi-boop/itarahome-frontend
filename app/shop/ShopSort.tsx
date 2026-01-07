'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set('sort', value);
    else params.delete('sort');

    router.push(`/shop?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-sm"
      >
        SORT BY <span className="text-lg">+</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-44 border bg-white shadow-lg z-20">
          <button onClick={() => updateSort('latest')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Latest
          </button>
          <button onClick={() => updateSort('price-low')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Price: Low to High
          </button>
          <button onClick={() => updateSort('price-high')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Price: High to Low
          </button>
        </div>
      )}
    </div>
  );
}
