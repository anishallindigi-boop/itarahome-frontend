'use client';
import { Modal } from '@/app/elements/Modal';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, EyeOff, Calendar, User, Search } from 'lucide-react';
import { useState } from 'react';
import BlogForm from './BlogForm';




interface BlogTableProps {
  blogs:any;
  openEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}


export const categories = ['Sustainability', 'Technology', 'Investment', 'Market Trends', 'Construction'];

export const BlogTable:React.FC<BlogTableProps> = ({ blogs, openEdit,handleDelete}) => {
 

  return (
    <div className="space-y-4">
    

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Blog Post', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {blogs.map((b:any, idx:any) => (
              <motion.tr
              key={b.id || (b as any)._id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={b.images? b.images[0] : b.images} alt={b.title} className="w-12 h-12 rounded object-cover" />
                  <div className="max-w-xs">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{b.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{b.excerpt}</p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm flex items-center gap-1">
                  <User size={14} className="text-gray-400" />
                  {typeof b.author === 'object' && b.author !== null ? b.author.username : b.author}
                </td>

                <td className="px-6 py-4 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {Array.isArray(b.category)
      ? b.category.map((c: any) => c.categoryname).join(', ')
      : b.category}
                  </span>
                </td>

                <td className="px-6 py-4 text-xs">
                
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
                      <Eye size={14} /> {b.status}
                    </span>
                 
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  <Calendar size={14} className="inline mr-1" />
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 flex space-x-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEdit(b._id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};