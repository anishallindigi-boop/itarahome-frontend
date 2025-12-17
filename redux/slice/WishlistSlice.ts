import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// =======================
// TYPES
// =======================
interface WishlistItem {
  _id?: string;
  product: string;
  addedAt?: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isdeleted: boolean;
}

const initialState: WishlistState = {
  wishlist: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isdeleted: false,
};

// =======================
// API CALLS
// =======================

// GET WISHLIST
export const getWishlist = createAsyncThunk(
  'wishlist/getWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      };

      const res = await axios.get(`${API_URL}/api/wishlist`, config);
      return res.data.wishlist.products || [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Cannot fetch wishlist'
      );
    }
  }
);

// ADD TO WISHLIST
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ productId }: { productId: string }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      };

      const res = await axios.post(
        `${API_URL}/api/wishlist/add`,
        { productId },
        config
      );

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Cannot add to wishlist'
      );
    }
  }
);

// REMOVE FROM WISHLIST
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'x-api-key': API_KEY },
        withCredentials: true,
      };

      await axios.delete(
        `${API_URL}/api/wishlist/remove/${productId}`,
        config
      );

      return productId; // ✅ ONLY return productId
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Cannot remove wishlist item'
      );
    }
  }
);

// CLEAR WISHLIST
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      };

      const res = await axios.delete(
        `${API_URL}/api/wishlist/clear`,
        config
      );

      return [];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Cannot clear wishlist'
      );
    }
  }
);

// =======================
// SLICE
// =======================
export const WishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isdeleted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(getWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(getWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ADD
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.wishlist.products;
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // REMOVE
      .addCase(removeFromWishlist.pending, (state) => {
        state.isdeleted = false;
      })
    .addCase(removeFromWishlist.fulfilled, (state, action) => {
  const productId = action.payload;

  state.wishlist = state.wishlist.filter(
    (item: any) => item.product._id !== productId
  );

  state.isdeleted = true;
})

      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isdeleted = false;
      })

      // CLEAR
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.wishlist = [];
        state.loading = false;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetWishlistState } = WishlistSlice.actions;
export default WishlistSlice.reducer;
