'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { GetSubCategories } from '@/redux/slice/SubCategorySlice';
import { cn } from '@/lib/utils';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

import { X, SlidersHorizontal } from 'lucide-react';

export default function ShopFilterDrawer() {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { subCategories } = useAppSelector((state) => state.subcategory);

  /* ---------------- LOAD SUBCATEGORIES ---------------- */
  useEffect(() => {
    dispatch(GetSubCategories());
  }, [dispatch]);

  /* ---------------- INIT FROM URL ---------------- */
  useEffect(() => {
    const subs = searchParams.get('subcategories');
    if (subs) setSelectedSubs(subs.split(','));
  }, [searchParams]);

  /* ---------------- TOGGLE SUBCATEGORY ---------------- */
  const toggleSubCategory = (id: string) => {
    setSelectedSubs((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* ---------------- APPLY FILTER ---------------- */
  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedSubs.length) {
      params.set('subcategories', selectedSubs.join(','));
    } else {
      params.delete('subcategories');
    }

    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  /* ---------------- CLEAR FILTER ---------------- */
  const clearFilter = () => {
    setSelectedSubs([]);
    router.push('/shop', { scroll: false });
  };

  return (
    <Sheet>
      {/* TRIGGER */}
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 uppercase text-sm font-medium cursor-pointer">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
      </SheetTrigger>

      {/* DRAWER */}
      <SheetContent
        side="right"
        className="z-[9999] w-80 p-0"
      >
        {/* HEADER */}
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Filters</SheetTitle>

            {/* SINGLE CLOSE BUTTON */}
            {/* <SheetClose asChild>
              <button className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </SheetClose> */}
          </div>
        </SheetHeader>

        {/* CONTENT */}
        <div className="px-5 py-4 overflow-y-auto">
          {/* SUBCATEGORIES */}
          <div>
            <h4 className="text-sm font-medium mb-3">Sub Categories</h4>

            <div className="flex flex-wrap gap-2">
              {subCategories.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => toggleSubCategory(sub._id)}
                  className={cn(
                    'px-3 py-1.5 text-sm border rounded-full transition cursor-pointer',
                    selectedSubs.includes(sub._id)
                      ? 'bg-black text-white border-black'
                      : 'bg-white hover:bg-gray-100'
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t px-5 py-4 flex gap-3">
          <button
            onClick={clearFilter}
            className="w-1/2 border py-2 text-sm hover:bg-gray-100 cursor-pointer"
          >
            Clear
          </button>

          <SheetClose asChild>
            <button
              onClick={applyFilter}
              className="w-1/2 bg-black text-white py-2 text-sm cursor-pointer"
            >
              Apply
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
