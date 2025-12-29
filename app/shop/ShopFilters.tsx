'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { filterProducts } from '@/redux/slice/ProductSlice';
import { GetSubCategoriesByCategory, GetSubCategories } from '@/redux/slice/SubCategorySlice';
import { GetProductCategory } from '@/redux/slice/ProductCategorySlice';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopFilters() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { categories } = useAppSelector((state) => state.productcategory);
  const { subCategories } = useAppSelector((state) => state.subcategory);

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    categories: searchParams.get('categories')?.split(',') || [],
    subcategories: searchParams.get('subcategories')?.split(',') || [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  /* -------- APPLY FILTER & UPDATE URL -------- */
  const updateParams = (updatedFilters: typeof filters) => {
    const params = new URLSearchParams();

    if (updatedFilters.categories.length)
      params.set('categories', updatedFilters.categories.join(','));
    if (updatedFilters.subcategories.length)
      params.set('subcategories', updatedFilters.subcategories.join(','));
    if (updatedFilters.minPrice) params.set('minPrice', updatedFilters.minPrice);
    if (updatedFilters.maxPrice) params.set('maxPrice', updatedFilters.maxPrice);

    router.push(`/shop?${params.toString()}`, { scroll: false });
  };

  const applyFilters = (updated: Partial<typeof filters>) => {
    const finalFilters = { ...filters, ...updated };
    setFilters(finalFilters);
    updateParams(finalFilters);
  };

  /* -------- TOGGLE UTILITY -------- */
  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((i) => i !== id) : [...arr, id];

  /* -------- FETCH CATEGORIES & SUBCATEGORIES -------- */
  useEffect(() => {
    dispatch(GetProductCategory());
    dispatch(GetSubCategories());

    if (filters.categories.length === 1) {
      dispatch(GetSubCategoriesByCategory(filters.categories[0]));
    }
  }, [filters.categories, dispatch]);

  return (
    <div className="border rounded-xl p-5 space-y-6">
      <h2 className="font-semibold text-lg">Filters</h2>

      {/* ================= CATEGORY ================= */}
      <div>
        <p className="font-medium mb-2">Category</p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat._id} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat._id)}
                onChange={() =>
                  applyFilters({
                    categories: toggle(filters.categories, cat._id),
                    subcategories: [],
                  })
                }
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* ================= SUBCATEGORY ================= */}
      {subCategories.length > 0 && (
        <div>
          <p className="font-medium mb-2">Subcategory</p>
          <div className="space-y-2">
            {subCategories.map((sub) => (
              <label key={sub._id} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.subcategories.includes(sub._id)}
                  onChange={() =>
                    applyFilters({ subcategories: toggle(filters.subcategories, sub._id) })
                  }
                />
                {sub.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ================= PRICE ================= */}
      <div>
        <p className="font-medium mb-2">Price</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full border px-2 py-1"
            value={filters.minPrice}
            onChange={(e) => applyFilters({ minPrice: e.target.value })}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full border px-2 py-1"
            value={filters.maxPrice}
            onChange={(e) => applyFilters({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* ================= CLEAR ================= */}
      <button
        className="w-full bg-black text-white py-2 rounded"
        onClick={() => {
          setFilters({ categories: [], subcategories: [], minPrice: '', maxPrice: '' });
          router.push('/shop');
        }}
      >
        Clear Filters
      </button>
    </div>
  );
}
