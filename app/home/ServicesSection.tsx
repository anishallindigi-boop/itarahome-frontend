'use client';

import Image from 'next/image';
import Link from 'next/link';

const services = [
  {
    title: 'Bulk Orders',
    description:
      'Style your space effortlessly with our curated selection of decor, bedding, and cushions. Rent, style, and return with ease.',
    image: '/Rental.avif',
    href: '/enquiry-form',
    cta: 'LEARN MORE',
  },
  {
    title: 'Styling',
    description:
      'From house to home - our signature service that includes arranging decor and soft furnishings to give the space some personality.',
    image: '/Styling.avif',
    href: '/styling-consultation-form',
    cta: 'LEARN MORE',
    disabled: false,
  },
  {
    title: 'Curated Set',
    description:
      'Our signature curated sets bring together thoughtfully paired stone objects to add character and balance to your space.',
    image: '/Gifting.avif',
    href: '/shop',
    cta: 'SHOP NOW',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-[#dcdad4]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((item, index) => (
            <div
              key={index}
              className="text-center group"
            >
              {/* Image */}
              <div className="relative flex justify-center overflow-hidden mb-6">
                {!item.disabled && item.href && (
                  <Link
                    href={item.href}
                    className="absolute inset-0 z-10"
                    aria-label={item.title}
                  />
                )}

                <img
                  src={item.image}
                  alt={item.title}
               
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold tracking-wide mb-3">
                {item.title}
              </h3>

              <p className="text-sm text-primary mb-5 leading-relaxed">
                {item.description}
              </p>

              {/* CTA */}
              {item.href && !item.disabled ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all"
                >
                  {item.cta}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 10"
                    fill="none"
                    className="w-4 h-4"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M8.537.808a.5.5 0 0 1 .817-.162l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L11.793 5.5H1a.5.5 0 0 1 0-1h10.793L8.646 1.354a.5.5 0 0 1-.109-.546"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
                  {item.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
