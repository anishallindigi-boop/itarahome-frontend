import { Save } from 'lucide-react'
import React from 'react'



const CategoryForm = ({
 form,
 handleFormChange,
 handleSubmit,
 editingId,
 handleUpdateSubmit,
 setShowForm,

}: any) => {
  return (
    <form onSubmit={editingId ? handleUpdateSubmit : handleSubmit} className="p-6 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  

      
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
           Category name
            </label>
            <input
              name="categoryname"
              type="text"
              value={form.categoryname}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
           Category description
            </label>
              <textarea
                name="categorydescription"
                rows={3}
                value={form.categorydescription}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
         
            

    {/* Array Fields */}
   

    {/* Buttons */}
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
        <span>{editingId ? 'Update' : 'Create'} Category</span>
      </button>
    </div>
  </div>
  </form>
  )
}

export default CategoryForm