
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

type CreateBlogCategoryInput = {
  categoryname: string;
  categorydescription: string;
};

interface BlogCategory {
  _id: string;
  categoryname: string;
  categorydescription: string;
  message?: string;
  // slug: string;
  status: 'active' | 'inactive';
  
}

interface BlogCategoryState {
  blogcategories: BlogCategory[];
  loading: boolean;
  error: string | null;
  message: string | null;
  success: boolean;
  isupdated: boolean;
  isdeleted: boolean;
  singleblogcategory: BlogCategory | null;
}

const initialState: BlogCategoryState = {
  blogcategories: [],
  loading: false,
  error: null,
  message: null,
  success: false,
  isupdated: false,
  isdeleted: false,
  singleblogcategory: null,
};

export const CreateblogCategory = createAsyncThunk(
  'blogcategory/create',
  async (form:CreateBlogCategoryInput, { rejectWithValue }) => {
    // console.log(form,"slice")
    try {
      const response = await axios.post(`${API_URL}/api/blog-category/create-category`, form, {
        withCredentials:true,
        headers:{
          'x-api-key':API_KEY
        }
      });
      // console.log(response.data)
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

//-----------------------------get product category------------
export const GetblogCategory = createAsyncThunk(
  'blogcategory/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/blog-category/get-all-category`,{
        headers:{
          'x-api-key':API_KEY
        }
      });
// console.log(response.data)
      return response.data.categories      ;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);


//-----------------------get single product category------------

export const GetSingleblogCategory = createAsyncThunk(
  'blogcategory/getsingle',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/blog-category/get-single-category/${id}`,{
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

export const UpdateblogCategory = createAsyncThunk(
  'blogcategory/update',
  async ({id, data}: {id:string, data:CreateBlogCategoryInput}, { rejectWithValue }) => {
    try {
      // console.log(formData,id,"slice")
      const response = await axios.patch(`${API_URL}/api/blog-category/update-category/${id}`, data, {
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

export const DeleteblogCategory = createAsyncThunk(
  'blogcategory/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log(id,"slice")
      const response = await axios.delete(`${API_URL}/api/blog-category/delete-category/${id}`,{
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

export const BlogCategorySlice = createSlice({
  name: 'blogcategory',
  initialState,
  reducers: {
    resetState: (state) => {
      state.blogcategories = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
      state.isupdated = false;
      state.isdeleted = false;
      state.singleblogcategory = null;
    }
  },
  extraReducers(builder) {
    builder

      .addCase(CreateblogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(CreateblogCategory.fulfilled, (state, action: PayloadAction<BlogCategory>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message as string;
        state.blogcategories.push(action.payload);
      })
      .addCase(CreateblogCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(GetblogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetblogCategory.fulfilled, (state, action: PayloadAction<BlogCategory[]>) => {
        state.loading = false;
        state.blogcategories = action.payload;
      })
      .addCase(GetblogCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      //------------------------get single blog category------------
      .addCase(GetSingleblogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetSingleblogCategory.fulfilled, (state, action: PayloadAction<BlogCategory>) => {
        state.loading = false;
        state.singleblogcategory = action.payload;
      })
      .addCase(GetSingleblogCategory.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
//-----------------------------update blog category------------

.addCase(UpdateblogCategory.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(UpdateblogCategory.fulfilled, (state, action: PayloadAction<BlogCategory>) => {
  state.loading = false;
  state.message = action.payload.message as string;
  state.isupdated = true;
})
.addCase(UpdateblogCategory.rejected, (state, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = action.payload;
})

//-----------------------------delete blog category------------

.addCase(DeleteblogCategory.pending, (state) => {
  state.loading = true;
  state.error = null;

})
.addCase(DeleteblogCategory.fulfilled, (state, action: PayloadAction<BlogCategory>) => {
  state.loading = false;
  state.message = action.payload.message as string;
  state.isdeleted = true;
})
.addCase(DeleteblogCategory.rejected, (state, action: PayloadAction<any>) => {
  state.loading = false;
  state.error = action.payload;
})


  }
})


export const { resetState } = BlogCategorySlice.actions;
export default BlogCategorySlice.reducer;