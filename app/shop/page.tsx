'use client'
import React, { useEffect } from 'react';


import ShopClient from './shop-client';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import {
  getProducts,
} from '@/redux/slice/ProductSlice';


const page = () => {

 const dispatch = useAppDispatch();


  const { products, loading, error, success, message } = useAppSelector(
    (state: RootState) => state.product
  );


  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);


  return (
   <>
   <ShopClient products={products} />
   </>
  )
}

export default page

