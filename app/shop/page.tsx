'use client'
import React, { useEffect } from 'react';

import ShopClient from './shop-client';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { getProducts } from '@/redux/slice/ProductSlice';

const Page = () => {
  const dispatch = useAppDispatch();

  const { products, loading, error, message } = useAppSelector(
    (state: RootState) => state.product
  );

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <ShopClient products={products} />
    </>
  );
};

export default Page;
