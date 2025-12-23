import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ---------------- TYPES ---------------- */

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  image: string;
  metatitle?: string;
  metadescription?: string;
  metakeywords?: string;
  isActive: boolean;
  status: 'draft' | 'published';
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  metatitle?: string;
  metadescription?: string;
  metakeywords?: string;
  isActive: boolean;
  status: 'draft' | 'published';
  createdAt?: string;
  message?: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
  singleCategory: Category | null;
}

/* ---------------- INITIAL STATE ---------------- */

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
  singleCategory: null,
};

/* ---------------- API CONFIG ---------------- */

const jsonConfig = {
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
  withCredentials: true,
};

/* ---------------- CREATE CATEGORY ---------------- */

export const CreateProductCategory = createAsyncThunk(
  'category/create',
  async (data: CategoryInput, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/category/create`,
        data,
        jsonConfig
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Category creation failed'
      );
    }
  }
);

/* ---------------- GET ALL CATEGORIES ---------------- */

export const GetProductCategory = createAsyncThunk(
  'category/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/category/all`,
        {
          headers: { 'x-api-key': API_KEY },
        }
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

/* ---------------- GET SINGLE CATEGORY ---------------- */

export const GetSingleProductCategory = createAsyncThunk(
  'category/getSingle',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/category/get-single-category/${id}`,
        jsonConfig
      );
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category'
      );
    }
  }
);

//---------------------update category status

export const UpdateCategoryStatus = createAsyncThunk<
  any, // returned type (updated product)
  { id: string; status: 'draft' | 'published' },
  { rejectValue: string }
>(
  'category/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/category/update-status/${id}`,
        { status },
        {
          headers: {
            'x-api-key': API_KEY,
          },
          withCredentials: true,
        }
      );
      return res.data; // { success, message, product }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Something went wrong');
    }
  }
);



/* ---------------- UPDATE CATEGORY ---------------- */

export const UpdateProductCategory = createAsyncThunk(
  'category/update',
  async (
    { id, form }: { id: string; form: CategoryInput },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/category/update/${id}`,
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

/* ---------------- DELETE CATEGORY ---------------- */

export const DeleteProductCategory = createAsyncThunk(
  'category/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `${API_URL}/api/category/delete/${id}`,
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

/* ---------------- SLICE ---------------- */

const ProductCategorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
      state.singleCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(CreateProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(CreateProductCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Category created';
        state.categories.push(action.payload);
      })
      .addCase(CreateProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* GET ALL */
      .addCase(GetProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetProductCategory.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(GetProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* GET SINGLE */
      .addCase(GetSingleProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(GetSingleProductCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.singleCategory = action.payload;
      })
      .addCase(GetSingleProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })


 // UPDATE STATUS
    .addCase(UpdateCategoryStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(UpdateCategoryStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      const index = state.categories.findIndex(p => p._id === action.payload.category._id);
      if (index !== -1) {
        state.categories[index] = action.payload.category; // update category in list
      }
    })
    .addCase(UpdateCategoryStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

      /* UPDATE */
      .addCase(UpdateProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(UpdateProductCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.isupdated = true;
        state.message = action.payload.message || 'Category updated';
      })
      .addCase(UpdateProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* DELETE */
      .addCase(DeleteProductCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(DeleteProductCategory.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isdeleted = true;
        state.message = action.payload.message || 'Category deleted';
      })
      .addCase(DeleteProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = ProductCategorySlice.actions;
export default ProductCategorySlice.reducer;
