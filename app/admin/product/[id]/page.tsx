'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, Palette, Type, Upload } from 'lucide-react';
import ImageUploadModal from '../../../elements/ImageUploadModal';
import Editor from '@/lib/Editor';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { getProductById, updateProduct } from "@/redux/slice/ProductSlice";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { GetSubCategories } from '@/redux/slice/SubCategorySlice';

/* ---------------- TYPES ---------------- */

type AttributeType = 'text' | 'color' | 'image';

interface AttributeValue {
  value: string;
  color?: string;
  image?: string;
}

interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  values: AttributeValue[];
}

interface Variation {
  attributes: Record<string, string>;
  price: string;
  discountPrice: string;
  stock: string;
  image?: string;
}

interface ProductFormState {
  metatitle?: string;
  metadescription?: string;
  metakeywords?: string;
  name: string;
  description: string;
  content: string;
  slug: string;
  categoryid: string[];
  subcategoryid: string[];
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

export default function ProductUpdateForm() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const productId = params?.id as string;
  const route = useRouter();

  const [openMain, setOpenMain] = useState(false);
  const [openGallery, setOpenGallery] = useState(false);
  const [variationImageIndex, setVariationImageIndex] = useState<number | null>(null);
  const [attrValueImageModal, setAttrValueImageModal] = useState<{
    attrIndex: number;
    valueIndex: number;
  } | null>(null);

  const { subCategories } = useAppSelector((state: RootState) => state.subcategory);
  const { singleProduct, loading, error, message, isUpdated } = useAppSelector((state: RootState) => state.product);

  const [form, setForm] = useState<ProductFormState>({
    metatitle: '',
    metadescription: '',
    metakeywords: '',
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
      attributes: [
        ...p.attributes,
        {
          id: crypto.randomUUID(),
          name: '',
          type: 'text',
          values: [],
        },
      ],
    }));
  };

  const updateAttributeName = (i: number, value: string) => {
    setForm((prev) => {
      const attributes = prev.attributes.map((attr, index) =>
        index === i ? { ...attr, name: value } : attr
      );
      return { ...prev, attributes };
    });
  };

  const updateAttributeType = (i: number, type: AttributeType) => {
    setForm((prev) => {
      const attributes = prev.attributes.map((attr, index) =>
        index === i ? { ...attr, type, values: [] } : attr
      );
      return { ...prev, attributes, variations: [] };
    });
  };

  const addAttributeValue = (i: number, value: string, color?: string, image?: string) => {
    if (!value.trim()) return;

    setForm((prev) => {
      const attributes = prev.attributes.map((attr, index) =>
        index === i
          ? { ...attr, values: [...attr.values, { value, color, image }] }
          : attr
      );
      return { ...prev, attributes };
    });
  };

  const updateAttributeValueColor = (attrIndex: number, valueIndex: number, color: string) => {
    setForm((prev) => {
      const attributes = [...prev.attributes];
      attributes[attrIndex].values[valueIndex].color = color;
      return { ...prev, attributes };
    });
  };

  const updateAttributeValueImage = (attrIndex: number, valueIndex: number, image: string) => {
    setForm((prev) => {
      const attributes = [...prev.attributes];
      attributes[attrIndex].values[valueIndex].image = image;
      return { ...prev, attributes };
    });
  };

  const removeAttributeValue = (attrIndex: number, valueIndex: number) => {
    setForm((prev) => {
      const attributes = [...prev.attributes];
      attributes[attrIndex].values = attributes[attrIndex].values.filter(
        (_, i) => i !== valueIndex
      );
      return { ...prev, attributes };
    });
  };

  const removeAttribute = (attrIndex: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== attrIndex),
      variations: [],
    }));
  };

  const removeVariation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }));
  };

  /* ---------------- VARIATIONS ---------------- */

  const generateVariations = () => {
    const validAttrs = form.attributes.filter(
      (a) => a.name.trim() && a.values.length > 0
    );

    if (validAttrs.length === 0) {
      toast.error("Please add attributes with values first");
      return;
    }

    const combinations = cartesian(validAttrs.map((a) => a.values.map(v => v.value)));

    const sameAttributes = (
      a: Record<string, string>,
      b: Record<string, string>
    ) => JSON.stringify(a) === JSON.stringify(b);

    const newVariations: Variation[] = [];

    combinations.forEach((combo) => {
      const attrs: Record<string, string> = {};
      combo.forEach((val, idx) => {
        attrs[validAttrs[idx].name] = val;
      });

      const exists = form.variations.some((v) => sameAttributes(v.attributes, attrs));

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
    
    toast.success(`${newVariations.length} new variations generated`);
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
  }, [productId, dispatch]);

  useEffect(() => {
    if (singleProduct?.product) {
      const p = singleProduct.product;
      
      // Extract category IDs
      const extractedCategoryIds = Array.isArray(p.categoryid)
        ? p.categoryid.map((cat: any) => typeof cat === 'string' ? cat : cat._id)
        : [typeof p.categoryid === 'string' ? p.categoryid : p.categoryid?._id];

      // Extract subcategory IDs
      const extractedSubcategoryIds = Array.isArray(p.subcategoryid)
        ? p.subcategoryid.map((sub: any) => typeof sub === 'string' ? sub : sub._id)
        : [typeof p.subcategoryid === 'string' ? p.subcategoryid : p.subcategoryid?._id];

      // Transform attributes to new format if they come in old format
      const transformedAttributes = p.attributes?.map((attr: any) => {
        // Check if already in new format
        if (attr.type && Array.isArray(attr.values) && typeof attr.values[0] === 'object') {
          return {
            id: attr.id || crypto.randomUUID(),
            name: attr.name,
            type: attr.type || 'text',
            values: attr.values.map((v: any) => ({
              value: v.value || v,
              color: v.color || null,
              image: v.image || null
            }))
          };
        }
        // Old format conversion
        return {
          id: crypto.randomUUID(),
          name: attr.name,
          type: 'text',
          values: Array.isArray(attr.values) 
            ? attr.values.map((v: string) => ({ value: v, color: null, image: null }))
            : []
        };
      }) || [];

      // Transform variations - handle Map vs Object for attributes
      const transformedVariations = p.variations?.map((v: any) => {
        // Handle Mongoose Map or regular object
        let attrs = v.attributes;
        if (attrs instanceof Map || (attrs && typeof attrs.get === 'function')) {
          attrs = Object.fromEntries(attrs);
        } else if (typeof attrs !== 'object') {
          attrs = {};
        }
        
        return {
          attributes: attrs,
          price: v.price?.toString() || '',
          discountPrice: v.discountPrice?.toString() || '',
          stock: v.stock?.toString() || '',
          image: v.image || '',
        };
      }) || [];

      setForm({
        metatitle: p.metatitle || '',
        metadescription: p.metadescription || '',
        metakeywords: p.metakeywords || '',
        name: p.name || '',
        description: p.description || '',
        content: p.content || '',
        slug: p.slug || '',
        categoryid: extractedCategoryIds.filter(Boolean),
        subcategoryid: extractedSubcategoryIds.filter(Boolean),
        price: p.price?.toString() || '',
        discountPrice: p.discountPrice?.toString() || '',
        stock: p.stock?.toString() || '',
        status: p.status || 'draft',
        mainImage: p.mainImage || p.image || '',
        gallery: p.gallery || [],
        attributes: transformedAttributes,
        variations: transformedVariations,
      });
    }
  }, [singleProduct]);

  /* ---------------- TOAST MESSAGES ---------------- */

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
    if (isUpdated) {
      route.push('/admin/product');
    }
  }, [message, error, isUpdated, route]);

  /* ---------------- CATEGORY TREE ---------------- */

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

  // Auto-select parent categories when subcategories are selected
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

      if (
        nextCategoryIds.length === prev.categoryid.length &&
        nextCategoryIds.every((id) => prev.categoryid.includes(id))
      ) {
        return prev;
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
            <div key={attr.id} className="border p-4 rounded space-y-3 relative bg-gray-50">
              {/* REMOVE ATTRIBUTE */}
              <button
                type="button"
                onClick={() => removeAttribute(i)}
                className="absolute top-2 right-2 text-red-600 text-sm hover:bg-red-50 px-2 py-1 rounded"
              >
                ✕ Remove
              </button>

              {/* Attribute Name */}
              <input
                placeholder="Attribute Name (e.g., Color, Size)"
                className="border p-2 w-full rounded font-medium"
                value={attr.name}
                onChange={(e) => updateAttributeName(i, e.target.value)}
              />

              {/* Attribute Type Selector */}
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 self-center">Type:</span>
                <div className="flex gap-1 bg-white rounded border p-1">
                  <button
                    type="button"
                    onClick={() => updateAttributeType(i, 'text')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      attr.type === 'text' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Type size={14} /> Text
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAttributeType(i, 'color')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      attr.type === 'color' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Palette size={14} /> Color
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAttributeType(i, 'image')}
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                      attr.type === 'image' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <ImageIcon size={14} /> Image
                  </button>
                </div>
              </div>

              {/* Values based on type */}
              <AttributeValues
                type={attr.type}
                values={attr.values}
                onAdd={(val, color, image) => addAttributeValue(i, val, color, image)}
                onRemove={(valueIndex) => removeAttributeValue(i, valueIndex)}
                onUpdateColor={(valueIndex, color) => updateAttributeValueColor(i, valueIndex, color)}
                onUpdateImage={(valueIndex) => setAttrValueImageModal({ attrIndex: i, valueIndex })}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addAttribute}
            className="border px-4 py-2 rounded hover:bg-gray-50 flex items-center gap-2"
          >
            + Add Attribute
          </button>
        </div>

        {/* VARIATIONS */}
        {form.variations.length > 0 && (
          <div className="bg-white border rounded p-5 space-y-4">
            <h3 className="font-semibold text-lg">Variations</h3>
            {form.variations.map((v, i) => (
              <div key={i} className="grid grid-cols-7 gap-3 items-center border p-3 rounded bg-white">
                <div className="col-span-2 text-sm">
                  {Object.entries(v.attributes).map(([k, val]) => (
                    <div key={k} className="flex items-center gap-2 mb-1">
                      <b>{k}:</b>
                      <AttributeDisplay 
                        attr={form.attributes.find(a => a.name === k)} 
                        value={val} 
                      />
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
                <button
                  type="button"
                  className="border p-2 rounded hover:bg-gray-50"
                  onClick={() => setVariationImageIndex(i)}
                >
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
                  className="text-red-600 border px-2 py-1 rounded text-sm hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={generateVariations}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Generate Variations
        </button>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <div className="col-span-4 space-y-6 sticky top-6">
        {/* STATUS */}
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
            className="bg-black text-white w-full py-2 rounded hover:bg-gray-800"
          >
            Update Product
          </button>
        </div>

        {/* SLUG */}
        <div className="border p-3 rounded bg-gray-50 text-sm">
          <label className="text-gray-600">Slug (auto-generated)</label>
          <p className="font-mono text-gray-800 mt-1">{form.slug || '-'}</p>
        </div>

        {/* CATEGORIES */}
        <div className="bg-white border rounded p-5">
          <h3 className="font-semibold text-lg mb-3">Categories</h3>

          <div className="space-y-4">
            {categoryTree.map((cat: any) => (
              <div key={cat._id} className="relative pl-4 border-l-2 border-gray-300">
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
          <button
            type="button"
            className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50"
            onClick={() => setOpenMain(true)}
          >
            <ImageIcon size={18} />
            Select Image
          </button>
          {form.mainImage && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${form.mainImage}`}
              className="w-full h-48 object-cover rounded border"
            />
          )}
          <ImageUploadModal
            open={openMain}
            multiple={false}
            onClose={() => setOpenMain(false)}
            onSelect={(urls) => setForm((p) => ({ ...p, mainImage: urls[0] }))}
          />
        </div>

        {/* GALLERY */}
        <div className="bg-white border rounded p-5 space-y-3">
          <h3 className="font-semibold text-lg">Gallery</h3>
          <button
            type="button"
            className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50"
            onClick={() => setOpenGallery(true)}
          >
            <ImageIcon size={18} />
            Add Images
          </button>
          <div className="grid grid-cols-3 gap-2">
            {form.gallery.map((img, i) => (
              <img
                key={i}
                src={`${process.env.NEXT_PUBLIC_API_URL}${img}`}
                className="w-full h-20 object-cover rounded border"
              />
            ))}
          </div>
          <ImageUploadModal
            open={openGallery}
            multiple
            onClose={() => setOpenGallery(false)}
            onSelect={(urls) => setForm((p) => ({ ...p, gallery: urls }))}
          />
        </div>
      </div>

      {/* Attribute Value Image Upload Modal */}
      {attrValueImageModal && (
        <ImageUploadModal
          open={true}
          multiple={false}
          onClose={() => setAttrValueImageModal(null)}
          onSelect={(urls) => {
            updateAttributeValueImage(attrValueImageModal.attrIndex, attrValueImageModal.valueIndex, urls[0]);
            setAttrValueImageModal(null);
          }}
        />
      )}
    </form>
  );
}

/* ---------------- ATTRIBUTE VALUES COMPONENT ---------------- */

interface AttributeValuesProps {
  type: AttributeType;
  values: AttributeValue[];
  onAdd: (value: string, color?: string, image?: string) => void;
  onRemove: (index: number) => void;
  onUpdateColor: (index: number, color: string) => void;
  onUpdateImage: (index: number) => void;
}

function AttributeValues({ type, values, onAdd, onRemove, onUpdateColor, onUpdateImage }: AttributeValuesProps) {
  const [val, setVal] = useState('');
  const [color, setColor] = useState('#000000');

  const handleAdd = () => {
    if (!val.trim()) return;

    if (type === 'color') {
      onAdd(val, color, undefined);
    } else if (type === 'text') {
      onAdd(val, undefined, undefined);
    } else if (type === 'image') {
      onAdd(val, undefined, undefined);
    }

    setVal('');
    setColor('#000000');
  };

  return (
    <div className="space-y-3">
      {/* Input Area based on type */}
      <div className="flex gap-2">
        {type === 'color' && (
          <div className="flex items-center gap-2 border rounded px-2 bg-white">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <span className="text-xs text-gray-500 font-mono">{color}</span>
          </div>
        )}

        <input
          className="border p-2 flex-1 rounded"
          placeholder={
            type === 'color'
              ? 'Color name (e.g., Red)'
              : type === 'image'
              ? 'Variant name (e.g., Pattern A)'
              : 'Value (e.g., Large)'
          }
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />

        <button
          type="button"
          onClick={handleAdd}
          className="border px-4 rounded bg-white hover:bg-gray-50 font-medium"
        >
          Add
        </button>
      </div>

      {/* Values Display */}
      <div className="flex gap-2 flex-wrap">
        {values.map((v, i) => (
          <div
            key={i}
            className="border rounded flex items-center gap-2 bg-white pr-2 overflow-hidden group"
          >
            {/* Color Swatch */}
            {type === 'color' && (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 border-r relative"
                  style={{ backgroundColor: v.color || '#ccc' }}
                >
                  <input
                    type="color"
                    value={v.color || '#000000'}
                    onChange={(e) => onUpdateColor(i, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Change color"
                  />
                </div>
                <span className="text-sm">{v.value}</span>
              </div>
            )}

            {/* Image Swatch */}
            {type === 'image' && (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 border-r bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => onUpdateImage(i)}
                  title={v.image ? 'Change image' : 'Add image'}
                >
                  {v.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${v.image}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload size={14} className="text-gray-400" />
                  )}
                </div>
                <span className="text-sm">{v.value}</span>
              </div>
            )}

            {/* Text */}
            {type === 'text' && <span className="text-sm px-2">{v.value}</span>}

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-red-500 hover:text-red-700 ml-1 p-1 hover:bg-red-50 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        {type === 'color' && 'Click on the color swatch to change the color code'}
        {type === 'image' && 'Click on the image box to upload a swatch image'}
        {type === 'text' && 'Plain text values for size, material, etc.'}
      </p>
    </div>
  );
}

/* ---------------- ATTRIBUTE DISPLAY COMPONENT ---------------- */

function AttributeDisplay({ attr, value }: { attr?: Attribute; value: string }) {
  if (!attr) return <span>{value}</span>;

  const attrValue = attr.values.find((v) => v.value === value);

  if (attr.type === 'color' && attrValue?.color) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full border shadow-sm"
          style={{ backgroundColor: attrValue.color }}
          title={attrValue.color}
        />
        <span>{value}</span>
      </div>
    );
  }

  if (attr.type === 'image' && attrValue?.image) {
    return (
      <div className="flex items-center gap-2">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${attrValue.image}`}
          alt=""
          className="w-6 h-6 rounded object-cover border"
        />
        <span>{value}</span>
      </div>
    );
  }

  return <span>{value}</span>;
}

/* ---------------- UTILS ---------------- */

function cartesian(arr: string[][]): string[][] {
  return arr.reduce(
    (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
    [[]] as string[][]
  );
}