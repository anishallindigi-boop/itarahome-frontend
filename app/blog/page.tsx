'use client'
import React, { useState, useEffect } from 'react';

import { Calendar, Clock, Eye, Heart, User, ChevronLeft, ChevronRight, Search, Filter, Tag } from 'lucide-react';
import Link from 'next/link';
import HeroSection from './HeroSection';
import BlogsSection from './BlogsSection';





const Blog = () => {





    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}

            <HeroSection />


            {/* Search and Filters */}

            <BlogsSection/>
        </div>
    );
};

export default Blog;