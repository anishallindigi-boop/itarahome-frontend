'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  createCoupon,
  updateCoupon,
  getSingleCoupon,
  resetCouponState,
} from '@/redux/slice/CouponSlice';
import { getProducts } from '@/redux/slice/ProductSlice';
import { GetProductCategory } from '@/redux/slice/ProductCategorySlice';
import { toast } from 'sonner';
import { X, Calendar, Percent, IndianRupee, Truck, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CouponFormProps {
  couponId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const COUPON_TYPES = [
  { value: 'percentage', label: 'Percentage Discount', icon: Percent },
  { value: 'fixed', label: 'Fixed Amount', icon: IndianRupee },
  { value: 'free_shipping', label: 'Free Shipping', icon: Truck },
];

export default function CouponForm({ couponId, onClose, onSuccess }: CouponFormProps) {
  const dispatch = useAppDispatch();
  const { singleCoupon, loading, success, error, isUpdated } = useAppSelector(
    (state) => state.coupon
  );
  const { products } = useAppSelector((state) => state.product);
  const { categories } = useAppSelector((state) => state.productcategory);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
    isActive: true,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load coupon data for edit
  useEffect(() => {
    if (couponId) {
      dispatch(getSingleCoupon(couponId));
    }
    dispatch(getProducts());
    dispatch(GetProductCategory());

    return () => {
      dispatch(resetCouponState());
    };
  }, [couponId, dispatch]);

  // Populate form when editing
  useEffect(() => {
    if (couponId && singleCoupon) {
      setFormData({
        code: singleCoupon.code,
        type: singleCoupon.type,
        value: singleCoupon.value.toString(),
        minOrderAmount: singleCoupon.minOrderAmount?.toString() || '',
        maxUses: singleCoupon.maxUses?.toString() || '',
        validFrom: singleCoupon.validFrom
          ? new Date(singleCoupon.validFrom).toISOString().split('T')[0]
          : '',
        validUntil: singleCoupon.validUntil
          ? new Date(singleCoupon.validUntil).toISOString().split('T')[0]
          : '',
        applicableProducts: singleCoupon.applicableProducts?.map((p: any) =>
          typeof p === 'string' ? p : p._id
        ) || [],
        applicableCategories: singleCoupon.applicableCategories || [],
        isActive: singleCoupon.isActive,
      });
    }
  }, [singleCoupon, couponId]);

  // Handle success/error
  useEffect(() => {
    if (success) {
      toast.success(couponId ? 'Coupon updated successfully!' : 'Coupon created successfully!');
      dispatch(resetCouponState());
      onSuccess?.();
      onClose();
    }
    if (error) {
      toast.error(error);
      dispatch(resetCouponState());
    }
  }, [success, error, couponId, onClose, onSuccess, dispatch]);

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    }

    if (formData.type !== 'free_shipping' && !formData.value) {
      newErrors.value = 'Value is required';
    } else if (formData.type === 'percentage' && Number(formData.value) > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (formData.validFrom && formData.validUntil) {
      if (new Date(formData.validFrom) > new Date(formData.validUntil)) {
        newErrors.validUntil = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle multi-select for products
  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter((id) => id !== productId)
        : [...prev.applicableProducts, productId],
    }));
  };

  // Handle multi-select for categories
  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(categoryId)
        ? prev.applicableCategories.filter((id) => id !== categoryId)
        : [...prev.applicableCategories, categoryId],
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      ...formData,
      value: formData.type === 'free_shipping' ? 0 : Number(formData.value),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxUses: formData.maxUses ? Number(formData.maxUses) : null,
      validFrom: formData.validFrom || null,
      validUntil: formData.validUntil || null,
    };

    if (couponId) {
      await dispatch(updateCoupon({ id: couponId, form: payload }));
    } else {
      await dispatch(createCoupon(payload));
    }
  };

  // Generate random code
  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData((prev) => ({ ...prev, code }));
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              {couponId ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Code & Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Coupon Code *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., SUMMER2024"
                  className={cn(
                    'flex-1 px-4 py-2.5 border rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.code ? 'border-red-500' : 'border-gray-200'
                  )}
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="px-3 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
              {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
            </div>

            {/* Coupon Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COUPON_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, type: type.value as any }));
                        if (type.value === 'free_shipping') {
                          setFormData((prev) => ({ ...prev, value: '0' }));
                        }
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all',
                        formData.type === type.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Value & Limits Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {formData.type === 'percentage'
                  ? 'Discount %'
                  : formData.type === 'fixed'
                  ? 'Amount (₹)'
                  : 'Value'}
                {formData.type !== 'free_shipping' && ' *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  disabled={formData.type === 'free_shipping'}
                  placeholder={formData.type === 'percentage' ? '20' : '500'}
                  className={cn(
                    'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.value ? 'border-red-500' : 'border-gray-200',
                    formData.type === 'free_shipping' && 'bg-gray-100 text-gray-400'
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {formData.type === 'percentage' ? '%' : formData.type === 'fixed' ? '₹' : ''}
                </span>
              </div>
              {errors.value && <p className="mt-1 text-xs text-red-500">{errors.value}</p>}
            </div>

            {/* Min Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Min Order (₹)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Uses
              </label>
              <input
                type="number"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                placeholder="Unlimited"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Validity Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valid From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valid Until
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20',
                    errors.validUntil ? 'border-red-500' : 'border-gray-200'
                  )}
                />
              </div>
              {errors.validUntil && (
                <p className="mt-1 text-xs text-red-500">{errors.validUntil}</p>
              )}
            </div>
          </div>

          {/* Applicable Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Products (Optional)
            </label>
            <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No products available</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product: any) => (
                    <label
                      key={product._id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableProducts.includes(product._id)}
                        onChange={() => handleProductToggle(product._id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">₹{product.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.applicableProducts.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {formData.applicableProducts.length} product(s) selected
              </p>
            )}
          </div>

          {/* Applicable Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Categories (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => handleCategoryToggle(category._id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    formData.applicableCategories.includes(category._id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div>
              <p className="font-medium text-gray-900">Active</p>
              <p className="text-sm text-gray-500">Coupon is available for use</p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {couponId ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}