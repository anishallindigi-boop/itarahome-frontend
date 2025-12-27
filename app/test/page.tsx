'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ImageIcon, Save } from 'lucide-react';
import ImageUploadModal from '../elements/ImageUploadModal';

const API = 'http://localhost:5000/api/categories';

/* ---------------- TYPES ---------------- */

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  image: string;
  metatitle: string;
  metadescription: string;
  metakeywords: string;
  isActive: boolean;
}

interface SubCategoryFormState {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  categoryId: string;
}

/* ---------------- UTILS ---------------- */

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/* ---------------- COMPONENT ---------------- */

export default function CategoryCreatePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [openCategoryImage, setOpenCategoryImage] = useState(false);
  const [openSubImage, setOpenSubImage] = useState(false);

  const [form, setForm] = useState<CategoryFormState>({
    name: '',
    slug: '',
    description: '',
    image: '',
    metatitle: '',
    metadescription: '',
    metakeywords: '',
    isActive: true,
  });

  const [subForm, setSubForm] = useState<SubCategoryFormState>({
    name: '',
    slug: '',
    image: '',
    isActive: true,
    categoryId: '',
  });

  /* ---------------- FETCH CATEGORIES ---------------- */

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get(`${API}/get`);
    setCategories(res.data.data);
  };

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      if (name === 'name') {
        return { ...prev, name: value, slug: generateSlug(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSubForm((prev) => {
      if (name === 'name') {
        return { ...prev, name: value, slug: generateSlug(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  /* ---------------- API CALLS ---------------- */

  const createCategory = async () => {
    if (!form.name) return alert('Category name required');

    await axios.post(`${API}/create`, form);
    alert('Category created');
    setForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      metatitle: '',
      metadescription: '',
      metakeywords: '',
      isActive: true,
    });
    fetchCategories();
  };

  const addSubCategory = async () => {
    if (!subForm.categoryId || !subForm.name) return alert('All fields required');

    await axios.post(`${API}/create/${subForm.categoryId}/subcategory`, {
      name: subForm.name,
      slug: subForm.slug,
      image: subForm.image,
      isActive: subForm.isActive,
    });

    alert('Subcategory added');
    setSubForm({ name: '', slug: '', image: '', isActive: true, categoryId: '' });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      {/* ================= LEFT ================= */}
      <div className="col-span-8 space-y-6">
        {/* CATEGORY FORM */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Category Information</h3>

          <input
            name="name"
            placeholder="Category Name"
            className="border p-2 w-full rounded"
            value={form.name}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Category Description"
            className="border p-2 w-full rounded"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />

          <h3 className="font-semibold text-lg mt-4">SEO Settings</h3>

          <input
            name="metatitle"
            placeholder="Meta Title"
            className="border p-2 w-full rounded"
            value={form.metatitle}
            onChange={handleChange}
          />

          <textarea
            name="metadescription"
            placeholder="Meta Description"
            className="border p-2 w-full rounded"
            rows={2}
            value={form.metadescription}
            onChange={handleChange}
          />

          <input
            name="metakeywords"
            placeholder="Meta Keywords (comma separated)"
            className="border p-2 w-full rounded"
            value={form.metakeywords}
            onChange={handleChange}
          />
        </div>

        {/* SUBCATEGORY FORM */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Add Subcategory</h3>

          <select
            name="categoryId"
            value={subForm.categoryId}
            onChange={handleSubChange}
            className="border p-2 w-full rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            name="name"
            placeholder="Subcategory Name"
            className="border p-2 w-full rounded"
            value={subForm.name}
            onChange={handleSubChange}
          />

          {/* Subcategory SEO / Slug */}
          <div className="border p-3 rounded bg-gray-100 text-sm">
            <label className="font-medium">Slug (auto generated)</label>
            <p className="break-all">{subForm.slug}</p>
          </div>

          {/* Subcategory Image */}
          <div className="space-y-2">
            <button
              type="button"
              className="flex items-center gap-2 border px-4 py-2 rounded"
              onClick={() => setOpenSubImage(true)}
            >
              <ImageIcon size={18} /> Select Image
            </button>

            {subForm.image && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${subForm.image}`}
                className="w-full h-40 object-cover rounded border"
              />
            )}

            <ImageUploadModal
              open={openSubImage}
              multiple={false}
              onClose={() => setOpenSubImage(false)}
              onSelect={(urls) => setSubForm((p) => ({ ...p, image: urls[0] }))}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={subForm.isActive}
              onChange={() => setSubForm((p) => ({ ...p, isActive: !p.isActive }))}
            />
            Active
          </label>

          <button
            type="button"
            onClick={addSubCategory}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            Add Subcategory
          </button>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="col-span-4 space-y-6 sticky top-6">
        {/* CATEGORY IMAGE */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Category Image</h3>

          <button
            type="button"
            className="flex items-center gap-2 border px-4 py-2 rounded"
            onClick={() => setOpenCategoryImage(true)}
          >
            <ImageIcon size={18} /> Select Image
          </button>

          {form.image && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${form.image}`}
              className="w-full h-40 object-cover rounded border"
            />
          )}

          <ImageUploadModal
            open={openCategoryImage}
            multiple={false}
            onClose={() => setOpenCategoryImage(false)}
            onSelect={(urls) => setForm((p) => ({ ...p, image: urls[0] }))}
          />
        </div>

        {/* CATEGORY SLUG */}
        <div className="border p-3 rounded bg-gray-100 text-sm">
          <label className="font-medium">Slug (auto generated)</label>
          <p className="break-all">{form.slug}</p>
        </div>

        {/* CATEGORY PUBLISH */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Publish</h3>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            />
            Active
          </label>

          <button
            type="button"
            onClick={createCategory}
            className="bg-black text-white w-full py-2 rounded flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Category
          </button>
        </div>
      </div>
    </div>
  );
}
