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

  const dispatch = useAppDispatch();
  const {
    loading, error, message, Productcategories,
    isdeleted, success, singleProductcategory, isupdated
  } = useAppSelector((state: RootState) => state.productcategory);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(initialForm);




  // Unified handler for text + file
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;

    if (files && files.length > 0) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(CreateProductCategory(form));
    setShowForm(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateProductCategory({ id: editingId || '', form }));
    setShowForm(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const openCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
    if (id) dispatch(GetSingleProductCategory(id));
  };

  const handleDelete = (id: string) => {
    if (id) dispatch(DeleteProductCategory(id));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetState());
    }
    if (success) {
      toast.success(message);
      dispatch(resetState());
    }
    if (isupdated) {
      toast.success("Updated successfully");
      dispatch(resetState());
    }
    if (isdeleted) {
      toast.success("Deleted successfully");
      dispatch(resetState());
    }

    dispatch(GetProductCategory());
  }, [dispatch, error, success, isdeleted, isupdated]);


  useEffect(() => {
    if (singleProductcategory) {
      setForm({
        categoryname: singleProductcategory.categoryname,
        categorydescription: singleProductcategory.categorydescription,
        image: null // image won't be prefilled
      });
    }
  }, [singleProductcategory]);

  return (
    <section className="p-6 space-y-6">

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <CategoryTable
        openEdit={openEdit}
        handleDelete={handleDelete}
        filtered={Productcategories}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b flex justify-between">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowForm(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <CategoryForm
              form={form}
              handleFormChange={handleFormChange}
              handleSubmit={handleSubmit}
              handleUpdateSubmit={handleUpdateSubmit}
              editingId={editingId}
              setShowForm={setShowForm}
            />
          </motion.div>
        </div>
      )}

    </section>
  );
};

export default Page;
