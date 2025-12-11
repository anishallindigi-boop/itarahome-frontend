'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createVariation } from '@/redux/slice/VariationSlice';
import type { RootState } from '@/redux/store';

type Props = {
  productId?: string | null;
  onClose: () => void;
};

// Better typing for product attributes (supports common formats)
type ProductAttribute =
  | { name: string; values: string[] }
  | { name: string; values: { value: string; label?: string }[] };

type VariationLocal = {
  attributes: Record<string, string>;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  image: string;
};

export default function VariationForm({ productId, onClose }: Props) {
  const dispatch = useAppDispatch();
  const product = useAppSelector((state: RootState) => state.product.singleProduct);

  const [variations, setVariations] = useState<VariationLocal[]>([]);

  // Pre-fill one empty variation when product with attributes loads
  useEffect(() => {
    if (!product?.attributes || variations.length > 0) return;

    const attributes = product.attributes as ProductAttribute[] | undefined;

    if (Array.isArray(attributes) && attributes.length > 0) {
      const template: VariationLocal = {
        attributes: Object.fromEntries(attributes.map(attr => [attr.name, ''])),
        sku: '',
        regularPrice: '',
        salePrice: '',
        stock: '',
        image: '',
      };
      setVariations([template]);
    }
  }, [product, variations.length]); // Fixed: added missing dependency

  const addVariation = () => {
    const attributes = product?.attributes as ProductAttribute[] | undefined;
    const attrMap = Array.isArray(attributes)
      ? Object.fromEntries(attributes.map(attr => [attr.name, '']))
      : {};

    setVariations(prev => [
      ...prev,
      {
        attributes: attrMap,
        sku: '',
        regularPrice: '',
        salePrice: '',
        stock: '',
        image: '',
      },
    ]);
  };

  const updateVariation = (index: number, field: keyof VariationLocal, value: string) => {
    {
    setVariations(prev =>
      prev.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      )
    );
  };

  const updateAttribute = (index: number, attrName: string, value: string) => {
    setVariations(prev =>
      prev.map((v, i) =>
        i === index
          ? { ...v, attributes: { ...v.attributes, [attrName]: value } }
          : v
      )
    );
  };

  const removeVariation = (index: number) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
  };

  const saveVariations = async () => {
    if (!productId) {
      alert('Product ID is missing. Please select a product first.');
      return;
    }

    if (variations.length === 0) {
      alert('Add at least one variation.');
      return;
    }

    try {
      for (const v of variations) {
        const payload = {
          productId,
          sku: v.sku.trim() || `${productId}-var-${Date.now()}`,
          regularPrice: Number(v.regularPrice) || 0,
          sellingPrice: Number(v.salePrice) || Number(v.regularPrice) || 0,
          stock: Number(v.stock) || 0,
          attributes: v.attributes,
          image: v.image || '',
        };

        // Safe dispatch — createVariation should be properly typed in your slice
        await dispatch(createVariation(payload)).unwrap();
      }

      alert('All variations saved successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to save variations:', err);
      alert('Error saving variations. Check console for details.');
    }
  };

  const attributes = (product?.attributes || []) as ProductAttribute[];

  return (
    <div className="p-6 space-y-6 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          Variations for: {product?.name || 'Loading...'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {variations.length === 0 && attributes.length > 0 && (
        <p className="text-sm text-gray-600">Click "Add Variation" to create one.</p>
      )}

      {variations.map((variation, i) => (
        <div key={i} className="border border-gray-300 rounded-lg p-5 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Variation #{i + 1}</h3>
            <button
              type="button"
              onClick={() => removeVariation(i)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          {/* Attributes Dropdowns */}
          {attributes.map((attr: ProductAttribute) => (
            <div key={attr.name} className="flex items-center gap-3">
              <label className="w-32 text-sm font-medium">{attr.name}:</label>
              <select
                value={variation.attributes[attr.name] || ''}
                onChange={(e) => updateAttribute(i, attr.name, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select {attr.name} —</option>
                {attr.values.map((val: any) => {
                  const value = typeof val === 'object' ? val.value ?? val : val;
                  const label = typeof val === 'object' ? val.label ?? val.value ?? val : val;
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="SKU (e.g., PROD-BLUE-L)"
              value={variation.sku}
              onChange={(e) => updateVariation(i, 'sku', e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            <input
              type="number"
              placeholder="Regular Price"
              value={variation.regularPrice}
              onChange={(e) => updateVariation(i, 'regularPrice', e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            <input
              type="number"
              placeholder="Sale Price (optional)"
              value={variation.salePrice}
              onChange={(e) => updateVariation(i, 'salePrice', e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={variation.stock}
              onChange={(e) => updateVariation(i, 'stock', e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          <input
            placeholder="Image URL (optional)"
            value={variation.image}
            onChange={(e) => updateVariation(i, 'image', e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="button"
          onClick={addVariation}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Add Another Variation
        </button>

        <button
          type="button"
          onClick={saveVariations}
          disabled={variations.length === 0}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          Save All Variations
        </button>

        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 border border-gray-400 rounded-lg hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}