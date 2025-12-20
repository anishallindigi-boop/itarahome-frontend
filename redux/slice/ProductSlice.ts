import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// -------------------- TYPES --------------------

export type AttributeValue = { value: string };
export type Attribute = { name: string; values: AttributeValue[] };
export type Variation = {
  attributes: Record<string, string>;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  image: string;
};

export interface Product {
  _id: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  mainImage?: string;
  gallery?: string[];
  content?: string;
  categoryid?:string;
  price?: string;
  discountPrice?: string;
  attributes?: Attribute[];
  variations?: Variation[];
  message?: string;
  stock?: string;
  slug?: string;
  status: 'draft' | 'published';
}

export interface SingleProductResponse {
  product: Product;
  variations?: Variation[];
}

interface ProductState {
  products: Product[];
  singleProduct: SingleProductResponse | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
}

const initialState: ProductState = {
  products: [],
  singleProduct: null,
  loading: false,
  error: null,
  message: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
};

// -------------------- THUNKS --------------------

// Create Product
export const createProduct = createAsyncThunk(
  'product/create',
  async (form: Product, { rejectWithValue }) => {
    try {

console.log(form,"form slice")

     const config = {
  headers: {
    'x-api-key': API_KEY
  },
  withCredentials: true
};

      const { data } = await axios.post(`${API_URL}/api/product/create`, form, config);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

// Get All Products
export const getProducts = createAsyncThunk(
  'product/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/product/getAll`, null, {
        headers: { 'x-api-key': API_KEY! },
      });
      return data.products;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Get Single Product by ID
export const getProductById = createAsyncThunk(
  'product/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/product/get/${id}`, null, {
        headers: { 'x-api-key': API_KEY },
        withCredentials: true,
      });
      return data.product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// Get Single Product by Slug
export const getProductBySlug = createAsyncThunk(
  'product/getBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/product/getBySlug/${slug}`, null, {
        headers: { 'x-api-key': API_KEY! },
      });
      return data.product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch product by slug');
    }
  }
);


// -----------------------update product status--------------s

export const UpdateProductStatus = createAsyncThunk<
  any, // returned type (updated product)
  { id: string; status: 'draft' | 'published' },
  { rejectValue: string }
>(
  'product/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/product/update-status/${id}`,
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


// Update Product
export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
  const config = {
  headers: {
    'x-api-key': API_KEY
  },
  withCredentials: true
};

      const { data } = await axios.post(`${API_URL}/api/product/update/${id}`, formData, config);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/product/delete/${id}`, null, {
        headers: { 'x-api-key': API_KEY! },
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  }
);

// -------------------- SLICE --------------------
export const ProductSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetState: (state) => {
      state.products = [];
      state.singleProduct = null;
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isUpdated = false;
      state.isDeleted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.success = true;
        state.products.push(action.payload);
        state.message = action.payload.message || 'Product created';
      })
      .addCase(createProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BY ID
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.singleProduct = { product: action.payload };
      })
      .addCase(getProductById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BY SLUG
      .addCase(getProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductBySlug.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.singleProduct = { product: action.payload };
      })
      .addCase(getProductBySlug.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })


 // UPDATE STATUS
    .addCase(UpdateProductStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(UpdateProductStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      const index = state.products.findIndex(p => p._id === action.payload.product._id);
      if (index !== -1) {
        state.products[index] = action.payload.product; // update product in list
      }
    })
    .addCase(UpdateProductStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

      // UPDATE
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.isUpdated = true;
        state.message = action.payload.message || 'Product updated';
      })
      .addCase(updateProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.isDeleted = true;
        state.message = action.payload.message || 'Product deleted';
      })
      .addCase(deleteProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = ProductSlice.actions;
export default ProductSlice.reducer;
