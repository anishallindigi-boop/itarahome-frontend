'use client'
import React, { useEffect, useState } from 'react';
import CategoryForm from './CategoryForm';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import CategoryTable from './CategoryTable';
import {
  CreateProductCategory,
  GetProductCategory,
  GetSingleProductCategory,
  UpdateProductCategory,
  DeleteProductCategory,
  resetState
} from '@/redux/slice/ProductCategorySlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toast } from "sonner";

type CategoryFormState = {
  categoryname: string;
  categorydescription: string;
  image: File | null;
};

const initialForm: CategoryFormState = {
  categoryname: '',
  categorydescription: '',
  image: null
};

const Page = () => {


 

  return (
    <section className="p-6 space-y-6">

 <CategoryForm
             
            />

      <CategoryTable
  
      />

  

            
   
   
    </section>
  );
};

export default Page;
