'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import ImageUploadModal from '../../../elements/ImageUploadModal';

import {
  GetSingleSubCategory,
  UpdateSubCategory,
} from '@/redux/slice/SubCategorySlice';

import { GetProductCategory } from '@/redux/slice/ProductCategorySlice';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

/* ---------------- TYPES ---------------- */

interface SubCategoryFormState {
  name: string;
  slug: string;
  category: string;
  description: string;
  metatitle: string;
  metadescription: string;
  metakeywords: string;
  image: string;
  isActive: boolean;
  status: 'draft' | 'publish';
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

export default function SubCategoryUpdateForm() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const router = useRouter();

  const subCategoryId = params?.id as string;

  const {
    singleSubCategory,
    loading,
    error,
    message,
    isupdated,
  } = useAppSelector((state: RootState) => state.subcategory);

  const { categories } = useAppSelector(
    (state: RootState) => state.productcategory
  );

  const [openImage, setOpenImage] = useState(false);

  const [form, setForm] = useState<SubCategoryFormState>({
    name: '',
    slug: '',
    category: '',
    description: '',
    metatitle: '',
    metadescription: '',
    metakeywords: '',
    image: '',
    status: 'draft',
    isActive: true,
  });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (subCategoryId) {
      dispatch(GetSingleSubCategory(subCategoryId));
    }
    dispatch(GetProductCategory());
  }, [subCategoryId, dispatch]);

  useEffect(() => {
    if (singleSubCategory) {
      setForm({
        name: singleSubCategory.name || '',
        slug: singleSubCategory.slug || '',
        category:
          typeof singleSubCategory.category === 'object'
            ? singleSubCategory.category._id
            : singleSubCategory.category,
        description: singleSubCategory.description || '',
        metatitle: singleSubCategory.metatitle || '',
        metadescription: singleSubCategory.metadescription || '',
        metakeywords: singleSubCategory.metakeywords || '',
        image: singleSubCategory.image || '',
        status: singleSubCategory.status || 'draft',
        isActive: singleSubCategory.isActive ?? true,
      });
    }
  }, [singleSubCategory]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((p) => {
      if (name === 'name') {
        return { ...p, name: value, slug: generateSlug(value) };
      }
      return { ...p, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateSubCategory({ id: subCategoryId, form }));
  };

  /* ---------------- TOAST + REDIRECT ---------------- */

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    if (isupdated) {
      router.push('/admin/sub-category');
    }
  }, [message, error, isupdated, router]);

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
          <h3 className="font-semibold text-lg">SubCategory Information</h3>

          <input
            name="name"
            placeholder="SubCategory Name"
            className="border p-2 w-full rounded"
            value={form.name}
            onChange={handleChange}
          />

          {/* CATEGORY SELECT */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="">Select Parent Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <textarea
            name="description"
            placeholder="SubCategory Description"
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
            <option value="publish">Published</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white w-full py-2 rounded"
          >
            Update SubCategory
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-3 rounded bg-gray-100 text-sm">
          <label className="font-medium">Slug</label>
          <p className="break-all">{form.slug}</p>
        </div>

        {/* IMAGE */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">SubCategory Image</h3>

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
