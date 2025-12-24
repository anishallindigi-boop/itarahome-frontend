'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import ShopFilters from '@/components/ShopFilters';

export default function ShopClient({ products }: { products: any[] }) {
  const [category, setCategory] = useState<string>('all');
  const [price, setPrice] = useState<number>(10000);
  const [sort, setSort] = useState<string>('default');

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      p.categoryid?.forEach((c: any) => {
        map.set(c.slug, c.name);
      });
    });
    return Array.from(map.entries());
  }, [products]);

  const filteredProducts = useMemo(() => {
    let data = [...products];

    // category filter
    if (category !== 'all') {
      data = data.filter((p) =>
        p.categoryid?.some((c: any) => c.slug === category)
      );
    }

    // price filter
    data = data.filter(
      (p) => (p.discountPrice || p.price) <= price
    );

    // sorting
    if (sort === 'low') {
      data.sort(
        (a, b) =>
          (a.discountPrice || a.price) -
          (b.discountPrice || b.price)
      );
    }

    if (sort === 'high') {
      data.sort(
        (a, b) =>
          (b.discountPrice || b.price) -
          (a.discountPrice || a.price)
      );
    }

    return data;
  }, [products, category, price, sort]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-[100px]">
      <h1 className="text-3xl font-semibold mb-8">Shop</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <ShopFilters
          categories={categories}
          category={category}
          setCategory={setCategory}
          price={price}
          setPrice={setPrice}
          sort={sort}
          setSort={setSort}
        />

        {/* Products */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
