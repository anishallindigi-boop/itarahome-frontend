'use client';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

const videos = [
  { id: 1, src: '/plate.mp4', title: 'Square Plate',href:'/shop?subcategories=694faed6906b74dc1fa22a8d' },
  { id: 2, src: '/coaster.mp4', title: 'Circle Coaster',href:'/shop?subcategories=694faef0906b74dc1fa22a90' },
  { id: 3, src: '/circle-table.mp4', title: 'Circle Table',href:'/shop?subcategories=694fb0eb6ad657f46d9c7d54' },
  { id: 4, src: '/square-table.mp4', title: 'Square Table',href:'/shop?subcategories=694fb0eb6ad657f46d9c7d54' },
];

export default function ProductVideo() {
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true;         // must be muted
        video.playsInline = true;   // required for iOS
        video
          .play()
          .catch((err) => {
            console.log('Autoplay failed:', err);
          });
      }
    });
  }, []);

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 px-4">
        {videos.map((video, idx) => (
          <Link href={video.href} key={video.id}>
          <div  className="relative overflow-hidden shadow-lg ">
            <video
              ref={(el) => {
                if (el) videoRefs.current[idx] = el;
              }}
              src={video.src}
              className="w-full sm:h-80 object-cover "
              muted
              loop
              playsInline
            />
            <p className="absolute bottom-3 left-3 text-white font-semibold bg-black/30 px-3 py-1 rounded">
              {video.title}
            </p>
          </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
