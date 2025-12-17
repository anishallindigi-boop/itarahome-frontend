import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;


// ✅ Fetch from your third-party blog API
async function getSingleBlog(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/single-slug-blog/${slug}`, {
      headers: {
        'x-api-key': API_KEY || '',
      },
      next: { revalidate: 60 }, // cache for 1 min
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// ✅ Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params; // ✅ Await params
  const blog = await getSingleBlog(id);

  if (!blog) {
    return {
      title: 'Blog Not Found | My Real Estate Site',
      description: 'The requested blog could not be found.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'; // ✅ Dynamic domain

  return {
    title: `${blog.title} | My Real Estate Site`,
    description: blog.metadescription,
    keywords: blog.metakeywords,
    openGraph: {
      title: blog.title,
      url: `${siteUrl}/blog/${id}`, // ✅ Use awaited id, not params.id
      images: [
        {
          url: blog.image ? `${siteUrl}${blog.image}` : `${siteUrl}/default-blog.jpg`, // ✅ Prepend siteUrl for absolute URLs
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.metadescription,
      images: [blog.image ? `${siteUrl}${blog.image}` : `${siteUrl}/default-blog.jpg`], // ✅ Same for Twitter
    },
  };
}

// ✅ Main Page Component
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Await params
  const blog = await getSingleBlog(id);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">Blog post not found</h2>
          <Link
            href="/blog"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-40 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full animate-pulse"
            style={{ animationDelay: '3s' }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/blog"
            className="group flex items-center text-white hover:text-white mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          <div className="text-white">
            {/* Categories */}
            {blog?.category && (
              <div className="flex items-center space-x-4 mb-6">
                {Array.isArray(blog.category)
                  ? blog.category.map((cat: any, index: number) => (
                      <span
                        key={index}
                        className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-bold"
                      >
                        {cat.categoryname}
                      </span>
                    ))
                  : null}
              </div>
            )}

            <h1 className="text-4xl md:text-6xl text-yellow-300 font-black mb-6 leading-tight">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              {blog.createdAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(blog.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </section>
    </div>
  );
}