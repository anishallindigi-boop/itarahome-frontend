'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  FileText,
  Users,
  TrendingUp,
  Eye,
  BarChart3,
  MapPin,
} from 'lucide-react';

import { RootState, AppDispatch } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';


const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:5000/uploads';




const Page = () => {


  
  return (
   <>
   dashbaord
   </>
       
  );
};

export default Page;