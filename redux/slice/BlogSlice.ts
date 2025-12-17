import { createSlice,PayloadAction,createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const API_URL=process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface BlogInput {
  id?:string;
  _id?:string;
  createdAt?:string;
  title: string;
  excerpt: string;
  content: string;
  category: string[];
  images: File[]; // or File[] if you're uploading
  metatitle?: string;
  metadescription?: string;
  metakeywords?: string;
  author?: string;
  slug?: string;
  status?:string;
  username?:string;
}


interface Blog {
  id?: string;
  metatitle: string;
  metadescription: string;
  metakeywords: string;
  title: string;
  content: string;
  excerpt: string;
  category: string[];
  images: File[];
  message?:string;
  createdAt?:string;
  author?:string;
  username?:string;
  status?:string;
}

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  success: boolean;
  message:string | null;
  isupdate:boolean;
  isdeleted: boolean;
  singleblog: Blog | null;
}

const initialState: BlogState = {
  blogs: [],
  singleblog: null,
  loading: false,
  error: null,
  message:null,
  isupdate:false,
  success: false,
  isdeleted: false,
};


export const Createblog = createAsyncThunk(
  'blog/createblog',
  async (form: Blog, { rejectWithValue }) => {
    try {

      console.log(form,"form")
      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('excerpt', form.excerpt);
      formData.append('content', form.content);
      formData.append('metatitle', form.metatitle || '');
      formData.append('metadescription', form.metadescription || '');
      formData.append('metakeywords', form.metakeywords || '');

      // category is an array
      form.category.forEach(cat => formData.append('category[]', cat));

      // append all image files
      form.images.forEach(image => formData.append('images', image)); // ✅
      console.log('form.images:', form.images);
      console.log('typeof form.images:', typeof form.images);
      const res = await axios.post(`${API_URL}/api/blog/create-blog`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key':API_KEY
        },
      });
console.log(res.data,"res.data")
      return res.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error creating blog';
      return rejectWithValue(errorMessage);
    }
  }
);


// ------------------------------------get all blogs----------------------------------

export const getAllBlogs = createAsyncThunk(
  'blog/getAllBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/blog/all-blogs`,{
        headers:{
          'x-api-key':API_KEY
        }
      });
     
      return res.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error fetching blogs';
      return rejectWithValue(errorMessage);
    }
  }
);

//------------------------------------get single blog by id----------------------------------

export const getSingleBlog = createAsyncThunk(
  'blog/getSingleBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/blog/single-blog/${id}`,{
        headers:{
          'x-api-key':API_KEY
        }
      });
      return res.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error fetching blog';
      return rejectWithValue(errorMessage);
    }
  }
);



//----------------------get single blog by slug-------------------------

export const getSingleBlogBySlug = createAsyncThunk(
  'blog/getSingleBlogBySlug',
  async (slug: string, { rejectWithValue }) => {
    console.log(slug,"slug slice" )
    try {
      const res = await axios.get(`${API_URL}/api/blog/single-slug-blog/${slug}`,{
        headers:{
          'x-api-key':API_KEY
        }
      });
      return res.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error fetching blog';
      return rejectWithValue(errorMessage);
    }
  }
);

//------------------------------------update blog----------------------------------

type UpdateBlogArg = { id: string; form: BlogInput };

export const updateBlog = createAsyncThunk<
  any,                        // Return type (replace with your API response type)
  UpdateBlogArg,              // Arg type
  { rejectValue: string }     // thunkAPI typing
>(
  'blog/updateBlog',
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('excerpt', form.excerpt);
      formData.append('content', form.content);
      formData.append('metatitle', form.metatitle || '');
      formData.append('metadescription', form.metadescription || '');
      formData.append('metakeywords', form.metakeywords || '');
      form.category.forEach((cat) => formData.append('category[]', cat));
     
      form.images.forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });
  
  

      const res = await axios.put(`${API_URL}/api/blog/update-blog/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data','x-api-key':API_KEY },
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error updating blog');
    }
  }
);

//------------------------------------delete blog----------------------------------

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_URL}/api/blog/delete-blog/${id}`,{
        withCredentials:true,
        headers:{
          'x-api-key':API_KEY
        }
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Error deleting blog');
    }
  }
);

export const BlogSlice=createSlice({
  name:'blog',
  initialState,
  reducers:{
    resetState:(state)=>{
      state.blogs=[];
      state.loading=false;
      state.error=null;
      state.message=null;
      state.success=false;
      state.isdeleted=false;
      state.singleblog=null;
      state.isupdate=false;
    }
  },
  extraReducers(builder){
    builder
      .addCase(Createblog.pending,(state)=>{
        state.loading=true;
      })
      .addCase(Createblog.fulfilled,(state,action:PayloadAction<Blog>)=>{
        state.loading=false;
        state.blogs.push(action.payload);
        state.success=true;
      })
      .addCase(Createblog.rejected,(state,action:PayloadAction<any>)=>{
        state.loading=false;
        state.error=action.payload;
      })

      .addCase(getAllBlogs.pending,(state)=>{
        state.loading=true;
      })
      .addCase(getAllBlogs.fulfilled,(state,action:PayloadAction<Blog[]>)=>{
        state.loading=false;
        state.blogs=action.payload;
      })
      .addCase(getAllBlogs.rejected,(state,action:PayloadAction<any>)=>{
        state.loading=false;
        state.error=action.payload;
      })

      //---------------singlr blog by id-----------

      .addCase(getSingleBlog.pending,(state)=>{
        state.loading=true;
      })
      .addCase(getSingleBlog.fulfilled,(state,action:PayloadAction<Blog>)=>{
        state.loading=false;
        state.singleblog=action.payload;
      })
      .addCase(getSingleBlog.rejected,(state,action:PayloadAction<any>)=>{
        state.loading=false;
        state.error=action.payload;
      })

      //-------------------update blog-------

      .addCase(updateBlog.pending,(state)=>{
        state.loading=true;
      })
      .addCase(updateBlog.fulfilled,(state,action:PayloadAction<Blog>)=>{
        state.loading=false;
        state.blogs.push(action.payload);
        state.isupdate=true;
      })
      .addCase(updateBlog.rejected,(state,action:PayloadAction<any>)=>{
        state.loading=false;
        state.error=action.payload;
      })

      //-------------------delete blog-------

      .addCase(deleteBlog.pending,(state)=>{
        state.loading=true;
      })
      .addCase(deleteBlog.fulfilled,(state,action:PayloadAction<Blog>)=>{
        state.loading=false;
        // state.blogs.push(action.payload);
        state.isdeleted=true;
      })
      .addCase(deleteBlog.rejected,(state,action:PayloadAction<any>)=>{
        state.loading=false;
        state.error=action.payload;
      })


      //---------------singlr blog by slug-----------

      .addCase(getSingleBlogBySlug.pending,(state)=>{
        state.loading=true;
      })
      .addCase(getSingleBlogBySlug.fulfilled,(state,action:PayloadAction<Blog>)=>{
        state.loading=false;
        state.singleblog=action.payload;
      })
      .addCase(getSingleBlogBySlug.rejected,(state,action:PayloadAction<any>)=>{
        state.loading=false;
        state.error=action.payload;
      })
  }
})


export const { resetState } = BlogSlice.actions;

export default BlogSlice.reducer;