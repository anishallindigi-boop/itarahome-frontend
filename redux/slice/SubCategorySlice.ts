import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ===================== TYPES ===================== */

export interface SubCategoryInput {
  name: string;
  slug: string;
  category: string; // Category ObjectId
  description?: string;
  image?: string;
  metatitle?: string;
  metadescription?: string;
  metakeywords?: string;
  isActive: boolean;
  status: 'draft' | 'publish';
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: any;
  description?: string;
  image?: string;
  metatitle?: string;
  metadescription?: string;
  metakeywords?: string;
  isActive: boolean;
  status: 'draft' | 'publish';
  createdAt?: string;
  message?: string;
}

interface SubCategoryState {
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
  singleSubCategory: SubCategory | null;
}

/* ===================== INITIAL STATE ===================== */

const initialState: SubCategoryState = {
  subCategories: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
  singleSubCategory: null,
};

/* ===================== API CONFIG ===================== */

const jsonConfig = {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
  withCredentials: true,
};

/* ===================== CREATE ===================== */

export const CreateSubCategory = createAsyncThunk(
  'subcategory/create',
  async (data: SubCategoryInput, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/subcategory/create`,
        data,
        jsonConfig
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'SubCategory creation failed'
      );
    }
  }
);

/* ===================== GET ALL ===================== */

export const GetSubCategories = createAsyncThunk(
  'subcategory/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/subcategory/get`,
        {
          headers: { 'x-api-key': API_KEY },
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subcategories'
      );
    }
  }
);

/* ===================== GET SINGLE ===================== */

export const GetSingleSubCategory = createAsyncThunk(
  'subcategory/getSingle',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/subcategory/get/${id}`,
        jsonConfig
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subcategory'
      );
    }
  }
);

/* ===================== GET BY CATEGORY ===================== */

export const GetSubCategoriesByCategory = createAsyncThunk(
  'subcategory/getByCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/subcategory/category/${categoryId}`,
        {
          headers: { 'x-api-key': API_KEY },
        }
      );
      return res.data;  
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subcategories'
      );
    }
  }
);

/* ===================== UPDATE STATUS ===================== */

export const UpdateSubCategoryStatus = createAsyncThunk<
  any,
  { id: string; status: 'draft' | 'publish' },
  { rejectValue: string }
>(
  'subcategory/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/subcategory/update/status/${id}`,
        { status },
        {
          headers: { 'x-api-key': API_KEY },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong'
      );
    }
  }
);

/* ===================== UPDATE ===================== */

export const UpdateSubCategory = createAsyncThunk(
  'subcategory/update',
  async (
    { id, form }: { id: string; form: SubCategoryInput },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/subcategory/update/${id}`,
        form,
        jsonConfig
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Update failed'
      );
    }
  }
);

/* ===================== DELETE ===================== */

export const DeleteSubCategory = createAsyncThunk(
  'subcategory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/subcategory/delete/${id}`,
        {
          headers: { 'x-api-key': API_KEY },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Delete failed'
      );
    }
  }
);

/* ===================== SLICE ===================== */

const SubCategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    resetSubCategoryState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
      state.singleSubCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(CreateSubCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateSubCategory.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'SubCategory created';
        state.subCategories.push(action.payload.subCategory);
      })
      .addCase(CreateSubCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* GET ALL */
      .addCase(GetSubCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetSubCategories.fulfilled, (state, action: PayloadAction<SubCategory[]>) => {
        state.loading = false;
        state.subCategories = action.payload;
      })
      .addCase(GetSubCategories.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* GET SINGLE */
      .addCase(GetSingleSubCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetSingleSubCategory.fulfilled, (state, action: PayloadAction<SubCategory>) => {
        state.loading = false;
        state.singleSubCategory = action.payload;
      })
      .addCase(GetSingleSubCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* UPDATE STATUS */
      .addCase(UpdateSubCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const index = state.subCategories.findIndex(
          (s) => s._id === action.payload.subCategory._id
        );
        if (index !== -1) {
          state.subCategories[index] = action.payload.subCategory;
        }
      })

      /* UPDATE */
      .addCase(UpdateSubCategory.fulfilled, (state) => {
        state.loading = false;
        state.isupdated = true;
      })

      /* DELETE */
      .addCase(DeleteSubCategory.fulfilled, (state) => {
        state.loading = false;
        state.isdeleted = true;
      });
  },
});

export const { resetSubCategoryState } = SubCategorySlice.actions;
export default SubCategorySlice.reducer;
