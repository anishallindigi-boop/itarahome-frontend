'use client'
import React, { useEffect, useState } from 'react';
import CategoryForm from './CategoryForm';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, MapPin, X, Save } from 'lucide-react';
import CategoryTable from './CategoryTable';
import {CreateblogCategory,GetblogCategory,DeleteblogCategory,resetState,UpdateblogCategory,GetSingleblogCategory} from '@/redux/slice/BlogCategorySlice';
import { RootState, AppDispatch } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toast } from "sonner";

type CategoryFormState = {
  categoryname: string;
  categorydescription: string;
};

const initialForm: CategoryFormState = {
  categoryname: '',
  categorydescription: '',
};

const Page = () => {

    const dispatch = useAppDispatch()
    const { loading, error, message,blogcategories,isdeleted,success,singleblogcategory,isupdated} = useAppSelector((state: RootState) => state.blogcategory);
// console.log(singleblogcategory,"singleblogcategory")

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<CategoryFormState>(initialForm);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    dispatch(CreateblogCategory(form))
    setShowForm(false);
    setForm({ categoryname: '', categorydescription: '' });
    setEditingId(null);
  };


  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateblogCategory(
      {
        id: editingId || '',
        data: form  
      }
    ))
    setShowForm(false);

    setForm({ categoryname: '', categorydescription: '' });
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
if(id){
dispatch(GetSingleblogCategory(id))
}
  };


  const handleDelete = (id: string) => {
    if(id){
      dispatch(DeleteblogCategory(id));
 
    }
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
}, [error, success, isupdated, isdeleted, message, dispatch]);


useEffect(() => {
  dispatch(GetblogCategory());
}, [dispatch]);

useEffect(() => {
  if (success || isupdated || isdeleted) {
    dispatch(GetblogCategory());
  }
}, [success, isupdated, isdeleted, dispatch]);



useEffect(() => {
    if(singleblogcategory){
        setForm({
            categoryname:singleblogcategory.categoryname,
            categorydescription:singleblogcategory.categorydescription
        })
    }

  
}, [dispatch,singleblogcategory])


  return (
    <section className="p-6 space-y-6">
    
    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
    <div className="flex items-center space-x-4">
    
      

    <button
      onClick={openCreate}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
    >
      <Plus className="h-4 w-4" />
      <span>Add Project</span>
    </button>
    </div>
  </div>



<CategoryTable openEdit={openEdit} handleDelete={handleDelete} filtered={blogcategories}/>

    {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Project' : 'Add New Project'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <CategoryForm
            form={form}
            handleUpdateSubmit={handleUpdateSubmit}
            handleFormChange={handleFormChange}
        
            handleSubmit={handleSubmit}
            initialForm={initialForm}
              editingId={editingId} setShowForm={setShowForm}
         
              />
          </motion.div>
        </div>
      )}
    </section>
  )
}

export default Page