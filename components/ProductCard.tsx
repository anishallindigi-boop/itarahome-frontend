'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }: any) {
  const category = product.categoryid?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group border rounded-2xl overflow-hidden hover:shadow-lg transition"
    >
      <div className="relative h-60 bg-gray-100">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${product.mainImage}`}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition"
        />
      </div>

      <div className="p-4">
        {category && (
          <p className="text-sm text-gray-500 mb-1">
            {category.name}
          </p>
        )}

        <h3 className="font-medium mb-2 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          {product.discountPrice ? (
            <>
              <span className="font-semibold">
                ₹{product.discountPrice}
              </span>
              <span className="text-sm line-through text-gray-400">
                ₹{product.price}
              </span>
            </>
          ) : (
            <span className="font-semibold">
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
