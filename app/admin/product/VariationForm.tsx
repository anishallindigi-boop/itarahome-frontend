'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createVariation } from '@/redux/slice/VariationSlice';
import { GetProductCategory } from '@/redux/slice/ProductCategorySlice';
import type { RootState } from '@/redux/store';

type Props = {
  productId?: string | null;
  onClose: () => void;
};

type VariationLocal = {
  attributes: Record<string, string>;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  image: string; // either URL or filename
};

export default function VariationForm({ productId, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { product: productState } = useAppSelector((s: RootState) => ({ product: s.product }));
  const product = useAppSelector((s: RootState) => s.product.singleProduct);

  const [variations, setVariations] = useState<VariationLocal[]>([]);

  useEffect(() => {
    // if product has attributes, prefill attributes keys for a new variation
    if (product?.attributes) {
      // attributes stored as [{name, values:[]}] or similar depending on your slice
      const attrKeys: string[] = Array.isArray(product.attributes) ? product.attributes.map((a: any) => a.name) : Object.keys(product.attributes || {});
      if (attrKeys.length && variations.length === 0) {
        const template: VariationLocal = { attributes: {}, sku: '', regularPrice: '', salePrice: '', stock: '', image: '' };
        attrKeys.forEach(k => (template.attributes[k] = ''));
        setVariations([template]);
      }
    }
  }, [product]);

  const addVariation = () => {
    const attrs: Record<string, string> = {};
    if (product?.attributes && Array.isArray(product.attributes)) {
      product.attributes.forEach((a: any) => (attrs[a.name] = ''));
    }
    setVariations(prev => [...prev, { attributes: attrs, sku: '', regularPrice: '', salePrice: '', stock: '', image: '' }]);
  };

  const updateVar = (i: number, key: keyof VariationLocal, val: string) => {
    const copy = [...variations];
    // @ts-ignore
    copy[i][key] = val;
    setVariations(copy);
  };

  const updateVarAttr = (i: number, attr: string, val: string) => {
    const copy = [...variations];
    copy[i].attributes = { ...copy[i].attributes, [attr]: val };
    setVariations(copy);
  };

  const removeVariation = (i: number) => setVariations(prev => prev.filter((_, idx) => idx !== i));

  const saveVariations = async () => {
    if (!productId) {
      alert('Please select a product first');
      return;
    }

    try {
      for (const v of variations) {
        const payload = {
          productId,
          sku: v.sku,
          regularPrice: Number(v.regularPrice || 0),
          sellingPrice: Number(v.salePrice || 0),
          stock: Number(v.stock || 0),
          attributes: v.attributes,
          image: v.image,
        };
        // dispatch each create
        // createVariation is a thunk; await it to ensure ordering
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await dispatch(createVariation(payload));
      }
      alert('Variations saved');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving variations');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Create Variations for: {product?.name || productId}</h2>
        <div />
      </div>

      {variations.map((v, i) => (
        <div key={i} className="border p-4 my-2 space-y-2">
          <h3 className="font-medium">Variation #{i + 1}</h3>

          {product?.attributes && Array.isArray(product.attributes) && product.attributes.map((a: any) => (
            <div key={a.name} className="flex items-center gap-2">
              <label className="w-32">{a.name}:</label>
              <select value={v.attributes[a.name] || ''} onChange={(e) => updateVarAttr(i, a.name, e.target.value)} className="flex-1 border p-1 rounded">
                <option value="">Select</option>
                {Array.isArray(a.values) && a.values.map((val: any) => <option key={val.value || val} value={val.value || val}>{val.value || val}</option>)}
              </select>
            </div>
          ))}

          <input placeholder="SKU" value={v.sku} onChange={(e) => updateVar(i, 'sku', e.target.value)} className="w-full border p-2" />
          <input placeholder="Regular Price" type="number" value={v.regularPrice} onChange={(e) => updateVar(i, 'regularPrice', e.target.value)} className="w-full border p-2" />
          <input placeholder="Sale Price" type="number" value={v.salePrice} onChange={(e) => updateVar(i, 'salePrice', e.target.value)} className="w-full border p-2" />
          <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVar(i, 'stock', e.target.value)} className="w-full border p-2" />
          <input placeholder="Image URL" value={v.image} onChange={(e) => updateVar(i, 'image', e.target.value)} className="w-full border p-2" />

          <div className="flex justify-end">
            <button type="button" className="text-red-600" onClick={() => removeVariation(i)}>Remove</button>
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button type="button" onClick={addVariation} className="px-3 py-2 bg-gray-200 rounded">+ Add Variation</button>
        <button type="button" onClick={saveVariations} className="px-3 py-2 bg-green-600 text-white rounded">Save Variations</button>
        <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Close</button>
      </div>
    </div>
  );
}