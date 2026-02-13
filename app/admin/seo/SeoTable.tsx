'use client';

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getAllSeo, deleteSeo } from "@/redux/slice/SeoSlice";

export default function SeoTable({ onEdit }: any) {
  const dispatch = useAppDispatch();
  const { seoList, loading } = useAppSelector((state) => state.seo);

  useEffect(() => {
    dispatch(getAllSeo());
  }, [dispatch]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">SEO Pages</h2>
        <p className="text-sm text-gray-500">
          All indexed pages and metadata
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">description</th>
              <th className="px-6 py-3">keywords</th>
              <th className="px-6 py-3">NoIndex</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {seoList.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{item.slug}</td>
                <td className="px-6 py-3 truncate max-w-xs">
                  {item.title || "-"}
                </td>
                   <td className="px-6 py-3 truncate max-w-xs">
                  {item.description || "-"}
                </td>
                   <td className="px-6 py-3 truncate max-w-xs">
                  {item.keywords || "-"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.noIndex
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.noIndex ? "No" : "Yes"}
                  </span>
                </td>
                <td className="px-6 py-3 flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => dispatch(deleteSeo(item._id as any))}
                    className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && seoList.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No SEO entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
