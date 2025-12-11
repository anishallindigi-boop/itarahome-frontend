import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ===================== TYPES ===================== */

export type AttributeValue = { value: string };

export type Attribute = {
  name: string;
  values: AttributeValue[];
};

export type Variation = {
  attributes: Record<string, string>;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  image: string;
};


export interface SingleProductResponse {
  product: Product;
  variations: Variation[];
}


export interface CreateProductInput {
  title: string;
  description: string;
  image: File | null;
  attributes: Attribute[];
  variations: Variation[];
}

export interface Product {
  _id: string;
  title: string;
  name: string;
  description: string;
  image: string;
  mainImage?:string;
  gallery?:string[];
  content:string;
  price?:string;
  discountPrice?:string;
  attributes: Attribute[];
  variations: Variation[];
  message?: string;
  slug?:string;
  status: 'active' | 'inactive';
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
 singleProduct: SingleProductResponse | null,
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
  singleProduct: null,
};




// change the thunk signature
export const CreateProduct = createAsyncThunk(
  'product/create',
  async (formData: FormData, { rejectWithValue }) => {   // <-- FormData instead of CreateProductInput
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': API_KEY!,
        },
        withCredentials: true,
      };

      const { data } = await axios.post(
        `${API_URL}/api/product/create`,
        formData,
        config
      );
      return data;          // must return { product: Product, message?: string }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Something went wrong');
    }
  }
);



//----------------------get all products----------------------

export const GetProducts = createAsyncThunk(
  'product/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/product/all`, {
        headers: { 'x-api-key': API_KEY },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);




//---------------------------------GET SINGLE PRODUCT-------------------

export const GetSingleProduct = createAsyncThunk(
  'product/getsingle',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/product/get-single/${id}`, {
        withCredentials: true,
        headers: { 'x-api-key': API_KEY }
      });

      return response.data.product;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);



//--------------------get single project by slug----------------------

export const getsingleproductbyslug = createAsyncThunk<
  SingleProductResponse,
  string,
  { rejectValue: string }
>(
  'product/getsingleproductbyslug',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/product/slug/${slug}`,{
        headers:{
          'x-api-key':API_KEY
        }
      });
      return res.data.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error fetching projects';
      return rejectWithValue(errorMessage);
    }
  }
);



//------------------------------------------UPDATE PRODUCT----------------------------------\


export const UpdateProduct = createAsyncThunk(
  'product/update',
  async ({ id, form }: { id: string; form: CreateProductInput }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/api/product/update/${id}`, form, {
        withCredentials: true,
        headers: { 'x-api-key': API_KEY },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);







//----------------------------delete product------------------


export const DeleteProduct = createAsyncThunk(
  'product/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/product/delete/${id}`, {
        withCredentials: true,
        headers: { 'x-api-key': API_KEY },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);








export const ProductSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetState: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
      state.singleProduct = null;
    },
  },

  extraReducers(builder) {
    builder
      
      // CREATE PRODUCT
      .addCase(CreateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(CreateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message as string;
        state.products.push(action.payload);
      })
      .addCase(CreateProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET PRODUCTS
      .addCase(GetProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(GetProducts.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET SINGLE PRODUCT
      .addCase(GetSingleProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetSingleProduct.fulfilled, (state, action: PayloadAction<SingleProductResponse>) => {
        state.loading = false;
        state.singleProduct = action.payload;
      })
      .addCase(GetSingleProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

//---------get single by slug product

  .addCase(getsingleproductbyslug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(getsingleproductbyslug.fulfilled, (state, action: PayloadAction<SingleProductResponse>) => {
        state.loading = false;
        state.singleProduct = action.payload;
      })
      .addCase(getsingleproductbyslug.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })



      // UPDATE PRODUCT
      .addCase(UpdateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.message = action.payload.message as string;
        state.isupdated = true;
      })
      .addCase(UpdateProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE PRODUCT
      .addCase(DeleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(DeleteProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.loading = false;
        state.message = action.payload.message as string;
        state.isdeleted = true;
      })
      .addCase(DeleteProduct.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});




export const { resetState } = ProductSlice.actions;
export default ProductSlice.reducer;
