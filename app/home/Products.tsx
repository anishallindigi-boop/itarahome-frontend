'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getProducts } from '@/redux/slice/ProductSlice';
import type { RootState } from '@/redux/store';
import { Heart, ShoppingCart } from 'lucide-react';
import { addToWishlist } from '@/redux/slice/WishlistSlice';
import { addToCart } from '@/redux/slice/CartItemSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Products() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state: RootState) => state.product
  );
  const { isAuthenticated } = useAppSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleAddToWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToWishlist({ productId }));
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login first');
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  return (
    <section className=" py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* 🔥 Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Recently Curated
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            Handcrafted stone pieces designed for timeless modern interiors
          </p>
        </div>

        {loading && (
          <p className="text-center text-gray-500">Loading products...</p>
        )}
        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}

        {/* 🔥 Product Grid – SAME AS VIDEO DESIGN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {(products || []).slice(0, 9).map((product: any) => (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="relative h-[360px] overflow-hidden rounded-3xl bg-black shadow-lg hover:shadow-2xl transition-all duration-700">

                {/* 🖼 Image (replaces video) */}
                <img
                  src={`${API_URL}${product.mainImage}`}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                {/* 🌑 Luxury Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* 🏷 Content */}
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-white text-2xl font-semibold tracking-wide leading-tight line-clamp-2">
                    {product.name}
                  </h3>

                  {/* CTA */}
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 border border-white/40 px-5 py-2 rounded-full backdrop-blur-md transition-all duration-500 group-hover:bg-white/10">
                    View Product
                    <span className="transition-transform duration-500 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>

                {/* ❤️ Floating Actions */}
                {/* <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition duration-500">
                  <button
                    onClick={(e) => handleAddToCart(e, product._id)}
                    className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow hover:bg-black hover:text-white transition"
                  >
                    <ShoppingCart size={18} />
                  </button>

                  <button
                    onClick={(e) => handleAddToWishlist(e, product._id)}
                    className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow hover:bg-pink-600 hover:text-white transition"
                  >
                    <Heart size={18} />
                  </button>
                </div> */}

                {/* ✨ Subtle Border Glow */}
                <div className="absolute inset-0 ring-1 ring-white/10 opacity-0 group-hover:opacity-100 transition duration-700" />
              </div>
            </Link>
          ))}
        </div>

        {!loading && products?.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No products available.
          </p>
        )}
      </div>
    </section>
  );
}
