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
      params.delete('categories');
      params.delete('subcategories');
    } else {
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
              'px-4 py-2 text-sm border whitespace-nowrap cursor-pointer',
              !activeCategory
                ? 'bg-primary text-white'
                : 'bg-white text-primary hover:bg-primary hover:text-white'
            )}
          >
            VIEW ALL
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateCategory(cat._id)}
              className={cn(
                'px-4 py-2 text-sm border whitespace-nowrap cursor-pointer',
                activeCategory === cat._id
                  ? 'bg-primary text-white'
                  : 'bg-white hover:bg-primary hover:text-white'
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
            className="px-4 py-2 text-sm border whitespace-nowrap cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
