'use client';

import Link from "next/link";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getProducts } from "@/redux/slice/ProductSlice";
import type { RootState } from "@/redux/store";
import { Heart, ShoppingCart } from "lucide-react";
import { addToWishlist } from "@/redux/slice/WishlistSlice";
import { addToCart } from "@/redux/slice/CartItemSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Products() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state: RootState) => state.product
  );
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleAddToWishlist = (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault(); 
    e.stopPropagation();
    dispatch(addToWishlist({ productId }));
  };

  const handleAddToCart = (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please login first"); // You can replace with your login popup logic
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold mb-10 text-gray-900">
        New Collection
      </h1>

      {loading && <p className="text-blue-600 font-medium">Loading products...</p>}
      {error && <p className="text-red-600 font-medium">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {(products || []).slice(0, 9).map((product: any) => (
          <div key={product._id} className="group relative bg-white border rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
            <Link href={`/products/${product.slug}`}>
              {/* Image */}
              <div className="relative overflow-hidden aspect-w-1 aspect-h-1">
                <img
                  src={`${API_URL}${product.mainImage}`}
                  alt={product.name}
                  className="object-cover w-full h-60 transition-transform duration-300 group-hover:scale-125"
                />
                {product.discountPrice && (
                  <div className="absolute left-3 top-3">
                    <p className="px-3 py-1.5 text-xs font-bold tracking-wide text-white uppercase bg-gray-900 rounded-full">
                      Sale
                    </p>
                  </div>
                )}

                {/* Hover buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleAddToCart(e, product._id)}
                    className="bg-white p-2 rounded-full shadow hover:bg-blue-600 hover:text-white transition"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => handleAddToWishlist(e, product._id)}
                    className="bg-white p-2 rounded-full shadow hover:bg-pink-600 hover:text-white transition cursor-pointer"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="mt-4 px-1 sm:px-4 pb-4">
                <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-900 line-clamp-1">
                  {product.name}
                </h3>

                <div className="flex items-center mt-2.5 space-x-0.5">
                  <p>{product.description}</p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    {product.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                          ${product.discountPrice}
                        </span>
                        <del className="text-xs sm:text-sm font-bold text-gray-500">
                          ${product.price}
                        </del>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        ${product.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {!loading && products?.length === 0 && (
        <p className="text-gray-500 mt-6">No products available.</p>
      )}
    </div>
  );
}


