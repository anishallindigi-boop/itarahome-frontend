'use client';

import React, { useEffect } from 'react';
import { Edit, Trash2, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import {
  getAdminProducts,
  deleteProduct,
  UpdateProductStatus,
  resetState,
} from '@/redux/slice/ProductSlice';

export default function ProductTable() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { products, isDeleted,loading, error, success, message } = useAppSelector(
    (state: RootState) => state.product
  );

  const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL || '';

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    dispatch(getAdminProducts());
  }, [dispatch]);

  /* ================= TOAST + REFRESH ================= */
 /* ================= TOAST + REFRESH ================= */
useEffect(() => {
  if (message) {
    toast.success(message);
    dispatch(resetState());
  }

  if (error) {
    toast.error(error);
    dispatch(resetState());
  }
  
  // Remove isDeleted from here since it has its own effect
  if (success) {
    dispatch(getAdminProducts()); // Refresh after any success
    dispatch(resetState());
  }
}, [message, error, success, dispatch]);

// Separate effect for delete
useEffect(() => {
  if (isDeleted) {
    dispatch(getAdminProducts());
    dispatch(resetState());
    toast.success('Product deleted successfully');
  }
}, [isDeleted, dispatch]);
  /* ================= ACTION HANDLERS ================= */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/product/${id}`);
  };

  const handleVariations = (id: string) => {
    router.push(`/admin/product/${id}/variations`);
  };

  const handleToggleStatus = (id: string, status: 'draft' | 'published') => {
    dispatch(
      UpdateProductStatus({
        id,
        status: status === 'published' ? 'draft' : 'published',
      })
    );
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return <p className="p-4">Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="p-4 text-gray-500">No products found</p>;
  }

  /* ================= TABLE ================= */
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                'Product',
                'Category',
                'subcategory',
                'Stock',
                'Price',
                'Discount price',
                'Status',
                'Actions',
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((p: any) => (
              <tr key={p._id} className="hover:bg-gray-50">
                {/* PRODUCT */}
                <td className="px-6 py-4 flex items-center gap-3">
                  <img
                    src={`${IMAGE_URL}${p.mainImage || p.image || ''}`}
                    alt={p.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {p.description}
                    </p>
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-6 py-4 text-sm">
                  {Array.isArray(p.categoryid) && p.categoryid.length > 0
                    ? p.categoryid.map((c: any) => c.name).join(', ')
                    : '-'}
                </td>

                  <td className="px-6 py-4 text-sm">
                  {Array.isArray(p.subcategoryid) && p.subcategoryid.length > 0
                    ? p.subcategoryid.map((c: any) => c.name).join(', ')
                    : '-'}
                </td>

                {/* STOCK */}
                <td className="px-6 py-4 text-sm">{p.stock ?? '-'}</td>

                {/* PRICE */}
                <td className="px-6 py-4 text-sm">₹{p.price ?? '-'}</td>
                <td className="px-6 py-4 text-sm">₹{p.discountPrice ?? '-'}</td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(p._id, p.status)}
                    className={`px-3 py-1 rounded-full text-xs text-white ${
                      p.status === 'published'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  >
                    {p.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(p._id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit size={16} />
                  </button>

                  {/* <button
                    onClick={() => handleVariations(p._id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                  >
                    <Layers size={16} />
                  </button> */}

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
