'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PreloaderProps {
  onComplete: () => void;
}

const Page = ({ onComplete }: PreloaderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onComplete, 300); // Allow fade out animation to complete
    }, 2000); // Show preloader for 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <style>
        {`
          @keyframes slideRight {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(0);
            }
          }
          .animate-slide-right {
            animation: slideRight 2s ease-in-out forwards;
          }
        `}
      </style>

      <div
        className={cn(
          'fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300',
          !isLoading && 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col items-center space-y-6">
          {/* Logo with pulsing effect (optional) */}
          <div className="text-center animate-fade-in">
            <img src="/logo1.png" alt="logo" className="w-full max-w-[200px] md:h-[60px] h-auto" />
          </div>

          {/* Gradient Line Animation After Image */}
          <div className="w-48 h-1 rounded-full overflow-hidden mt-6 bg-muted">
            <div className="h-full w-full bg-black animate-slide-right" />
          </div>
        </div>

        {/* Optional bottom gradient bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-muted overflow-hidden">
          <div className="h-full w-full bg-black animate-slide-right" />
        </div>
      </div>
    </>
  );
};

export default Page;