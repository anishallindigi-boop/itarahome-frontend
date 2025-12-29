'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { filterProducts } from '@/redux/slice/ProductSlice';
import ShopFilters from './ShopFilters';
import ProductGrid from './ProductGrid';

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
      <h1 className="text-3xl font-semibold mb-8">Shop</h1>

      <div className="grid grid-cols-12 gap-8">
        {/* Filters */}
        <aside className="col-span-12 md:col-span-3">
          <ShopFilters />
        </aside>

        {/* Products */}
        <section className="col-span-12 md:col-span-9">
          {loading ? <p>Loading products...</p> : <ProductGrid products={products} />}
        </section>
      </div>
    </div>
  );
}
