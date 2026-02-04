'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { cn } from '@/lib/utils';

export default function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { categories } = useAppSelector((state) => state.productcategory);
  const activeCategory = searchParams.get('categories');

  const hasFilters =
    searchParams.get('categories') ||
    searchParams.get('subcategories') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('sort');

  /* ---------------- UPDATE CATEGORY ---------------- */
  const updateCategory = (id?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!id) {
      // VIEW ALL clicked - clear category and subcategories
      params.delete('categories');
      params.delete('subcategories');
    } else {
      // Specific category clicked - set category, clear subcategories
      params.set('categories', id);
      params.delete('subcategories');
    }

    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  /* ---------------- CLEAR FILTERS ---------------- */
  const clearFilters = () => {
    router.push('/shop', { scroll: false });
  };

  return (
    <div className="border-b mb-6">
      <div className="flex items-center justify-between gap-4 pb-3">
        {/* CATEGORY TABS */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => updateCategory()}
            className={cn(
              'px-4 py-2 text-sm border whitespace-nowrap cursor-pointer transition-colors',
              !activeCategory
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
            )}
          >
            VIEW ALL
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateCategory(cat._id)}
              className={cn(
                'px-4 py-2 text-sm border whitespace-nowrap cursor-pointer transition-colors',
                activeCategory === cat._id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
              )}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CLEAR FILTER */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm border border-gray-300 whitespace-nowrap cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}