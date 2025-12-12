import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// TYPES
interface CartItem {
  _id?: string;
  productId: string;
  quantity: number;
  message?: string;
}

interface CartItemState {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
}

const initialState: CartItemState = {
  cart: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
};

// =====================================================================================
// API CALLS
// =====================================================================================

// GET USER CART
export const getCartItems = createAsyncThunk(
  "cart/getCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          // "Content-Type": "multipart/form-data",
          "x-api-key": API_KEY,
        },
        withCredentials: true, // important for reading user session
      };

      const res = await axios.get(`${API_URL}/api/cart/get`, config);

      

      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Cannot fetch cart"
      );
    }
  }
);


// ADD TO CART
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, quantity }: { productId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {

          const config = {
      headers: {
        // 'Content-Type': 'multipart/form-data',
        'x-api-key':API_KEY
      },
      withCredentials: true,
    };
      const res = await axios.post(`${API_URL}/api/cart/add`, {
  
        productId,
        quantity,
      },config);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Cannot add to cart");
    }
  }
);

// UPDATE QUANTITY  (returns full cart[])
export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ cartId, quantity }: { cartId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'x-api-key': API_KEY },
        withCredentials: true,
      };
      const { data } = await axios.put(
        `${API_URL}/api/cart/update/${cartId}`,
        { quantity },
        config
      );
      return data; // <-- controller must return fresh cart[]
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

// REMOVE SINGLE ITEM  (returns full cart[])
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'x-api-key': API_KEY },
        withCredentials: true,
      };
      const { data } = await axios.delete(
        `${API_URL}/api/cart/remove/${cartItemId}`,
        config
      );
      return data; // <-- controller must return fresh cart[]
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Remove failed');
    }
  }
);

// CLEAR ENTIRE CART  (returns empty array [])
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'x-api-key': API_KEY },
        withCredentials: true,
      };
      // hit the endpoint you already created
      const { data } = await axios.delete(`${API_URL}/api/cart/clear`, config);
      return data; // <-- should be []
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Clear failed');
    }
  }
);
// =====================================================================================
// SLICE
// =====================================================================================

export const CartItemSlice = createSlice({
  name: "CartItem",
  initialState,
  reducers: {
    resetState: (state) => {
      state.cart = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // GET CART ITEMS
      .addCase(getCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload || [];
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ADD TO CART
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.items;
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* =====  NEW: UPDATE / REMOVE / CLEAR  ===== */
    .addCase(updateCartQuantity.pending, (s) => {
      s.isupdated = false;
    })
    .addCase(updateCartQuantity.fulfilled, (s, a) => {
      s.cart = a.payload; // full fresh cart[]
      s.isupdated = true;
    })
    .addCase(updateCartQuantity.rejected, (s, a) => {
      s.error = a.payload as string;
      s.isupdated = false;
    })

    .addCase(removeCartItem.pending, (s) => {
      s.isdeleted = false;
    })
    .addCase(removeCartItem.fulfilled, (s, a) => {
      s.cart = a.payload; // full fresh cart[]
      s.isdeleted = true;
    })
    .addCase(removeCartItem.rejected, (s, a) => {
      s.error = a.payload as string;
      s.isdeleted = false;
    })

    .addCase(clearCart.pending, (s) => {
      s.loading = true;
    })
    .addCase(clearCart.fulfilled, (s, a) => {
      s.cart = a.payload; // should be []
      s.loading = false;
    })
    .addCase(clearCart.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload as string;
    });
  },
});

export const { resetState } = CartItemSlice.actions;
export default CartItemSlice.reducer;
