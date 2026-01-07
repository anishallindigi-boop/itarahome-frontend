'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

export default function ShopSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const activeSort = searchParams.get('sort') || 'latest';

  /* ---------------- UPDATE SORT ---------------- */
  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-30">
      {/* TRIGGER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 text-sm border rounded-full hover:bg-gray-100 transition cursor-pointer"
      >
        <span className="font-medium">
          Sort: {SORT_OPTIONS.find((o) => o.value === activeSort)?.label}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateSort(option.value)}
              className={cn(
                'flex items-center justify-between w-full px-4 py-2.5 text-sm text-left hover:bg-gray-100 transition cursor-pointer',
                activeSort === option.value && 'bg-gray-50'
              )}
            >
              {option.label}

              {activeSort === option.value && (
                <Check className="h-4 w-4 text-black" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
