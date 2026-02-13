import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";

const API_URL=process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* =====================
   Types
===================== */
export interface SeoData {
  _id?: string;
  slug: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

interface SeoState {
  seoList: SeoData[];
  seo: SeoData | null;
  loading: boolean;
  error: string | null;
}

/* =====================
   Initial State
===================== */
const initialState: SeoState = {
  seoList: [],
  seo: null,
  loading: false,
  error: null,
};

/* =====================
   Async Thunks
===================== */

// CREATE / UPDATE SEO (upsert style)
export const createSeo = createAsyncThunk(
  "seo/create",
  async (data: SeoData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_URL}/api/seo/create`, data,{
        headers:{
          'x-api-key':API_KEY
        },withCredentials:true
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to save SEO");
    }
  }
);

// GET ALL SEO (Admin)
export const getAllSeo = createAsyncThunk(
  "seo/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/seo/getAll`,{
        headers:{
          'x-api-key':API_KEY
        },withCredentials:true
      });
      // console.log(res.data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch SEO");
    }
  }
);

// GET SEO BY SLUG (Public)
export const getSeoBySlug = createAsyncThunk(
  "seo/getBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/seo/get/${slug}`,{
        headers:{
          'x-api-key':API_KEY
        },withCredentials:true
      });
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "SEO not found");
    }
  }
);

// UPDATE SEO
export const updateSeo = createAsyncThunk(
  "seo/update",
  async ({ id, data }: { id: string; data: SeoData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}/api/seo/update/${id}`, data,{
        headers:{
          'x-api-key':API_KEY
        },withCredentials:true
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// DELETE SEO
export const deleteSeo = createAsyncThunk(
  "seo/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api/seo/delete/${id}`,{
        headers:{
          'x-api-key':API_KEY
        },withCredentials:true
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

/* =====================
   Slice
===================== */
const SeoSlice = createSlice({
  name: "seo",
  initialState,
  reducers:{
    resetState: (state) => {
      state.seoList = [];
      state.loading = false;
      state.error = null;

    }
  },
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createSeo.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSeo.fulfilled, (state, action) => {
        state.loading = false;
        state.seo = action.payload;
      })
      .addCase(createSeo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // GET ALL
      .addCase(getAllSeo.fulfilled, (state, action) => {
        state.seoList = action.payload;
      })

      // GET BY SLUG
      .addCase(getSeoBySlug.fulfilled, (state, action) => {
        state.seo = action.payload;
      })

      // UPDATE
      .addCase(updateSeo.fulfilled, (state, action) => {
        state.seo = action.payload;
        state.seoList = state.seoList.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })

      // DELETE
      .addCase(deleteSeo.fulfilled, (state, action) => {
        state.seoList = state.seoList.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});



export const { resetState } = SeoSlice.actions;
export default SeoSlice.reducer;

