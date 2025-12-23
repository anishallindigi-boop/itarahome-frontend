'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import ImageUploadModal from '../../../elements/ImageUploadModal';
import {
  GetSingleProductCategory,
  UpdateProductCategory,
} from '@/redux/slice/ProductCategorySlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';

/* ---------------- TYPES ---------------- */

interface CategoryFormState {
  name: string;
  description: string;
  slug: string;
  metatitle: string;
  metadescription: string;
  metakeywords: string;
  image: string;
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

export default function CategoryUpdateForm() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const categoryId = params?.id as string;
  const route=useRouter();

  const { singleCategory, loading, error, message,isupdated } =
    useAppSelector((state: RootState) => state.productcategory);

  

  const [openImage, setOpenImage] = useState(false);

  const [form, setForm] = useState<CategoryFormState>({
    name: '',
    description: '',
    slug: '',
    metatitle: '',
    metadescription: '',
    metakeywords: '',
    image: '',
    status: 'draft',
  });

  /* ---------------- CHANGE ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((p) => {
      if (name === 'name') {
        return { ...p, name: value, slug: generateSlug(value) };
      }
      return { ...p, [name]: value };
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateProductCategory({ id: categoryId, form: form }));
  };

  /* ---------------- FETCH CATEGORY ---------------- */

  useEffect(() => {
    if (categoryId) {
      dispatch(GetSingleProductCategory(categoryId));
    }
  }, [categoryId, dispatch]);

  useEffect(() => {
    if (singleCategory) {
      setForm({
        name: singleCategory.name || '',
        description: singleCategory.description || '',
        slug: singleCategory.slug || '',
        metatitle: singleCategory.metatitle || '',
        metadescription: singleCategory.metadescription || '',
        metakeywords: singleCategory.metakeywords || '',
        image: singleCategory.image || '',
        status: singleCategory.status || 'draft',
      });
    }
  }, [singleCategory]);

  /* ---------------- TOAST ---------------- */

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    if(isupdated){
        route.push('/admin/category')
    }
  }, [message, error,isupdated]);

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
            rows={3}
            className="border p-2 w-full rounded"
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
            rows={2}
            className="border p-2 w-full rounded"
            value={form.metadescription}
            onChange={handleChange}
          />

          <input
            name="metakeywords"
            placeholder="Meta Keywords"
            className="border p-2 w-full rounded"
            value={form.metakeywords}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="col-span-4 space-y-6 sticky top-6">
        {/* PUBLISH */}
        <div className="bg-white border rounded p-5 space-y-3">
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

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white w-full py-2 rounded"
          >
            Update Category
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-3 rounded bg-gray-100 text-sm">
          <label className="font-medium">Slug</label>
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
              src={`${process.env.NEXT_PUBLIC_API_URL}${form.image}`}
              className="w-full h-40 object-cover rounded border"
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
