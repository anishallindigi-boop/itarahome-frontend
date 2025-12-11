'use client';

import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductForm from './ProductForm';
import VariationForm from './VariationForm';
import ProductTable from './ProductTable';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { GetProducts, GetSingleProduct, DeleteProduct, resetState } from '@/redux/slice/ProductSlice';
import { toast } from 'sonner';
import type { RootState } from '@/redux/store';

export default function Page() {
  const dispatch = useAppDispatch();
  const { products, singleProduct, loading, error, success, message, isupdated, isdeleted } = useAppSelector((state: RootState) => state.product);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(GetProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetState());
    }
    if (success) {
      toast.success(message || 'Success');
      dispatch(resetState());
    }
    if (isupdated) {
      toast.success(message || 'Updated');
      dispatch(resetState());
    }
    if (isdeleted) {
      toast.success(message || 'Deleted');
      dispatch(resetState());
    }
  }, [error, success, isupdated, isdeleted, message, dispatch]);

  const openCreate = () => {
    setEditingId(null);
    setShowProductForm(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    dispatch(GetSingleProduct(id));
    setShowProductForm(true);
  };

  const openVariations = (id: string) => {
    setEditingId(id);
    dispatch(GetSingleProduct(id));
    setShowVariationForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return;
    dispatch(DeleteProduct(id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <ProductTable products={products} openEdit={openEdit} openVariations={openVariations} handleDelete={handleDelete} />

      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <ProductForm
              product={singleProduct}
              editingId={editingId}
              onClose={() => setShowProductForm(false)}
              onOpenVariations={(id: string) => openVariations(id)}
            />
          </motion.div>
        </div>
      )}

      {showVariationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
              <button onClick={() => setShowVariationForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <VariationForm productId={editingId} onClose={() => setShowVariationForm(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}