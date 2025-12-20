'use client';

import React, { useEffect } from 'react';
import { Edit, Trash2, Layers } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import {
  getProducts,
  deleteProduct,
  UpdateProductStatus,
  resetState,
} from '@/redux/slice/ProductSlice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProductTable() {
  const dispatch = useAppDispatch();
  const router=useRouter();
  const { products, loading, error, success, message } = useAppSelector(
    (state: RootState) => state.product
  );
  const IMAGE_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Fetch products on mount
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // Handle toast messages and refresh
  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    if (success) dispatch(getProducts()); // refresh after delete/update
    return () => dispatch(resetState());
  }, [message, error, success, dispatch]);

  // Delete product
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  // Edit product (example: navigate to edit page or open modal)
  const handleEdit = (id: string) => {
if(id){
router.push(`/admin/product/${id}`)
}
  };

  // Open variations modal/page
  const handleVariations = (id: string) => {
    console.log('Variations', id);
  };

  // Toggle product status
  const handleToggleStatus = (id: string, status: 'draft' | 'published') => {
    dispatch(UpdateProductStatus({ id, status }));
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Product', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {(products || []).map((p, idx) => (
              <tr key={p._id || idx} className="hover:bg-gray-50">
                {/* Product Info */}
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

               <td className="px-6 py-4 text-sm">
  {Array.isArray(p.categoryid) && p.categoryid.length > 0
    ? p.categoryid.map(cat => cat.name || cat).join(', ')
    : '-'}
</td>

                {/* Stock */}
                <td className="px-6 py-4 text-sm">{p.stock || '-'}</td>

                {/* Price */}
                <td className="px-6 py-4 text-sm">{p.price || '-'}</td>

                {/* Status */}
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        p._id,
                        p.status === 'published' ? 'draft' : 'published'
                      )
                    }
                    className={`px-2 py-1 rounded text-white text-xs ${
                      p.status === 'published' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    {p.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(p._id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleVariations(p._id)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                  >
                    <Layers className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
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
