import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET!;

// ----------------- TYPES -----------------
export type Variation = {
  _id?: string;
  productId: string;
  sku: string;
  regularPrice: number;
  sellingPrice: number;
  stock: number;
  attributes: Record<string, string>;

};

export interface VariationState {
  variation: Variation[];
  singleProduct: Variation | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
}

// ----------------- INITIAL STATE -----------------
const initialState: VariationState = {
  variation: [],
  singleProduct: null,
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
};

// ----------------- HEADERS -----------------
const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
withCredentials: true,
};

// ----------------- THUNKS -----------------

// CREATE
export const createVariation = createAsyncThunk<
  Variation,
  Variation
>("variation/create", async (data, { rejectWithValue }) => {
  try {


    console.log(data,"slice")
    const config = {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      };

    const res = await axios.post(
      `${API_URL}/api/productvariation/create`,
      data,config
    );
    return res.data.variation;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Create failed");
  }
});

// FETCH by product
export const fetchVariations = createAsyncThunk<
  Variation[],
  string
>("variation/fetch", async (productId, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/productvariation/product/${productId}`,
      { headers }
    );
    return res.data.variations;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fetch failed");
  }
});

// FETCH one
export const fetchVariationById = createAsyncThunk<
  Variation,
  string
>("variation/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/productvariation/${id}`,
      { headers }
    );
    return res.data.variation;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fetch failed");
  }
});

// UPDATE
export const updateVariation = createAsyncThunk<
  Variation,
  { id: string; data: Partial<Variation> }
>("productvariation/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/variation/${id}`,
      data,
      { headers }
    );
    return res.data.variation;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

// DELETE
export const deleteVariation = createAsyncThunk<
  string,
  string
>("productvariation/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(
      `${API_URL}/variation/${id}`,
      { headers }
    );
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Delete failed");
  }
});

// ----------------- SLICE -----------------
const variationSlice = createSlice({
  name: "variation",
  initialState,
  reducers: {
    resetFlags: (state) => {
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
      // CREATE
      .addCase(createVariation.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVariation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Variation created";
        state.variation.push(action.payload);
      })
      .addCase(createVariation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH ALL
      .addCase(fetchVariations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVariations.fulfilled, (state, action) => {
        state.loading = false;
        state.variation = action.payload;
      })
      .addCase(fetchVariations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH ONE
      .addCase(fetchVariationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVariationById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleProduct = action.payload;
      })
      .addCase(fetchVariationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // UPDATE
      .addCase(updateVariation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVariation.fulfilled, (state, action) => {
        state.loading = false;
        state.isupdated = true;
        state.message = "Variation updated";

        const idx = state.variation.findIndex(
          (v) => v._id === action.payload._id
        );
        if (idx !== -1) state.variation[idx] = action.payload;
      })
      .addCase(updateVariation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // DELETE
      .addCase(deleteVariation.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteVariation.fulfilled, (state, action) => {
        state.loading = false;
        state.isdeleted = true;
        state.message = "Variation deleted";
        state.variation = state.variation.filter(
          (v) => v._id !== action.payload
        );
      })
      .addCase(deleteVariation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetFlags } = variationSlice.actions;

export default variationSlice.reducer;
