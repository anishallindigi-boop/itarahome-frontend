'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

const videos = [
  {
    id: 1,
        src: '/coaster.mp4',
    title: 'Tabletop Objects',
    href: '/shop?categories=694fadfa906b74dc1fa22a66',
  },
  {
    id: 2,
       src: '/square-table.mp4',
    title: 'Scluptural Furniture',
    href: '/shop?categories=694fae5b906b74dc1fa22a69',
  },
  {
    id: 3,
    src: '/bookend.mp4',
    title: 'Decorative Objects',
    href: '/shop?categories=694fae9d906b74dc1fa22a6c',
  },
];

export default function ProductVideo() {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true;
        video.playsInline = true;
        video.play().catch(() => {});
      }
    });
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* 🔥 Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shop by Collection
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Discover handcrafted stone pieces designed for modern living
          </p>
        </div>

        {/* 🔥 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, idx) => (
            <Link href={video.href} key={video.id} className="group">
              <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 bg-black">
                
                {/* 🎥 Video */}
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[idx] = el;
                  }}
                  src={video.src}
                  className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-110"
                  muted
                  loop
                  playsInline
                />

                {/* 🔥 Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />

                {/* 🏷 Title */}
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-white text-xl font-semibold tracking-wide">
                    {video.title}
                  </h3>
                  <span className="inline-block mt-2 text-sm text-white/80 border border-white/40 px-4 py-1 rounded-full backdrop-blur-sm">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
