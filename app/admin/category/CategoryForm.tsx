import { Save } from 'lucide-react';
import React from 'react';

const CategoryForm = ({
  form,
  handleFormChange,
  handleSubmit,
  editingId,
  handleUpdateSubmit,
  setShowForm,
}: any) => {
  return (
    <form
      onSubmit={editingId ? handleUpdateSubmit : handleSubmit}
      className="p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            name="categoryname"
            type="text"
            value={form.categoryname}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Description
          </label>
          <textarea
            name="categorydescription"
            rows={3}
            value={form.categorydescription}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Image */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFormChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-6 py-2 border rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>{editingId ? 'Update' : 'Create'} Category</span>
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
