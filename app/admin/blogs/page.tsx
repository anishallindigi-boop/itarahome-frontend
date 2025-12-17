'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { BlogTable } from './BlogTable';
import BlogForm from './BlogForm';
import { motion } from 'framer-motion';
import { Createblog, resetState ,getAllBlogs,getSingleBlog,updateBlog,deleteBlog} from '@/redux/slice/BlogSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toast } from "sonner";


type BlogFormState = {

  metatitle: string;
  metadescription: string;
  metakeywords: string;
  title: string;

  content: string;
  excerpt: string;
  category: string[];
  images: File[];
};

const initialForm: BlogFormState = {
  metatitle: '',
  metadescription: '',
  metakeywords: '',
  title: '',
  content: '',
  excerpt: '',
  category: [],
  images: [],
};

export default function Page() {
  const dispatch = useAppDispatch();
  const { loading, error, message, success, blogs ,singleblog,isupdate,isdeleted} = useAppSelector((state: RootState) => state.blog);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormState>(initialForm);

  const openCreate = () => {
    setEditingId(null);
    setShowForm(true);
    setForm(initialForm);  
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form, 'form before dispatch');
    dispatch(Createblog(form));
    setShowForm(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
    if(id){
      // console.log(id,"id")  
    dispatch(getSingleBlog(id))
    }
      };
    

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateBlog(
      {
        id: editingId || '',
      form
      }
    ));
    setForm(initialForm);
    setShowForm(false);
  };


  const handleDelete = (id: string) => {
    setEditingId(id);
    if(id){
      dispatch(deleteBlog(id));
 
    }
  };


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setForm((prev) => ({
        ...prev,
        images: Array.from(files),
      }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm((prev) => ({ ...prev, category: selected }));
  };

  useEffect(() => {
if(error){
  toast.error(error)
  dispatch(resetState())
}
if(success){
  toast.success(message)
  dispatch(resetState())
}
if(isupdate){
  toast.success(message)
  dispatch(resetState())
}
if(isdeleted){
  toast.success(message)
  dispatch(resetState())
}
    dispatch(getAllBlogs());
  }, [dispatch,error,success,isupdate,isdeleted]);


useEffect(()=>{
  if(singleblog){
    setForm({
      metatitle:singleblog?.metatitle || ``,
      metadescription:singleblog?.metadescription || ``,
      metakeywords:singleblog?.metakeywords || ``,
      title:singleblog?.title || ``,
      content:singleblog?.content || ``,
      excerpt:singleblog?.excerpt || ``,
      category:singleblog?.category || ``,
      images:singleblog?.images || ``,
    })
  }
},[singleblog])


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blogs Management</h1>

        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Blog</span>
        </button>
      </div>

      <BlogTable blogs={blogs} openEdit={openEdit} handleDelete={handleDelete} />

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
                  {editingId ? 'Edit Blog' : 'Add New Blog'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <BlogForm
              form={form}
              setForm={setForm}
              handleFormChange={handleFormChange}
              handleFileChange={handleFileChange}
              handleCategoryChange={handleCategoryChange}
              handleSubmit={handleSubmit}
              handleUpdateSubmit={handleUpdateSubmit}
              initialForm={initialForm}
              editingId={editingId}
              setShowForm={setShowForm}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}