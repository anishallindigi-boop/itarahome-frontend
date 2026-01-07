'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { filterProducts } from '@/redux/slice/ProductSlice';
import ShopFilters from './ShopFilters';
import ProductGrid from './ProductGrid';
import ShopSort from './ShopSort';
import ShopFilterDrawer from './ShopFilterDrawer';

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { products, loading } = useAppSelector((state) => state.product);

  useEffect(() => {
    // Read filters from URL params
    const categories = searchParams.get('categories')?.split(',') || [];
    const subcategories =
      searchParams.get('subcategories')?.split(',') || [];
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    // Dispatch Redux filter
    dispatch(
      filterProducts({
        categories,
        subcategories,
        minPrice,
        maxPrice,
      })
    );
  }, [searchParams, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Decorations</h1>

      {/* TOP FILTER BAR */}
      <ShopFilters />

      {/* SORT + FILTER ROW */}
      <div className="flex justify-between items-center mb-6 text-sm">
        <button className="flex items-center gap-1">
          SORT BY <span className="text-lg">+</span>
        </button>

        <button className="flex items-center gap-1">
          FILTER
          <span className="text-lg">≡</span>
        </button>
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
