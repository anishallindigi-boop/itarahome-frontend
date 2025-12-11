'use client';


import React from 'react';
import { Edit, Trash2, Layers } from 'lucide-react';


interface Props {
products: any[];
openEdit: (id: string) => void;
openVariations: (id: string) => void;
handleDelete: (id: string) => void;
}


export default function ProductTable({ products = [], openEdit, openVariations, handleDelete }: Props) {
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || '';


return (
<div className="space-y-4">
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
<table className="w-full">
<thead className="bg-gray-50 border-b">
<tr>
{['Product', 'Category', 'Stock', 'Price', 'Actions'].map(h => (
<th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
))}
</tr>
</thead>
<tbody className="divide-y">
{(products || []).map((p: any, idx: number) => (
<tr key={p._id || idx} className="hover:bg-gray-50">
<td className="px-6 py-4 flex items-center gap-3">
<img src={`${IMAGE_URL}/${p.mainImage || p.image || ''}`} alt={p.name} className="w-12 h-12 rounded object-cover" />
<div className="max-w-xs">
<p className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</p>
<p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
</div>
</td>


<td className="px-6 py-4 text-sm">{p.category?.name || p.category}</td>
<td className="px-6 py-4 text-sm">{p.stock}</td>
<td className="px-6 py-4 text-sm">{p.price}</td>


<td className="px-6 py-4 flex space-x-2">
<button onClick={() => openEdit(p._id)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
<button onClick={() => openVariations(p._id)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"><Layers className="h-4 w-4" /></button>
<button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
);
}

