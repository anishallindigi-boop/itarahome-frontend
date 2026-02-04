'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Loader2 } from 'lucide-react';

import {
  GetAdminSubCategories,
  DeleteSubCategory,
  UpdateSubCategoryStatus,
  resetSubCategoryState,
} from '@/redux/slice/SubCategorySlice';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL;

const SubCategoryTablePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    subCategories,
    loading,
    error,
    isdeleted,
  } = useAppSelector((state: RootState) => state.subcategory);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    dispatch(GetAdminSubCategories());
  }, [dispatch]);

  /* ---------------- REFETCH AFTER DELETE ---------------- */

  useEffect(() => {
    if (isdeleted) {
      dispatch(GetAdminSubCategories());
      dispatch(resetSubCategoryState());
    }
  }, [isdeleted, dispatch]);

  /* ---------------- HANDLERS ---------------- */

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      dispatch(DeleteSubCategory(id));
    }
  };

  const handleToggleStatus = (id: string, status: 'draft' | 'publish') => {
    dispatch(
      UpdateSubCategoryStatus({
        id,
        status: status === 'publish' ? 'draft' : 'publish',
      })
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Product SubCategories</h1>
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
              <th className="px-4 py-3 text-left">SubCategory</th>
              <th className="px-4 py-3 text-left">Parent Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : subCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No subcategories found
                </td>
              </tr>
            ) : (
              subCategories.map((sub) => (
                <tr
                  key={sub._id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* Image */}
                  <td className="px-4 py-3">
                    {sub.image ? (
                      <img
                        src={`${IMAGE_URL}${sub.image}`}
                        alt={sub.name}
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
                    {sub.name}
                  </td>

                  {/* Parent Category */}
                  <td className="px-4 py-3 text-gray-700">
                    {sub.category?.name}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-gray-600 line-clamp-2">
                    {sub.description}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        handleToggleStatus(sub._id, sub.status)
                      }
                      className={`px-3 py-1 rounded-full text-xs text-white ${
                        sub.status === 'publish'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {sub.status === 'publish' ? 'Published' : 'Draft'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/sub-category/${sub._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(sub._id)}
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

export default SubCategoryTablePage;
