'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getProducts } from '@/redux/slice/ProductSlice';
import type { RootState } from '@/redux/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTO_SCROLL_DELAY = 3000;

export default function ProductsSlider() {
  const dispatch = useAppDispatch();
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const { products } = useAppSelector(
    (state: RootState) => state.product
  );

  /* ------------------ FETCH PRODUCTS ONCE ------------------ */
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch]);

  /* ------------------ AUTO SCROLL (DESKTOP/TABLET ONLY) ------------------ */
  useEffect(() => {
    if (!products?.length) return;

    if (window.innerWidth < 768) return; // disable auto-scroll on mobile

    startAutoScroll();
    return stopAutoScroll;
  }, [products]);

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollRef.current = setInterval(() => {
      scroll('right');
    }, AUTO_SCROLL_DELAY);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  /* ------------------ SCROLL LOGIC ------------------ */
  const scroll = (direction: 'left' | 'right') => {
    const slider = sliderRef.current;
    if (!slider) return;

    const card =
      slider.querySelector<HTMLElement>('[data-card]');
    if (!card) return;

    const gap = 32; // gap-8
    const scrollAmount = card.offsetWidth + gap;

    if (direction === 'right') {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (slider.scrollLeft <= 0) {
        slider.scrollTo({
          left: slider.scrollWidth,
          behavior: 'smooth',
        });
      } else {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 relative">

        {/* ---------- HEADER ---------- */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-800">
            Similar Products
          </h2>
          {/* <p className="mt-4 text-gray-600">
            Handcrafted stone pieces for modern interiors
          </p> */}
        </div>

        {/* ---------- NAV BUTTONS (TABLET + DESKTOP) ---------- */}
        <button
          onClick={() => scroll('left')}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
          className="
            hidden md:flex
            absolute left-0 top-1/2 -translate-y-1/2 z-10
            w-12 h-12 rounded-full bg-white shadow-lg
            items-center justify-center
            hover:bg-stone-100
          "
        >
          <ChevronLeft />
        </button>

        <button
          onClick={() => scroll('right')}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
          className="
            hidden md:flex
            absolute right-0 top-1/2 -translate-y-1/2 z-10
            w-12 h-12 rounded-full bg-white shadow-lg
            items-center justify-center
            hover:bg-stone-100
          "
        >
          <ChevronRight />
        </button>

        {/* ---------- SLIDER ---------- */}
        <div
          ref={sliderRef}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
          className="
            flex gap-8 overflow-x-auto scroll-smooth
            scrollbar-hide px-1
          "
        >
          {[...products, ...products].map((product: any, index: number) => (
            <Link
              key={`${product._id}-${index}`}
              href={`/products/${product.slug}`}
              data-card
              className="
                shrink-0
                w-full
                sm:w-[calc(50%-1rem)]
                lg:w-[calc(33.333%-1.25rem)]
                group
              "
            >
              <div className="relative h-[360px] overflow-hidden rounded-3xl bg-black shadow-lg transition-all duration-700">

                {/* IMAGE */}
                <img
                  src={`${API_URL}${product.mainImage}`}
                  alt={product.name}
                  className="
                    absolute inset-0 w-full h-full object-cover
                    transition-transform duration-1000
                    group-hover:scale-110
                  "
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* CONTENT */}
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="!text-white text-xl sm:text-2xl font-semibold line-clamp-2">
                    {product.name}
                  </h3>

                  <div
                    className="
                      mt-4 inline-flex items-center gap-2
                      text-sm text-white/90
                      border border-white/40
                      px-5 py-2 rounded-full
                      backdrop-blur-md transition
                      group-hover:bg-white/10
                    "
                  >
                    View Product →
                  </div>
                </div>

                {/* BORDER GLOW */}
                <div className="absolute inset-0 ring-1 ring-white/10 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
