'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Save } from 'lucide-react';
import ImageUploadModal from '../../elements/ImageUploadModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import {
  Createblog,
  resetState,
} from '@/redux/slice/BlogSlice';
import { GetblogCategory } from '@/redux/slice/BlogCategorySlice';
import Editor from '@/lib/Editor';


/* ---------------- TYPES ---------------- */

interface CategoryFormState {
  title: string;
  slug: string;
  content: string;
  image: string;
  metatitle: string;
  category:string[] ;
    metadescription: string;
  metakeywords: string;
  isActive: boolean;
  status: 'draft' | 'published';
}

/* ---------------- SLUG UTILITY ---------------- */

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

  const { loading, success, error,blogcategories } = useAppSelector(
    (state: RootState) => state.blogcategory
  );

  const [openImage, setOpenImage] = useState(false);

  const [form, setForm] = useState<CategoryFormState>({
    title: '',
    slug: '',
    content: '',
    image: '',
    metatitle: '',
    category:[],
    metadescription: '',
    metakeywords: '',
    isActive: true,
    status: 'draft',
  });

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => {
      // auto slug
      if (name === 'title') {
        return {
          ...prev,
          title: value,
          slug: generateSlug(value),
        };
      }

      // checkbox
      if (type === 'checkbox') {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked,
        };
      }

      return { ...prev, [name]: value };
    });
  };


const handleCategoryCheckbox = (categoryId: string) => {
  setForm((prev) => {
    const exists = prev.category.includes(categoryId);

    return {
      ...prev,
      category: exists
        ? prev.category.filter((id) => id !== categoryId)
        : [...prev.category, categoryId],
    };
  });
};



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form, "data")
    dispatch(Createblog(form));
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (success) {
      setForm({
        title: '',
        slug: '',
        content: '',
        image: '',
        category:[],
        metatitle: '',
        metadescription: '',
        metakeywords: '',
        isActive: true,
        status: 'draft',
      });
      dispatch(resetState());
    }
  }, [success, dispatch]);


  useEffect(() => {
    dispatch(GetblogCategory());
  }, [dispatch]);



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
          <h3 className="font-semibold text-lg">Blog Information</h3>

          <input
            name="title"
            placeholder="title"
            className="border p-2 w-full rounded"
            value={form.title}
            onChange={handleChange}
            required
          />

          {/* CONTENT */}
        <div className="bg-white border rounded p-5">
          <h3 className="font-semibold text-lg mb-3">Product Content</h3>
          <Editor formData={form} setFormData={setForm} />
        </div>
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
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Active
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white w-full py-2 rounded flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-3 rounded bg-gray-100 text-sm">
          <label className="font-medium">Slug (auto generated)</label>
          <p className="break-all">{form.slug || '—'}</p>
        </div>



 {/* CATEGORIES */}
<div className="bg-white border rounded p-5 space-y-3">
  <h3 className="font-semibold text-lg">Blog Categories</h3>

  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
    {blogcategories.map((c: any) => (
      <label
        key={c._id}
        className="flex items-center gap-2 text-sm cursor-pointer"
      >
        <input
          type="checkbox"
          checked={form.category.includes(c._id)}
          onChange={() => handleCategoryCheckbox(c._id)}
        />
        {c.name}
      </label>
    ))}
  </div>
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
              src={`${process.env.NEXT_PUBLIC_API_URL}${form.image}`}
              className="w-full h-40 object-cover rounded border"
              alt="Category"
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
