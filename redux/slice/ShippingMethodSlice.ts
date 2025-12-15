import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* =======================
   Types
======================= */

type CreateShippingInput = {
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
};

interface ShippingMethod {
  _id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
  message?: string;
  status?: "active" | "inactive";
}

interface ShippingState {
  shippingMethods: ShippingMethod[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
  singleShipping: ShippingMethod | null;
}

const initialState: ShippingState = {
  shippingMethods: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
  singleShipping: null,
};

/* =======================
   CREATE SHIPPING
======================= */

export const CreateShipping = createAsyncThunk(
  "shipping/create",
  async (form: CreateShippingInput, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/shipping/create`,
        form,
        {
          withCredentials: true,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

/* =======================
   GET ALL SHIPPING
======================= */

export const GetAllShipping = createAsyncThunk(
  "shipping/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/shipping/all`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

/* =======================
   GET SINGLE SHIPPING
======================= */

export const GetSingleShipping = createAsyncThunk(
  "shipping/getsingle",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/shipping/get/${id}`,
        {
          withCredentials: true,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

/* =======================
   UPDATE SHIPPING
======================= */

export const UpdateShipping = createAsyncThunk(
  "shipping/update",
  async (
    { id, form }: { id: string; form: CreateShippingInput },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/shipping/update/${id}`,
        form,
        {
          withCredentials: true,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

/* =======================
   DELETE SHIPPING
======================= */

export const DeleteShipping = createAsyncThunk(
  "shipping/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/shipping/delete/${id}`,
        {
          withCredentials: true,
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

/* =======================
   SLICE
======================= */

export const ShippingMethodSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    resetShippingState: (state) => {
      state.shippingMethods = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
      state.singleShipping = null;
    },
  },
  extraReducers(builder) {
    builder

      // CREATE
      .addCase(CreateShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        CreateShipping.fulfilled,
        (state, action: PayloadAction<ShippingMethod>) => {
          state.loading = false;
          state.success = true;
          state.message = action.payload.message as string;
          state.shippingMethods.push(action.payload);
        }
      )
      .addCase(CreateShipping.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL
      .addCase(GetAllShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        GetAllShipping.fulfilled,
        (state, action: PayloadAction<ShippingMethod[]>) => {
          state.loading = false;
          state.shippingMethods = action.payload;
        }
      )
      .addCase(GetAllShipping.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET SINGLE
      .addCase(GetSingleShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        GetSingleShipping.fulfilled,
        (state, action: PayloadAction<ShippingMethod>) => {
          state.loading = false;
          state.singleShipping = action.payload;
        }
      )
      .addCase(GetSingleShipping.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(UpdateShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        UpdateShipping.fulfilled,
        (state, action: PayloadAction<ShippingMethod>) => {
          state.loading = false;
          state.message = action.payload.message as string;
          state.isupdated = true;
        }
      )
      .addCase(UpdateShipping.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(DeleteShipping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        DeleteShipping.fulfilled,
        (state, action: PayloadAction<ShippingMethod>) => {
          state.loading = false;
          state.message = action.payload.message as string;
          state.isdeleted = true;
        }
      )
      .addCase(DeleteShipping.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetShippingState } = ShippingMethodSlice.actions;
export default ShippingMethodSlice.reducer;
