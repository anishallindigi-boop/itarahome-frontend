'use client';

import React, { useEffect, useState } from 'react';

import ProductForm from './ProductForm';
import ProductTable from './ProductTable';


export default function Page() {



  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
    
      </div>
      <ProductForm/>

      <ProductTable />

     
    </div>
  );
}