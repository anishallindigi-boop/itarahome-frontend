'use client';

import React, { useEffect } from 'react';
import { Save } from 'lucide-react';
import Editor from '@/lib/Editor';
import { GetblogCategory } from '@/redux/slice/BlogCategorySlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

const BlogForm = ({
  form,
  setForm,
  handleFormChange,
  handleFileChange,
  handleCategoryChange,
  handleSubmit,
  handleUpdateSubmit,
  editingId,
  setShowForm,
}: any) => {
  const dispatch = useAppDispatch();
  const { blogcategories } = useAppSelector((state: RootState) => state.blogcategory);

  useEffect(() => {
    dispatch(GetblogCategory());
  }, [dispatch]);

  return (
    <form onSubmit={editingId ? handleUpdateSubmit : handleSubmit} className="p-6 space-y-4 bg-white rounded shadow-md">
      <input
        name="metatitle"
        value={form.metatitle}
        onChange={handleFormChange}
        placeholder="Meta Title *"
        className="w-full px-3 py-2 border rounded-md"
      />

      <input
        name="metadescription"
        value={form.metadescription}
        onChange={handleFormChange}
        placeholder="Meta Description *"
        className="w-full px-3 py-2 border rounded-md"
      />

      <input
        name="metakeywords"
        value={form.metakeywords}
        onChange={handleFormChange}
        placeholder="Meta Keywords *"
        className="w-full px-3 py-2 border rounded-md"
      />

      <input
        name="title"
        value={form.title}
        onChange={handleFormChange}
        placeholder="Title *"
        required
        className="w-full px-3 py-2 border rounded-md"
      />

      <select
        name="category"
        multiple
        value={form.category}
        onChange={handleCategoryChange}
        className="w-full px-3 py-2 border rounded-md"
      >
        <option value="">Select categories</option>
        {blogcategories.map((c: any) => (
          <option key={c._id} value={c._id}>
            {c.categoryname}
          </option>
        ))}
      </select>

      <input
        type="file"
        multiple
        name="images"
        onChange={handleFileChange}
        placeholder="Images *"
   
        className="w-full px-3 py-2 border rounded-md"
      />

      <textarea
        name="excerpt"
        value={form.excerpt}
        onChange={handleFormChange}
        placeholder="Excerpt *"
        required
        rows={3}
        className="w-full px-3 py-2 border rounded-md"
      />

      <Editor formData={form} setFormData={setForm} />

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{editingId ? 'Update' : 'Create'} Blog</span>
        </button>
      </div>
    </form>
  );
};

export default BlogForm