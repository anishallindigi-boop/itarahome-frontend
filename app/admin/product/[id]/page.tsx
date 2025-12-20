'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import ImageUploadModal from '../../../elements/ImageUploadModal';
import Editor from '@/lib/Editor';
import { GetProductCategory } from "@/redux/slice/ProductCategorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { getProductById, updateProduct } from "@/redux/slice/ProductSlice";
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

/* ---------------- TYPES ---------------- */

interface Attribute {
  name: string;
  values: string[];
}

interface Variation {
  attributes: Record<string, string>;
  price: string;
  discountPrice: string;
  stock: string;
  image?: string;
}

interface ProductFormState {
  name: string;
  description: string;
  content: string;
  slug: string;
  categoryid: string[];
  price: string;
  discountPrice: string;
  stock: string;
  status: 'draft' | 'published';
  mainImage: string;
  gallery: string[];
  attributes: Attribute[];
  variations: Variation[];
}

/* ---------------- COMPONENT ---------------- */

interface Props {
  productId: string;
}

export default function ProductUpdateForm() {
  const dispatch = useAppDispatch();
const param=useParams();
const productId=param.id;


  const [openMain, setOpenMain] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [variationImageIndex, setVariationImageIndex] = useState<number | null>(null);

  const { Productcategories } = useAppSelector((state: RootState) => state.productcategory);
  const { singleProduct, loading, error, message } = useAppSelector((state: RootState) => state.product);

  const [form, setForm] = useState<ProductFormState>({
    name: '',
    description: '',
    content: '',
    price: '',
    categoryid: [],
    discountPrice: '',
    stock: '',
    slug: '',
    status: 'draft',
    mainImage: '',
    gallery: [],
    attributes: [],
    variations: [],
  });

  /* ---------------- BASIC CHANGE ---------------- */

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((p) => {
      if (name === 'name') {
        return {
          ...p,
          name: value,
          slug: generateSlug(value),
        };
      }
      return { ...p, [name]: value };
    });
  };

  /* ---------------- ATTRIBUTES ---------------- */

  const addAttribute = () => {
    setForm((p) => ({
      ...p,
      attributes: [...p.attributes, { name: '', values: [] }],
    }));
  };

  const updateAttributeName = (i: number, value: string) => {
    const copy = [...form.attributes];
    copy[i].name = value;
    setForm((p) => ({ ...p, attributes: copy }));
  };

const addAttributeValue = (i: number, value: string) => {
  if (!value) return;

  setForm((p) => ({
    ...p,
    attributes: p.attributes.map((attr, idx) =>
      idx === i
        ? { ...attr, values: [...attr.values, value] }
        : attr
    ),
  }));
};





  /* ---------------- VARIATIONS ---------------- */

  const generateVariations = () => {
    const validAttrs = form.attributes.filter((a) => a.name && a.values.length);
    if (!validAttrs.length) return;

    const combos = cartesian(validAttrs.map((a) => a.values));

    const variations: Variation[] = combos.map((combo) => {
      const attrs: Record<string, string> = {};
      combo.forEach((val, i) => {
        attrs[validAttrs[i].name] = val;
      });

      return {
        attributes: attrs,
        price: '',
        discountPrice: '',
        stock: '',
      };
    });

    setForm((p) => ({ ...p, variations }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProduct({ id: productId, formData: form }));
  };

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
    dispatch(GetProductCategory());
    dispatch(getProductById(productId));
  }, [productId]);

  useEffect(() => {
    if (singleProduct?.product) {
      const p = singleProduct.product;
      setForm({
        name: p.name || '',
        description: p.description || '',
        content: p.content || '',
        slug: p.slug || '',
        categoryid: Array.isArray(p.categoryid) ? p.categoryid : [p.categoryid || ''],
        price: p.price || '',
        discountPrice: p.discountPrice || '',
        stock: p.stock || '',
        status: p.status || 'draft',
        mainImage: p.mainImage || p.image || '',
        gallery: p.gallery || [],
        attributes: p.attributes || [],
        variations: p.variations || [],
      });
    }
  }, [singleProduct]);

  /* ---------------- TOAST MESSAGES ---------------- */

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
  }, [message, error]);

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      {/* ================= LEFT COLUMN ================= */}
      <div className="col-span-8 space-y-6">
        {/* BASIC INFO */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Product Information</h3>

          <input
            name="name"
            placeholder="Product Name"
            className="border p-2 w-full rounded"
            value={form.name}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Short Description"
            className="border p-2 w-full rounded"
            value={form.description}
            onChange={handleChange}
          />

          <div className="grid grid-cols-3 gap-4">
            <input
              name="price"
              placeholder="Price"
              className="border p-2 rounded"
              value={form.price}
              onChange={handleChange}
            />
            <input
              name="discountPrice"
              placeholder="Discount Price"
              className="border p-2 rounded"
              value={form.discountPrice}
              onChange={handleChange}
            />
            <input
              name="stock"
              placeholder="Stock"
              className="border p-2 rounded"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white border rounded p-5">
          <h3 className="font-semibold text-lg mb-3">Product Content</h3>
          <Editor formData={form} setFormData={setForm} />
        </div>

        {/* ATTRIBUTES */}
        <div className="bg-white border rounded p-5 space-y-4">
          <h3 className="font-semibold text-lg">Attributes</h3>
          {form.attributes.map((attr, i) => (
            <div key={i} className="border p-3 rounded space-y-2">
              <input
                placeholder="Attribute Name (Size)"
                className="border p-2 w-full rounded"
                value={attr.name}
                onChange={(e) => updateAttributeName(i, e.target.value)}
              />

              <AttributeValues values={attr.values} onAdd={(v) => addAttributeValue(i, v)} />
            </div>
          ))}
          <button type="button" onClick={addAttribute} className="border px-4 py-2 rounded">
            + Add Attribute
          </button>
        </div>

        {/* VARIATIONS */}
        {form.variations.length > 0 && (
          <div className="bg-white border rounded p-5 space-y-4">
            <h3 className="font-semibold text-lg">Variations</h3>
            {form.variations.map((v, i) => (
              <div key={i} className="grid grid-cols-6 gap-3 items-center border p-3 rounded">
                <div className="col-span-2 text-sm">
                  {Object.entries(v.attributes).map(([k, val]) => (
                    <div key={k}>
                      <b>{k}</b>: {val}
                    </div>
                  ))}
                </div>
                <input
                  placeholder="Price"
                  className="border p-2 rounded"
                  value={v.price}
                  onChange={(e) => {
                    const copy = [...form.variations];
                    copy[i].price = e.target.value;
                    setForm((p) => ({ ...p, variations: copy }));
                  }}
                />
                <input
                  placeholder="Discount"
                  className="border p-2 rounded"
                  value={v.discountPrice}
                  onChange={(e) => {
                    const copy = [...form.variations];
                    copy[i].discountPrice = e.target.value;
                    setForm((p) => ({ ...p, variations: copy }));
                  }}
                />
                <input
                  placeholder="Stock"
                  className="border p-2 rounded"
                  value={v.stock}
                  onChange={(e) => {
                    const copy = [...form.variations];
                    copy[i].stock = e.target.value;
                    setForm((p) => ({ ...p, variations: copy }));
                  }}
                />
                <button type="button" className="border p-2 rounded" onClick={() => setVariationImageIndex(i)}>
                  <ImageIcon size={18} />
                </button>

                {v.image && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${v.image}`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                )}

                {variationImageIndex === i && (
                  <ImageUploadModal
                    open
                    multiple={false}
                    onClose={() => setVariationImageIndex(null)}
                    onSelect={(urls) => {
                      const copy = [...form.variations];
                      copy[i].image = urls[0];
                      setForm((p) => ({ ...p, variations: copy }));
                      setVariationImageIndex(null);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={generateVariations} className="border px-4 py-2 rounded">
          Generate Variations
        </button>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <div className="col-span-4 space-y-6 sticky top-6">
        {/* STATUS */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Publish</h3>

          <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded w-full">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <button type="submit" className="bg-black text-white w-full py-2 rounded">
            Update Product
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-2 rounded bg-gray-100 text-sm">
          <label>Slug (auto-generated)</label>
          <p>{form.slug}</p>
        </div>

        {/* CATEGORIES */}
        <div className="space-y-2 bg-white">
          <p className="font-semibold">Select Categories</p>
          {Productcategories?.map((cat: any) => (
            <label key={cat._id} className="flex items-center gap-2 border p-2 rounded cursor-pointer">
              <input
                type="checkbox"
                value={cat._id}
                checked={form.categoryid.includes(cat._id)}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => {
                    if (prev.categoryid.includes(value)) {
                      return { ...prev, categoryid: prev.categoryid.filter((id) => id !== value) };
                    } else {
                      return { ...prev, categoryid: [...prev.categoryid, value] };
                    }
                  });
                }}
              />
              {cat.name}
            </label>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Main Image</h3>
          <button type="button" className="flex items-center gap-2 border px-4 py-2 rounded" onClick={() => setOpenMain(true)}>
            <ImageIcon size={18} />
            Select Image
          </button>
          {form.mainImage && <img src={`${process.env.NEXT_PUBLIC_API_URL}${form.mainImage}`} className="w-full h-48 object-cover rounded border" />}
          <ImageUploadModal open={openMain} multiple={false} onClose={() => setOpenMain(false)} onSelect={(urls) => setForm((p) => ({ ...p, mainImage: urls[0] }))} />
        </div>

        {/* GALLERY */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Gallery</h3>
          <button type="button" className="flex items-center gap-2 border px-4 py-2 rounded" onClick={() => setOpenGallery(true)}>
            <ImageIcon size={18} />
            Add Images
          </button>
          <div className="grid grid-cols-3 gap-2">
            {form.gallery.map((img, i) => (
              <img key={i} src={`${process.env.NEXT_PUBLIC_API_URL}${img}`} className="w-full h-20 object-cover rounded border" />
            ))}
          </div>
          <ImageUploadModal open={openGallery} multiple onClose={() => setOpenGallery(false)} onSelect={(urls) => setForm((p) => ({ ...p, gallery: urls }))} />
        </div>
      </div>
    </form>
  );
}

/* ---------------- ATTRIBUTE VALUES ---------------- */

function AttributeValues({ values, onAdd }: { values: string[]; onAdd: (v: string) => void }) {
  const [val, setVal] = useState('');

  return (
    <>
      <div className="flex gap-2">
        <input className="border p-2 flex-1 rounded" placeholder="Value (Red)" value={val} onChange={(e) => setVal(e.target.value)} />
        <button type="button" onClick={() => { onAdd(val); setVal(''); }} className="border px-3 rounded">
          Add
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {values.map((v, i) => (
          <span key={i} className="border px-2 py-1 rounded text-xs">{v}</span>
        ))}
      </div>
    </>
  );
}

/* ---------------- UTILS ---------------- */

function cartesian(arr: string[][]): string[][] {
  return arr.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]] as string[][]);
}
