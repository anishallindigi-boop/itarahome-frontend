"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  CreateProduct,
} from "@/redux/slice/ProductSlice";

import { GetProductCategory } from "@/redux/slice/ProductCategorySlice";
import { createVariation } from "@/redux/slice/VariationSlice";
import { RootState } from "@/redux/store";

import Editor from "@/lib/Editor";
import { Content } from "next/font/google";

type AttributeValue = { value: string };
type Attribute = { name: string; values: AttributeValue[] };
type Variation = {
  attributes: Record<string, string>;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
image: File | null; 
};

export default function AddProduct() {
  const dispatch = useAppDispatch();

  const { Productcategories } = useAppSelector(
    (state: RootState) => state.productcategory
  );

  // ---------------------------------------------------
  // ONE STATE FOR ENTIRE FORM
  // ---------------------------------------------------
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content:"",
    price: "",
    discountPrice: "",
    stock: "",
    category: "",
    mainImage: null as File | null,
    gallery: [] as File[],
  });

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [productId, setProductId] = useState<string | null>(null);

  // ----------------------------------------
  // INPUT HANDLER FOR ALL FIELDS
  // ----------------------------------------
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ---------------------------------------------------
  // ADD ATTRIBUTE
  // ---------------------------------------------------
  const addAttribute = () => {
    setAttributes((prev) => [...prev, { name: "", values: [] }]);
  };

  const updateAttrName = (i: number, value: string) => {
    const copy = [...attributes];
    copy[i].name = value;
    setAttributes(copy);
  };

  const updateAttrValues = (i: number, value: string) => {
    const copy = [...attributes];
    copy[i].values = value
      .split(",")
      .map((v) => ({ value: v.trim() }))
      .filter((v) => v.value !== "");
    setAttributes(copy);
  };

  const removeAttribute = (i: number) => {
    setAttributes(attributes.filter((_, idx) => idx !== i));
  };

  // ---------------------------------------------------
  // CREATE PRODUCT API
  // ---------------------------------------------------
const createProduct = async () => {
  const fd = new FormData();

  Object.entries(formData).forEach(([key, val]) => {
    if (key === 'gallery' && Array.isArray(val)) {
      val.forEach((file) => fd.append('gallery', file));
    } else if (key === 'mainImage' && val instanceof File) {
      fd.append('mainImage', val);
    } else if (key === 'attributes') {
      fd.append('attributes', JSON.stringify(val));
    } else if (typeof val === 'string') {
      fd.append(key, val);
    }
  });

  // optional – if you want to send variations immediately
  // fd.append('variations', JSON.stringify(variations));

  const res = await dispatch(CreateProduct(fd));
  if (res.payload?.product?._id) setProductId(res.payload.product._id);
};

  // ---------------------------------------------------
  // VARIATIONS
  // ---------------------------------------------------
  const addVariation = () => {
    const attrObj: Record<string, string> = {};
    attributes.forEach((a) => (attrObj[a.name] = ""));

    setVariations((prev) => [
      ...prev,
      {
        attributes: attrObj,
        sku: "",
        regularPrice: "",
        salePrice: "",
        stock: "",
        image: null
      },
    ]);
  };

  const updateVar = (i: number, key: string, value: string) => {
    const copy = [...variations];
    copy[i][key] = value;
    setVariations(copy);
  };

  const updateVarAttr = (i: number, attr: string, value: string) => {
    const copy = [...variations];
    copy[i].attributes[attr] = value;
    setVariations(copy);
  };

  const saveVariations = async () => {
    if (!productId) return alert("Save product first!");

    for (const v of variations) {
      await dispatch(
        createVariation({
          productId,
          sku: v.sku,
          regularPrice: Number(v.regularPrice),
          sellingPrice: Number(v.salePrice),
          stock: Number(v.stock),
          attributes: v.attributes,
          image: v.image,
        })
      );
    }

    alert("Variations Saved!");
  };

  useEffect(() => {
    dispatch(GetProductCategory());
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Create Product</h1>

      {/* BASIC FIELDS */}
      <input
        className="border p-2 w-full"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />


 <textarea
          className="border p-2 w-full"
          placeholder="description"
          value={formData.description}
          onChange={e => handleChange("description", e.target.value)}
        />

      {/* EDITOR FIELD - One useState */}
      <Editor
        formData={formData}
        setFormData={setFormData}
      />

      <input
        className="border p-2 w-full"
        placeholder="Price"
        value={formData.price}
        type="number"
        onChange={(e) => handleChange("price", e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Discount Price"
        value={formData.discountPrice}
        type="number"
        onChange={(e) => handleChange("discountPrice", e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Stock"
        value={formData.stock}
        type="number"
        onChange={(e) => handleChange("stock", e.target.value)}
      />

      {/* CATEGORY */}
      <select
        className="border p-2 w-full"
        value={formData.category}
        onChange={(e) => handleChange("category", e.target.value)}
      >
        <option value="">Select category</option>
        {Productcategories?.map((cat: any) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* IMAGES */}
      <label>Main Image</label>
      <input
        type="file"
        onChange={(e) =>
          handleChange(
            "mainImage",
            e.target.files?.[0] ?? null
          )
        }
      />

      <label>Gallery</label>
      <input
        type="file"
        multiple
        onChange={(e) =>
          handleChange("gallery", Array.from(e.target.files || []))
        }
      />

      {/* ATTRIBUTES */}
      <h2 className="text-xl font-semibold">Attributes</h2>

      {attributes.map((a, i) => (
        <div key={i} className="border p-4 my-2 space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Attribute Name"
            value={a.name}
            onChange={(e) => updateAttrName(i, e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Values: Red, Blue"
            onChange={(e) => updateAttrValues(i, e.target.value)}
          />

          <button
            className="text-red-500"
            onClick={() => removeAttribute(i)}
          >
            Remove
          </button>
        </div>
      ))}

      <button onClick={addAttribute} className="bg-gray-200 px-4 py-2 rounded">
        + Add Attribute
      </button>

      {/* SAVE PRODUCT */}
      {!productId && (
        <button
          onClick={createProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Product
        </button>
      )}

      {/* VARIATIONS */}
      {productId && (
        <>
          <h2 className="text-xl font-semibold">Variations</h2>

          {variations.map((v, i) => (
            <div key={i} className="border p-4 my-2 space-y-3">
              {attributes.map((attr) => (
                <div key={attr.name}>
                  <label>{attr.name}</label>
                  <select
                    className="border p-1"
                    value={v.attributes[attr.name]}
                    onChange={(e) =>
                      updateVarAttr(i, attr.name, e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {attr.values.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <input
                className="border p-2 w-full"
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVar(i, "sku", e.target.value)}
              />

              <input
                className="border p-2 w-full"
                placeholder="Regular Price"
                type="number"
                value={v.regularPrice}
                onChange={(e) => updateVar(i, "regularPrice", e.target.value)}
              />

              <input
                className="border p-2 w-full"
                placeholder="Sale Price"
                type="number"
                value={v.salePrice}
                onChange={(e) => updateVar(i, "salePrice", e.target.value)}
              />

              <input
                className="border p-2 w-full"
                placeholder="Stock"
                type="number"
                value={v.stock}
                onChange={(e) => updateVar(i, "stock", e.target.value)}
              />

              <input
              type="file"
                className="border p-2 w-full"
                placeholder="Image URL"
                value={v.image}
                onChange={(e) => updateVar(i, "image", e.target.value)}
              />
            </div>
          ))}

          <button onClick={addVariation} className="bg-gray-200 px-4 py-2 rounded">
            + Add Variation
          </button>

          <button
            onClick={saveVariations}
            className="px-4 py-2 bg-green-600 text-white rounded mt-4"
          >
            Save Variations
          </button>
        </>
      )}
    </div>
  );
}
