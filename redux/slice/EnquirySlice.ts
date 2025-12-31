import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ================= TYPES ================= */

export interface EnquiryInput {
  fullName: string;
  phone: string;
  email: string;
  eventType?: string;
  quantity?: number | string;
  requiredBy?: string;
  products?: string;
  customisation?: string;
  message?: string;
}

export interface Enquiry {
  _id?: string;
  fullName: string;
  phone: string;
  email: string;
  eventType?: string;
  quantity?: number;
  requiredBy?: string;
  products?: string;
  customisation?: string;
  message?: string;
  createdAt?: string;
}

interface EnquiryState {
  enquiries: Enquiry[];
  singleEnquiry: Enquiry | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  isDeleted: boolean;
}

/* ================= INITIAL STATE ================= */

const initialState: EnquiryState = {
  enquiries: [],
  singleEnquiry: null,
  loading: false,
  error: null,
  success: false,
  message: null,
  isDeleted: false,
};

/* ================= THUNKS ================= */

/* CREATE ENQUIRY */
export const createEnquiry = createAsyncThunk<
  any,
  EnquiryInput,
  { rejectValue: string }
>('enquiry/create', async (form, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/enquiry/create`,
      form,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to submit enquiry'
    );
  }
});

/* GET ALL ENQUIRIES (ADMIN) */
export const getAllEnquiries = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>('enquiry/getAll', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/enquiry/get-all`,
      {
        headers: {
          'x-api-key': API_KEY,
        },withCredentials:true
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch enquiries'
    );
  }
});

/* GET SINGLE ENQUIRY */
export const getSingleEnquiry = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>('enquiry/getSingle', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/enquiry/${id}`,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch enquiry'
    );
  }
});

/* DELETE ENQUIRY */
export const deleteEnquiry = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>('enquiry/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.delete(
      `${API_URL}/api/enquiry/${id}`,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to delete enquiry'
    );
  }
});

/* ================= SLICE ================= */

export const EnquirySlice = createSlice({
  name: 'enquiry',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.isDeleted = false;
      state.singleEnquiry = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(createEnquiry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnquiry.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* GET ALL */
      .addCase(getAllEnquiries.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllEnquiries.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.enquiries = action.payload.enquiries;
      })
      .addCase(getAllEnquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* GET SINGLE */
      .addCase(getSingleEnquiry.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleEnquiry.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.singleEnquiry = action.payload.enquiry;
      })
      .addCase(getSingleEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* DELETE */
      .addCase(deleteEnquiry.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEnquiry.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isDeleted = true;
        state.message = action.payload.message;
      })
      .addCase(deleteEnquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetState } = EnquirySlice.actions;
export default EnquirySlice.reducer;
