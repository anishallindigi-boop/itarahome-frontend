import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, MapPin, X, Save
} from 'lucide-react';


interface ProjectTableProps {
    filtered: any[];
    openEdit: (id: string) => void;
    handleDelete: (id: string) => void;
  }

const ProjectTable: React.FC<ProjectTableProps>  = ({filtered,openEdit,handleDelete}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">category Name</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">category Description</th>
          
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filtered.map((p:any, idx:any) => (
            <motion.tr
              key={p._id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                 
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    {/* <div className="text-sm text-gray-500">{p.}</div> */}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  
                  {p.name}
                </div>
              </td>
              
           
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${p.isActive === true
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
             
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEdit(p._id)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
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
  )
}

export default ProjectTable