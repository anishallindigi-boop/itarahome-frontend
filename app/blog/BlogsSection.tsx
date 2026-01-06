'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { getAllBlogs } from '@/redux/slice/BlogSlice';
import ApiLoader from '../elements/ApiLoader';

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

const Page = () => {
  const dispatch = useAppDispatch();
  const { loading, error, blogs } = useAppSelector(
    (state: RootState) => state.blog
  );

  // for per-card image loading skeleton
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(getAllBlogs());
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleImageLoad = (id: string) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <ApiLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500 text-center text-sm md:text-base">
          {error || 'Failed to load blogs. Please try again later.'}
        </p>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600 text-lg">No blogs found</p>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid of blogs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {blogs.map((blog: any, index: number) => {
            const cardId = blog._id || blog.slug || `blog-${index}`;
            const imgSrc =
              blog?.image && IMAGE_URL
                ? `${IMAGE_URL}${blog.image}`
                : '/default.jpg';

            return (
              <Link
                key={cardId}
                href={`/blog/${blog?.slug}`}
                className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl border border-gray-100 transition-all duration-300"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Image block */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  {/* Skeleton shimmer */}
                  {!imageLoaded[cardId] && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  )}

                  <Image
                    src={imgSrc}
                    alt={blog?.title || 'Blog Image'}
                    fill
                    className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                      imageLoaded[cardId] ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onLoadingComplete={() => handleImageLoad(cardId)}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content block */}
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                      {blog?.category?.length
                        ? blog.category
                            .map((cat: any) => cat.name)
                            .join(', ')
                        : 'Uncategorized'}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {blog?.title || 'Untitled Blog'}
                  </h3>

                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {blog?.excerpt || 'Read more about this update.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-700">
                        {blog?.author?.name || 'Unknown Author'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(blog?.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Page;