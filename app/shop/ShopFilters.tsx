'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { cn } from '@/lib/utils';

export default function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { categories } = useAppSelector((state) => state.productcategory);
  const activeCategory = searchParams.get('categories');

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

  return (
    <div className="border-b mb-6">
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
        {/* VIEW ALL */}
        <button
          onClick={() => updateCategory()}
          className={cn(
            'px-4 py-2 text-sm border whitespace-nowrap',
            !activeCategory
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100'
          )}
        >
          VIEW ALL
        </button>

        {/* CATEGORY TABS */}
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => updateCategory(cat._id)}
            className={cn(
              'px-4 py-2 text-sm border whitespace-nowrap',
              activeCategory === cat._id
                ? 'bg-black text-white'
                : 'bg-white hover:bg-gray-100'
            )}
          >
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
