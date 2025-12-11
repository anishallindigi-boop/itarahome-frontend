
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

type CreateProductCategoryInput = {
  categoryname: string;
  categorydescription: string;
image: File | null

};

interface ProductCategory {
  _id: string;
  categoryname: string;
  categorydescription: string;
  image: File | null,
  message?: string;
  // slug: string;
  status: 'active' | 'inactive';
  
}

interface ProductCategoryState {
  Productcategories: ProductCategory[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
  singleProductcategory: ProductCategory | null;
}

const initialState: ProductCategoryState = {
  Productcategories: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
  singleProductcategory: null,
};

export const CreateProductCategory = createAsyncThunk(
  'Productcategory/create',
  async (form:CreateProductCategoryInput, { rejectWithValue }) => {
    // console.log(form,"slice")
    try {


 const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-api-key':API_KEY
      },
      withCredentials: true,
    };

      const response = await axios.post(`${API_URL}/api/category/create`, form, config);
      // console.log(response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

//-----------------------------get product category------------
export const GetProductCategory = createAsyncThunk(
  'Productcategory/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/category/all`,{
        headers:{
          'x-api-key':API_KEY
        }
      });
console.log(response.data)
      return response.data   ;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);


//-----------------------get single product category------------

export const GetSingleProductCategory = createAsyncThunk(
  'Productcategory/getsingle',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/category/get-single-category/${id}`,{
        withCredentials:true,
        headers:{
          'x-api-key':API_KEY
        }
      });
  // console.log(response.data,"response.data")
      return response.data.category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);


//-----------------------------update product category------------

export const UpdateProductCategory = createAsyncThunk(
  'Productcategory/update',
  async ({id, form}: {id:string, form:CreateProductCategoryInput}, { rejectWithValue }) => {
    try {
      // console.log(formData,id,"slice")
      const response = await axios.patch(`${API_URL}/api/category/update/${id}`, form, {
      withCredentials:true,
      headers:{
        'x-api-key':API_KEY
      }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

//-----------------------------delete product category------------

export const DeleteProductCategory = createAsyncThunk(
  'Productcategory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      // console.log(id,"slice")
      const response = await axios.delete(`${API_URL}/api/category/delete/${id}`,{
        withCredentials:true,
        headers:{
          'x-api-key':API_KEY
        }
      });
      return response.data;
      
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const ProductCategorySlice = createSlice({
  name: 'Productcategory',
  initialState,
  reducers: {
    resetState: (state) => {
      state.Productcategories = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
      state.singleProductcategory = null;
    }
  },
  extraReducers(builder) {
    builder

      .addCase(CreateProductCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(CreateProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message as string;
        state.Productcategories.push(action.payload);
      })
      .addCase(CreateProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(GetProductCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory[]>) => {
        state.loading = false;
        state.Productcategories = action.payload;
      })
      .addCase(GetProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      //------------------------get single Product category------------
      .addCase(GetSingleProductCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetSingleProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
        state.loading = false;
        state.singleProductcategory = action.payload;
      })
      .addCase(GetSingleProductCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
//-----------------------------update Product category------------

.addCase(UpdateProductCategory.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(UpdateProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
  state.loading = false;
  state.message = action.payload.message as string;
  state.isupdated = true;
})
.addCase(UpdateProductCategory.rejected, (state, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = action.payload;
})

//-----------------------------delete Product category------------

.addCase(DeleteProductCategory.pending, (state) => {
  state.loading = true;
  state.error = null;

})
.addCase(DeleteProductCategory.fulfilled, (state, action: PayloadAction<ProductCategory>) => {
  state.loading = false;
  state.message = action.payload.message as string;
  state.isdeleted = true;
})
.addCase(DeleteProductCategory.rejected, (state, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = action.payload;
})


  }
})


export const { resetState } = ProductCategorySlice.actions;
export default ProductCategorySlice.reducer;