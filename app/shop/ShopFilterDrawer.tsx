'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { GetSubCategories, GetSubCategoriesByCategory } from '@/redux/slice/SubCategorySlice';
import { cn } from '@/lib/utils';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { SlidersHorizontal } from 'lucide-react';

export default function ShopFilterDrawer() {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { subCategories, loading } = useAppSelector((state) => state.subcategory);
  const activeCategory = searchParams.get('categories');

  /* ---------------- LOAD SUBCATEGORIES BASED ON CATEGORY ---------------- */
  useEffect(() => {
    if (activeCategory) {
      // If specific category selected, fetch only its subcategories
      dispatch(GetSubCategoriesByCategory(activeCategory));
    } else {
      // If "VIEW ALL" selected, fetch all subcategories
      dispatch(GetSubCategories());
    }
  }, [dispatch, activeCategory]);

  /* ---------------- INIT FROM URL ---------------- */
  useEffect(() => {
    const subs = searchParams.get('subcategories');
    if (subs) {
      setSelectedSubs(subs.split(','));
    } else {
      setSelectedSubs([]);
    }
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

    if (selectedSubs.length > 0) {
      params.set('subcategories', selectedSubs.join(','));
    } else {
      params.delete('subcategories');
    }

    router.push(`/shop?${params.toString()}`, { scroll: false });
    setIsSheetOpen(false);
  };

  /* ---------------- CLEAR FILTER ---------------- */
  const clearFilter = () => {
    setSelectedSubs([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcategories');
    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  // Get active subcategories count
  const activeCount = subCategories.filter(sub => sub.status === 'publish').length;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      {/* TRIGGER BUTTON */}
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 uppercase text-sm font-medium cursor-pointer hover:text-primary transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
          <span className="text-xs text-gray-500">
            ({activeCategory ? activeCount : 'All'})
          </span>
        </button>
      </SheetTrigger>

      {/* DRAWER CONTENT */}
      <SheetContent side="right" className="z-[9999] w-80 p-0 flex flex-col">
        {/* HEADER */}
        <SheetHeader className="border-b px-5 py-4 shrink-0">
          <div>
            <SheetTitle className="text-base">Filters</SheetTitle>
            <p className="text-xs text-gray-500 mt-1">
              {activeCategory 
                ? 'Showing subcategories for selected category' 
                : 'Showing all subcategories'}
            </p>
          </div>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 px-5 py-4 overflow-y-auto">
          <div>
            <h4 className="text-sm font-medium mb-3">
              Sub Categories
              <span className="text-xs font-normal text-gray-400 ml-1">
                ({subCategories.length})
              </span>
            </h4>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
              </div>
            ) : subCategories.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">
                  {activeCategory 
                    ? 'No subcategories for this category' 
                    : 'No subcategories available'}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subCategories.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => toggleSubCategory(sub._id)}
                    className={cn(
                      'px-3 py-1.5 text-sm border rounded-full transition-all duration-200 cursor-pointer',
                      selectedSubs.includes(sub._id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    )}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t px-5 py-4 flex gap-3 shrink-0 bg-white">
          <button
            onClick={clearFilter}
            disabled={selectedSubs.length === 0 && !searchParams.get('subcategories')}
            className={cn(
              'w-1/2 py-2.5 text-sm font-medium rounded-md transition-colors',
              selectedSubs.length === 0 && !searchParams.get('subcategories')
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            Clear
          </button>

          <button
            onClick={applyFilter}
            className="w-1/2 bg-primary text-white py-2.5 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Apply {selectedSubs.length > 0 && `(${selectedSubs.length})`}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}