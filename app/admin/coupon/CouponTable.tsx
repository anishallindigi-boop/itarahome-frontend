'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getAllCoupons,
  deleteCoupon,
  toggleCouponStatus,
  resetCouponState,
} from '@/redux/slice/CouponSlice';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Copy,
  Calendar,
  Tag,
  Percent,
  IndianRupee,
  Truck,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import CouponForm from './CouponForm';

const COUPON_TYPE_ICONS = {
  percentage: Percent,
  fixed: IndianRupee,
  free_shipping: Truck,
};

const COUPON_TYPE_LABELS = {
  percentage: 'Percentage',
  fixed: 'Fixed Amount',
  free_shipping: 'Free Shipping',
};

export default function CouponTable() {
  const dispatch = useAppDispatch();
  const { coupons, loading, error, isDeleted, success } = useAppSelector(
    (state) => state.coupon
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | undefined>();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch coupons on mount
  useEffect(() => {
    dispatch(getAllCoupons());
  }, [dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (isDeleted) {
      toast.success('Coupon deleted successfully');
      dispatch(resetCouponState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetCouponState());
    }
  }, [isDeleted, error, dispatch]);

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      COUPON_TYPE_LABELS[coupon.type].toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || coupon.type === filterType;
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? coupon.isActive
        : !coupon.isActive;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await dispatch(deleteCoupon(id));
      dispatch(getAllCoupons());
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await dispatch(toggleCouponStatus({ id, isActive: !currentStatus }));
    dispatch(getAllCoupons());
  };

  // Handle edit
  const handleEdit = (id: string) => {
    setEditingCouponId(id);
    setShowForm(true);
  };

  // Handle create new
  const handleCreate = () => {
    setEditingCouponId(undefined);
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCouponId(undefined);
  };

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  // Check if coupon is expired
  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 mt-1">Manage discount coupons and promotions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
          <option value="free_shipping">Free Shipping</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {coupons.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {coupons.filter((c) => isExpired(c.validUntil)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Uses</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No coupons found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? 'Try different search terms' : 'Create your first coupon'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => {
                  const TypeIcon = COUPON_TYPE_ICONS[coupon.type];
                  const expired = isExpired(coupon.validUntil);

                  return (
                    <tr
                      key={coupon._id}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        !coupon.isActive && 'bg-gray-50/50'
                      )}
                    >
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Tag className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p
                              className={cn(
                                'font-mono font-semibold text-sm',
                                !coupon.isActive && 'text-gray-400'
                              )}
                            >
                              {coupon.code}
                            </p>
                            <p className="text-xs text-gray-500">
                              Min: ₹{coupon.minOrderAmount || 0}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {COUPON_TYPE_LABELS[coupon.type]}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}%`
                            : coupon.type === 'fixed'
                            ? `₹${coupon.value}`
                            : 'Free'}
                        </span>
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {coupon.usedCount || 0}
                          </span>
                          <span className="text-gray-500">
                            {' '}
                            / {coupon.maxUses || '∞'}
                          </span>
                        </div>
                        {coupon.maxUses && (
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${Math.min(
                                  ((coupon.usedCount || 0) / coupon.maxUses) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Validity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {coupon.validFrom
                              ? formatDate(coupon.validFrom)
                              : 'Always'}
                          </span>
                        </div>
                        {coupon.validUntil && (
                          <p
                            className={cn(
                              'text-xs mt-1',
                              expired ? 'text-red-500' : 'text-gray-500'
                            )}
                          >
                            Expires: {formatDate(coupon.validUntil)}
                            {expired && ' (Expired)'}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            coupon.isActive && !expired
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {coupon.isActive && !expired ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              coupon.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            )}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(coupon._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CouponForm
          couponId={editingCouponId}
          onClose={handleCloseForm}
          onSuccess={() => dispatch(getAllCoupons())}
        />
      )}
    </div>
  );
}