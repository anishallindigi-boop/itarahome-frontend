'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import ImageUploadModal from '../../../elements/ImageUploadModal';
import Editor from '@/lib/Editor';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';

import {
  getSingleBlog,
  updateBlog,
  resetState,
} from '@/redux/slice/BlogSlice';

import { GetblogCategory } from '@/redux/slice/BlogCategorySlice';

/* ---------------- TYPES ---------------- */

interface BlogFormState {
  title: string;
  slug: string;
  content: string;
  image: string;
  category: string[]; // ✅ IDs only
  metatitle: string;
  metadescription: string;
  metakeywords: string;
  isActive: boolean;
  status: 'draft' | 'published';
}

/* ---------------- SLUG ---------------- */

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/* ---------------- COMPONENT ---------------- */

export default function BlogUpdateForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();

  const blogId = params?.id as string;

  const { singleblog, loading, error, message, isupdate } =
    useAppSelector((state: RootState) => state.blog);

  const { blogcategories } = useAppSelector(
    (state: RootState) => state.blogcategory
  );

  const [openImage, setOpenImage] = useState(false);

  const [form, setForm] = useState<BlogFormState>({
    title: '',
    slug: '',
    content: '',
    image: '',
    category: [],
    metatitle: '',
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
      if (name === 'title') {
        return {
          ...prev,
          title: value,
          slug: generateSlug(value),
        };
      }

      if (type === 'checkbox') {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked,
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(id)
        ? prev.category.filter((cid) => cid !== id)
        : [...prev.category, id],
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateBlog({ id: blogId, form }));
  };

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    dispatch(GetblogCategory());
    dispatch(getSingleBlog(blogId));
  }, [blogId, dispatch]);

  /**
   * 🔥 VERY IMPORTANT FIX
   * Convert category OBJECTS → IDS
   */
  useEffect(() => {
    if (singleblog) {
      setForm({
        title: singleblog.title || '',
        slug: singleblog.slug || '',
        content: singleblog.content || '',
        image: singleblog.image || '',
        category: Array.isArray(singleblog.category)
          ? singleblog.category.map((c: any) => c._id) // ✅ FIX
          : [],
        metatitle: singleblog.metatitle || '',
        metadescription: singleblog.metadescription || '',
        metakeywords: singleblog.metakeywords || '',
        isActive: singleblog.isActive ?? true,
        status: singleblog.status || 'draft',
      });
    }
  }, [singleblog]);

  /* ---------------- TOAST + REDIRECT ---------------- */

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);

    if (isupdate) {
      dispatch(resetState());
      router.push('/admin/blogs');
    }
  }, [message, error, isupdate, dispatch, router]);

  /* ---------------- UI ---------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6"
    >
      {/* ================= LEFT ================= */}
      <div className="col-span-8 space-y-6">
        {/* BLOG INFO */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Blog Information</h3>

          <input
            name="title"
            placeholder="Blog Title"
            className="border p-2 w-full rounded"
            value={form.title}
            onChange={handleChange}
            required
          />

          <div className="bg-white border rounded p-5">
            <h3 className="font-semibold text-lg mb-3">Blog Content</h3>
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
            className="bg-black text-white w-full py-2 rounded flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Updating...' : 'Update Blog'}
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-3 rounded bg-gray-100 text-sm">
          <label className="font-medium">Slug</label>
          <p className="break-all">{form.slug}</p>
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
                  onChange={() => toggleCategory(c._id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        {/* IMAGE */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Featured Image</h3>

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
