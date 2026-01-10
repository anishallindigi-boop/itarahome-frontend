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
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
  GetSubCategories,
} from '@/redux/slice/SubCategorySlice';

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
    metatitle?:string;
  metadescription?:string,
  metakeywords?:string;
  name: string;
  description: string;
  content: string;
  slug: string;
  categoryid: string[];
      subcategoryid: string[],   // ✅
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
const params=useParams();
const productId = params?.id as string;
  const route=useRouter();

  const [openMain, setOpenMain] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [variationImageIndex, setVariationImageIndex] = useState<number | null>(null);

  const { categories } = useAppSelector((state: RootState) => state.productcategory);
    const {
    subCategories,
  } = useAppSelector((state: RootState) => state.subcategory);
  const { singleProduct, loading, error, message ,isUpdated} = useAppSelector((state: RootState) => state.product);

  const [form, setForm] = useState<ProductFormState>({
       metatitle:'',
    metadescription:'',
    metakeywords:'',
    name: '',
    description: '',
    content: '',
    price: '',
    categoryid: [],
        subcategoryid: [],
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


//-----------------------------------------------remove------------------------------------


// REMOVE ATTRIBUTE VALUE
const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
  setForm((prev) => {
    const attributes = [...prev.attributes];
    attributes[attrIndex].values = attributes[attrIndex].values.filter(
      (_, i) => i !== valueIndex
    );
    return { ...prev, attributes };
  });
};

// REMOVE ENTIRE ATTRIBUTE
const removeAttribute = (attrIndex: number) => {
  setForm((prev) => ({
    ...prev,
    attributes: prev.attributes.filter((_, i) => i !== attrIndex),
    variations: [], // reset variations (important)
  }));
};

// REMOVE VARIATION
const removeVariation = (index: number) => {
  setForm((prev) => ({
    ...prev,
    variations: prev.variations.filter((_, i) => i !== index),
  }));
};





  /* ---------------- VARIATIONS ---------------- */

const generateVariations = () => {
  const validAttrs = form.attributes.filter(
    (a) => a.name && a.values.length
  );

  if (!validAttrs.length) return;

  const combos = cartesian(validAttrs.map((a) => a.values));

  // helper to compare attribute objects
  const sameAttributes = (
    a: Record<string, string>,
    b: Record<string, string>
  ) =>
    JSON.stringify(a) === JSON.stringify(b);

  const newVariations: Variation[] = [];

  combos.forEach((combo) => {
    const attrs: Record<string, string> = {};

    combo.forEach((val, i) => {
      attrs[validAttrs[i].name] = val;
    });

    // check if variation already exists
    const exists = form.variations.some((v) =>
      sameAttributes(v.attributes, attrs)
    );

    if (!exists) {
      newVariations.push({
        attributes: attrs,
        price: '',
        discountPrice: '',
        stock: '',
      });
    }
  });

  setForm((prev) => ({
    ...prev,
    variations: [...prev.variations, ...newVariations],
  }));
};

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProduct({ id: productId, form: form }));
  };

  /* ---------------- FETCH PRODUCT ---------------- */

  useEffect(() => {
     dispatch(GetSubCategories());
    dispatch(getProductById(productId));
  }, [productId]);

  useEffect(() => {
    if (singleProduct?.product) {
      const p = singleProduct.product;
      setForm({
        metatitle:p.metatitle || '',
        metadescription:p.metadescription || '',
        metakeywords:p.metakeywords || '',
        name: p.name || '',
        description: p.description || '',
        content: p.content || '',
        slug: p.slug || '',
        categoryid: Array.isArray(p.categoryid) ? p.categoryid : [p.categoryid || ''],
            subcategoryid: Array.isArray(p.subcategoryid) ? p.subcategoryid : [p.subcategoryid || ''],
        price: p.price || '',
        discountPrice: p.discountPrice || '',
        stock: p.stock || '',
        status: p.status || 'draft',
        mainImage: p.mainImage || p.image || '',
        gallery: p.gallery || [],
       // ✅ FIXED ATTRIBUTES
attributes:
  p.attributes?.map((attr: any) => ({
    name: attr.name,
    values: Array.isArray(attr.values) ? attr.values : [],
  })) || [],


  // ✅ Variations can stay same if already flat
  variations:
    p.variations?.map((v: any) => ({
      attributes: v.attributes,
      price: v.price || '',
      discountPrice: v.discountPrice || '',
      stock: v.stock || '',
      image: v.image || '',
    })) || [],
      });
    }
  }, [singleProduct]);

  /* ---------------- TOAST MESSAGES ---------------- */

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
       if(isUpdated){
        route.push('/admin/product')
    }
  }, [message, error,isUpdated]);




const groupedCategories = subCategories?.reduce((acc: any, sub: any) => {
  const cat = sub.category;
  if (!cat) return acc;

  if (!acc[cat._id]) {
    acc[cat._id] = {
      _id: cat._id,
      name: cat.name,
      subcategories: [],
    };
  }

  acc[cat._id].subcategories.push({
    _id: sub._id,
    name: sub.name,
  });

  return acc;
}, {});

const categoryTree = Object.values(groupedCategories || {});

useEffect(() => {
  if (!categoryTree.length || !form.subcategoryid.length) return;

  setForm((prev) => {
    const autoCategoryIds = new Set(prev.categoryid);

    categoryTree.forEach((cat: any) => {
      const hasSelectedSub = cat.subcategories.some((sub: any) =>
        prev.subcategoryid.includes(sub._id)
      );

      if (hasSelectedSub) {
        autoCategoryIds.add(cat._id);
      }
    });

    const nextCategoryIds = Array.from(autoCategoryIds);

    // 🛑 CRITICAL GUARD (prevents infinite loop)
    if (
      nextCategoryIds.length === prev.categoryid.length &&
      nextCategoryIds.every((id) => prev.categoryid.includes(id))
    ) {
      return prev; // ⛔ no state change → no re-render
    }

    return {
      ...prev,
      categoryid: nextCategoryIds,
    };
  });
}, [categoryTree, form.subcategoryid]);


  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      {/* ================= LEFT COLUMN ================= */}
      <div className="col-span-8 space-y-6">
        {/* BASIC INFO */}
        <div className="bg-white border rounded p-5 space-y-4">
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
  <div
    key={i}
    className="border p-3 rounded space-y-2 relative"
  >
    {/* REMOVE ATTRIBUTE */}
    <button
      type="button"
      onClick={() => removeAttribute(i)}
      className="absolute top-2 right-2 text-red-600 text-sm"
    >
      ✕
    </button>

    <input
      placeholder="Attribute Name (Size)"
      className="border p-2 w-full rounded"
      value={attr.name}
      onChange={(e) => updateAttributeName(i, e.target.value)}
    />

    <AttributeValues
      values={attr.values}
      onAdd={(v) => addAttributeValue(i, v)}
      onRemove={(valueIndex) =>
        removeAttributeValue(i, valueIndex)
      }
    />
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
              <div key={i} className="grid grid-cols-7 gap-3 items-center border p-3 rounded">
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
                <button
  type="button"
  onClick={() => removeVariation(i)}
  className="text-red-600 border px-2 py-1 rounded text-sm"
>
  ✕
</button>

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
        {/* <div className="space-y-2 bg-white">
          <p className="font-semibold">Select Categories</p>
          {categories?.map((cat: any) => (
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
        </div> */}


{/* CATEGORY + SUBCATEGORY TREE */}
<div className="bg-white border rounded p-5">
  <h3 className="font-semibold text-lg mb-3">Categories</h3>

  <div className="space-y-4">
    {categoryTree.map((cat: any) => (
      <div
        key={cat._id}
        className="relative pl-4 border-l-2 border-gray-300"
      >
        {/* CATEGORY */}
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={form.categoryid.includes(cat._id)}
            onChange={() => {
              setForm((prev) => {
                const selected = prev.categoryid.includes(cat._id);

                return {
                  ...prev,
                  categoryid: selected
                    ? prev.categoryid.filter((id) => id !== cat._id)
                    : [...prev.categoryid, cat._id],

                  // 🔥 remove its subcategories if category unchecked
                  subcategoryid: selected
                    ? prev.subcategoryid.filter(
                        (sid) =>
                          !cat.subcategories.some(
                            (s: any) => s._id === sid
                          )
                      )
                    : prev.subcategoryid,
                };
              });
            }}
          />
          {cat.name}
        </label>

        {/* SUBCATEGORIES */}
        {form.categoryid.includes(cat._id) && (
          <div className="ml-6 mt-2 space-y-2">
            {cat.subcategories.map((sub: any) => (
              <label
                key={sub._id}
                className="flex items-center gap-2 text-sm relative"
              >
                {/* connector line */}
                <span className="absolute -left-4 top-3 w-3 border-t border-gray-300" />

                <input
                  type="checkbox"
                  checked={form.subcategoryid.includes(sub._id)}
                  onChange={() => {
                    setForm((prev) => ({
                      ...prev,
                      subcategoryid: prev.subcategoryid.includes(sub._id)
                        ? prev.subcategoryid.filter(
                            (id) => id !== sub._id
                          )
                        : [...prev.subcategoryid, sub._id],
                    }));
                  }}
                />
                {sub.name}
              </label>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
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

function AttributeValues({
  values,
  onAdd,
  onRemove,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (index: number) => void;
}) {
  const [val, setVal] = useState('');

  return (
    <>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Value (Red)"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (!val.trim()) return;
            onAdd(val);
            setVal('');
          }}
          className="border px-3 rounded"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mt-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="border px-2 py-1 rounded text-xs flex items-center gap-1"
          >
            {v}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </>
  );
}

/* ---------------- UTILS ---------------- */

function cartesian(arr: string[][]): string[][] {
  return arr.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]] as string[][]);
}