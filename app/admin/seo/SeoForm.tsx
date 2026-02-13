'use client';

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createSeo, updateSeo, resetState } from "@/redux/slice/SeoSlice";

const initialForm = {
  slug: "",
  title: "",
  description: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noIndex: false,
};

export default function SeoForm({ editData, onSuccess }: any) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.seo);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (editData?._id) {
      await dispatch(updateSeo({ id: editData._id, data: formData }));
    } else {
      await dispatch(createSeo(formData));
    }

    dispatch(resetState());
    setFormData(initialForm);
    onSuccess();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">
          {editData ? "Update SEO" : "Create SEO"}
        </h2>
        <p className="text-sm text-gray-500">
          Manage meta & Open Graph details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">

        {/* SLUG */}
        <div>
          <label className="label">Page Slug</label>
          <input
           className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            name="slug"
            placeholder="/about"
            value={formData.slug}
            onChange={handleChange}
            required
          />
        </div>

        {/* META SECTION */}
        <div>
          <h3 className="section-title">Meta Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              name="title"
              placeholder="Meta Title"
              value={formData.title}
              onChange={handleChange}
              
            />

            <input
               className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              name="keywords"
              placeholder="Keywords (comma separated)"
              value={formData.keywords}
              onChange={handleChange}
            />
          </div>

          <textarea
           className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50 mt-5
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            name="description"
            placeholder="Meta Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* OPEN GRAPH */}
        <div>
          <h3 className="section-title">Open Graph</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
     className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              name="ogTitle"
              placeholder="OG Title"
              value={formData.ogTitle}
              onChange={handleChange}
            />

            <input
            className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              name="ogImage"
              placeholder="OG Image URL"
              value={formData.ogImage}
              onChange={handleChange}
            />
          </div>

          <textarea
           className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50 mt-5
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            name="ogDescription"
            placeholder="OG Description"
            value={formData.ogDescription}
            onChange={handleChange}
          />
        </div>

        {/* ADVANCED */}
        <div>
          <h3 className="section-title">Advanced</h3>

          <input
   className="w-full h-14 px-5 rounded-xl border border-gray-300 bg-gray-50
                       text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            name="canonicalUrl"
            placeholder="Canonical URL"
            value={formData.canonicalUrl}
            onChange={handleChange}
          />

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
            
              type="checkbox"
              name="noIndex"
              checked={formData.noIndex}
              onChange={handleChange}
 
            />
            Prevent indexing (noindex)
          </label>
        </div>

        {/* ACTION */}
        <div className="pt-4 border-t">
          <button
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : editData ? "Update SEO" : "Save SEO"}
          </button>
        </div>
      </form>
    </div>
  );
}
