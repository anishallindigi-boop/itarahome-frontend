'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { filterProducts } from '@/redux/slice/ProductSlice';
import ShopFilters from './ShopFilters';
import ShopSort from './ShopSort';
import ShopFilterDrawer from './ShopFilterDrawer';
import ProductGrid from './ProductGrid';

export default function ShopPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { products, loading } = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(
      filterProducts({
      subcategories:searchParams.get('subcategories')?.split(',') || [],
        categories: searchParams.get('categories')?.split(',') || [],
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'latest',
      })
    );
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Decorations</h1>

      <ShopFilters />

      {/* SORT + FILTER */}
      <div className="flex justify-between items-center mb-6 text-sm">
        <ShopSort />
        <ShopFilterDrawer />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
