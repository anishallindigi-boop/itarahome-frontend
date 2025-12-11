'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Preloader from './elements/Preloader';
import Header from './elements/Header';
import Footer from './elements/Footer';
import { HeaderGuard } from './elements/HeaderGuard';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // true for /admin routes
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const handleStart = () => {
      setIsLoadingComplete(false);
    };

    const handleComplete = () => {
      setIsLoadingComplete(true);
    };

    // next/navigation router does NOT have events like next/router
    // So you cannot do router.events.on here (it’s only available in pages router)
    // Instead, you can listen to changes in pathname to simulate loading state:

  }, []);

  // New approach: reset loading when pathname changes
  useEffect(() => {
    // Start loading when path changes
    setIsLoadingComplete(false);

    // Simulate loading delay (or handle actual loading in Preloader)
    const timer = setTimeout(() => {
      setIsLoadingComplete(true);
    }, 1000); // example: 1 second loading time

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {!isLoadingComplete && (
        <Preloader onComplete={() => setIsLoadingComplete(true)} />
      )}

      {isLoadingComplete && (
        <>
          {!isAdminRoute && <Header />}
          {!isAdminRoute && <HeaderGuard />}
          {children}
          {!isAdminRoute && <Footer />}
        </>
      )}
    </>
  );
};

export default LayoutWrapper;