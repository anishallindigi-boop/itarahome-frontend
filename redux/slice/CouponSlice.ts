import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// -------------------------- Interfaces --------------------------
interface CouponInput {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount?: number;
  maxUses?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive?: boolean;
}

interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  applicableProducts?: { _id: string; name: string }[];
  applicableCategories?: string[];
  createdBy?: { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

interface CouponState {
  coupons: Coupon[];
  singleCoupon: Coupon | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  isUpdated: boolean;
  isDeleted: boolean;
  appliedCoupon: {
    code: string;
    type: string;
    value: number;
    discountAmount: number;
    newTotal?: number;
  } | null;
}

const initialState: CouponState = {
  coupons: [],
  singleCoupon: null,
  loading: false,
  error: null,
  message: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
  appliedCoupon: null,
};

// -------------------------- Thunks --------------------------

// CREATE COUPON
export const createCoupon = createAsyncThunk(
  'coupon/createCoupon',
  async (form: CouponInput, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/coupons/create`, form, {
        withCredentials: true,
        headers: {
          'x-api-key': API_KEY,
        },
      });
      return res.data.coupon;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error creating coupon';
      return rejectWithValue(errorMessage);
    }
  }
);

// GET ALL COUPONS
export const getAllCoupons = createAsyncThunk(
  'coupon/getAllCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/coupons/get`, {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials:true
      });
      return res.data.coupons; // assuming your API returns { success: true, coupons: [...] }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error fetching coupons';
      return rejectWithValue(errorMessage);
    }
  }
);

// GET SINGLE COUPON BY ID
export const getSingleCoupon = createAsyncThunk(
  'coupon/getSingleCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/coupons/get/${id}`, {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials:true
      });
      return res.data.coupon;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error fetching coupon';
      return rejectWithValue(errorMessage);
    }
  }
);

// UPDATE COUPON
export const updateCoupon = createAsyncThunk(
  'coupon/updateCoupon',
  async ({ id, form }: { id: string; form: Partial<CouponInput> }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/coupons/update/${id}`, form, {
        withCredentials: true,
        headers: {
          'x-api-key': API_KEY,
        },
      
      });
      return res.data.coupon;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error updating coupon';
      return rejectWithValue(errorMessage);
    }
  }
);

// DELETE COUPON (soft delete - set isActive: false)
export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/coupons/delete/${id}`, {
        withCredentials: true,
        headers: {
          'x-api-key': API_KEY,
        },
      });
      return res.data; // { success, message }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error deleting coupon';
      return rejectWithValue(errorMessage);
    }
  }
);

// TOGGLE COUPON STATUS (active/inactive)
export const toggleCouponStatus = createAsyncThunk(
  'coupon/toggleStatus',
  async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/coupons/status/${id}`,
        { isActive },
        {
          withCredentials: true,
          headers: { 'x-api-key': API_KEY },
        }
      );
      return res.data.coupon;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error updating status');
    }
  }
);

// APPLY COUPON (user-facing)
export const applyCoupon = createAsyncThunk(
  'coupon/applyCoupon',
  async ({ 
    code, 
    cartTotal, 
    shippingCost = 0 
  }: { 
    code: string; 
    cartTotal: number; 
    shippingCost?: number;
  }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/coupons/apply`,
        { 
          code, 
          cartTotal, 
          shippingCost 
        },
        {
          withCredentials: true,
          headers: { 'x-api-key': API_KEY },
        }
      );
      return res.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Invalid or expired coupon';
      return rejectWithValue(errorMessage);
    }
  }
);
// -------------------------- Slice --------------------------
export const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    resetCouponState: (state) => {
      state.coupons = [];
      state.singleCoupon = null;
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isUpdated = false;
      state.isDeleted = false;
      state.appliedCoupon = null;
    },
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.success = true;
        state.coupons.push(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL
      .addCase(getAllCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCoupons.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(getAllCoupons.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET SINGLE
      .addCase(getSingleCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.singleCoupon = action.payload;
      })
      .addCase(getSingleCoupon.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.success = true;
        state.isUpdated = true;
        const index = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
        state.singleCoupon = action.payload;
      })
      .addCase(updateCoupon.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCoupon.fulfilled, (state) => {
        state.loading = false;
        state.isDeleted = true;
        state.success = true;
        // Optionally remove from list if you want
      })
      .addCase(deleteCoupon.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // TOGGLE STATUS
      .addCase(toggleCouponStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action: PayloadAction<Coupon>) => {
        state.loading = false;
        state.success = true;
        const index = state.coupons.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(toggleCouponStatus.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // APPLY COUPON
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(applyCoupon.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.appliedCoupon = action.payload;
        state.message = 'Coupon applied successfully';
      })
      .addCase(applyCoupon.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCouponState, clearAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;