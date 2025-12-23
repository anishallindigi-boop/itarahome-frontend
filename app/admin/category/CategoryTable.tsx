'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';

import {
  GetProductCategory,
  DeleteProductCategory,
  UpdateCategoryStatus,
  resetState,
} from '@/redux/slice/ProductCategorySlice';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
  const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL

const CategoryTablePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    categories,
    loading,
    error,
    isdeleted,
  } = useAppSelector((state: RootState) => state.productcategory);

  // Fetch categories
  useEffect(() => {
    dispatch(GetProductCategory());
  }, [dispatch]);

  // Refetch after delete
  useEffect(() => {
    if (isdeleted) {
      dispatch(GetProductCategory());
      dispatch(resetState());
    }
  }, [isdeleted, dispatch]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      dispatch(DeleteProductCategory(id));
    }
  };


    const handleToggleStatus = (id: string, status: 'draft' | 'published') => {
      dispatch(
        UpdateCategoryStatus({
          id,
          status: status === 'published' ? 'draft' : 'published',
        })
      );
    };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Product Categories</h1>

        
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
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Status</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* Image */}
                  <td className="px-4 py-3">
                    {cat.image ? (
                      <img
                        src={`${IMAGE_URL}${cat.image}`}
                        alt={cat.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded" />
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-medium">
                    {cat.name}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-gray-600 line-clamp-2">
                    {cat.description}
                  </td>

                  {/* Status */}
                   <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(cat._id, cat.status)}
                    className={`px-3 py-1 rounded-full text-xs text-white ${
                      cat.status === 'published'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  >
                    {cat.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/category/${cat._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat._id)}
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

export default CategoryTablePage;
