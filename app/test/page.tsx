'use client';

import { Heart, MapPin } from 'lucide-react';
import { useState } from 'react';

interface MultiImageProperty {
  id: number;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  images: string[];
  tag?: string;
}

/* ================= PROPERTY CARD ================= */
const PropertyCard = ({ property }: { property: MultiImageProperty }) => {
  const [mainImage, setMainImage] = useState(0);

  return (
    <div className="group bg-white  rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden">
      <div className="relative">
        {/* MAIN IMAGE */}
        <div className="h-56 overflow-hidden">
          <img
            src={property.images[mainImage]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* THUMBNAILS */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(idx)}
                className={`w-14 h-10 rounded-lg overflow-hidden ring-2 transition-all ${
                  idx === mainImage
                    ? 'ring-yellow-400 scale-105'
                    : 'ring-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* TAG */}
        {property.tag && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-yellow-400 text-black text-xs font-semibold rounded-full">
            {property.tag}
          </span>
        )}

        {/* WISHLIST */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6">
        <p className="text-2xl font-bold text-yellow-500 mb-1">
          {property.price}
        </p>
        <h3 className="text-lg font-semibold mb-2 group-hover:text-yellow-500 transition">
          {property.title}
        </h3>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="w-4 h-4 text-yellow-500" />
          {property.location}
        </p>
      </div>
    </div>
  );
};

/* ================= MAIN LIST ================= */
const MultiImageCards = () => {
  const properties: MultiImageProperty[] = [
    {
      id: 1,
      title: 'Skyline Penthouse Suite',
      location: 'Manhattan, New York',
      price: '$4,850,000',
      beds: 4,
      baths: 3,
      sqft: '3,200 sqft',
      images: ['/about-hero.jpg', '/about-sec.jpg', '/second-right.jpg'],
      tag: 'Featured',
    },
    {
      id: 2,
      title: 'Oceanfront Paradise Villa',
      location: 'Malibu, California',
      price: '$12,500,000',
      beds: 6,
      baths: 7,
      sqft: '8,500 sqft',
      images: ['/about-hero.jpg', '/about-sec.jpg', '/second-right.jpg'],
      tag: 'Exclusive',
    },
    {
      id: 3,
      title: 'Cliffside Modern Estate',
      location: 'Santorini, Greece',
      price: '$8,200,000',
      beds: 5,
      baths: 4,
      sqft: '5,800 sqft',
      images: ['/about-hero.jpg', '/about-sec.jpg', '/second-right.jpg'],
      tag: 'New',
    },
    {
      id: 4,
      title: 'Mediterranean Courtyard Estate',
      location: 'Beverly Hills, CA',
      price: '$15,900,000',
      beds: 7,
      baths: 8,
      sqft: '12,000 sqft',
      images: ['/about-hero.jpg', '/about-sec.jpg', '/second-right.jpg'],
      tag: 'Luxury',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default MultiImageCards;
