'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Loader2 } from 'lucide-react';

import {
  getAllBlogs,
  deleteBlog,
  UpdateBlogStatus,
  resetState,
} from '@/redux/slice/BlogSlice';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';

const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL;

const BlogTable = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    blogs,
    loading,
    error,
    isdeleted,

  } = useAppSelector((state: RootState) => state.blog);
  // console.log(loading,"load")

  // Fetch blogs
  useEffect(() => {
    dispatch(getAllBlogs());
  }, [dispatch]);

  // Refetch after delete
  useEffect(() => {
    if (isdeleted) {
      dispatch(getAllBlogs());
      dispatch(resetState());
    }
  
  }, [isdeleted, dispatch]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      dispatch(deleteBlog(id));
    }
  };

const handleToggleStatus = async (
  id: string,
  status: 'draft' | 'published'
) => {
  await dispatch(
    UpdateBlogStatus({
      id,
      status: status === 'published' ? 'draft' : 'published',
    })
  );

};


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Blogs</h1>

        <button
          onClick={() => router.push('/admin/blog/create')}
          className="px-4 py-2 bg-black text-white rounded-md text-sm"
        >
          Create Blog
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Author</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No blogs found
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* Title */}
                  <td className="px-4 py-3 font-medium">
                    {blog.title}
                  </td>

                  {/* Author */}
                  <td className="px-4 py-3 text-gray-600">
                  {blog.author?.name || 'Admin'}
                  </td>

 <td className="px-4 py-3">
        {blog.category?.map((cat) => (
          <span
            key={cat._id}
            className="inline-block mr-2 text-xs bg-gray-200 px-2 py-1 rounded"
          >
            {cat.name}
          </span>
        ))}
      </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleToggleStatus(blog._id!, blog.status)
                      }
                      className={`px-3 py-1 rounded-full text-xs text-white ${
                        blog.status === 'published'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {blog.status === 'published' ? 'Published' : 'Draft'}
                    </button>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-gray-500">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString()
                      : '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/blogs/${blog._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(blog._id!)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogTable;
