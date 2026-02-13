'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Save } from 'lucide-react';
import ImageUploadModal from '../../elements/ImageUploadModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import {
  CreateblogCategory,
  resetState,
} from '@/redux/slice/BlogCategorySlice';

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
  status: 'draft' | 'published';
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

export default function CategoryCreateForm() {
  const dispatch = useAppDispatch();
  const { loading, success } = useAppSelector(
    (state: RootState) => state.productcategory
  );

  const [openImage, setOpenImage] = useState(false);

  const [form, setForm] = useState<CategoryFormState>({
    name: '',
    slug: '',
    description: '',
    image: '',
    metatitle: '',
    metadescription: '',
    metakeywords: '',
    isActive: true,
    status: 'draft',
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === 'name') {
        return {
          ...prev,
          name: value,
          slug: generateSlug(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(CreateblogCategory(form));
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (success) {
      setForm({
        name: '',
        slug: '',
        description: '',
        image: '',
        metatitle: '',
        metadescription: '',
        metakeywords: '',
        isActive: true,
        status: 'draft',
      });
      dispatch(resetState());
    }
  }, [success, dispatch]);

  /* ---------------- UI ---------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6"
    >
      {/* ================= LEFT ================= */}
      <div className="col-span-8 space-y-6">
        {/* BASIC INFO */}
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
        </div>

        {/* SEO */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">SEO Settings</h3>

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
      </div>

      {/* ================= RIGHT ================= */}
      <div className="col-span-4 space-y-6 sticky top-6">
        {/* PUBLISH */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Publish</h3>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={() =>
                setForm((p) => ({ ...p, isActive: !p.isActive }))
              }
            />
            Active
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white w-full py-2 rounded flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save Category
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-3 rounded bg-gray-100 text-sm">
          <label className="font-medium">Slug (auto generated)</label>
          <p className="break-all">{form.slug}</p>
        </div>

        {/* IMAGE */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Category Image</h3>

          <button
            type="button"
            className="flex items-center gap-2 border px-4 py-2 rounded"
            onClick={() => setOpenImage(true)}
          >
            <ImageIcon size={18} />
            Select Image
          </button>

          {form.image && (
            <img
              src={`${form.image}`}
              className="w-full object-cover rounded border"
            />
          )}

          <ImageUploadModal
            open={openImage}
            multiple={false}
            onClose={() => setOpenImage(false)}
            onSelect={(urls) =>
              setForm((p) => ({ ...p, image: urls[0] }))
            }
          />
        </div>
      </div>
    </form>
  );
}
