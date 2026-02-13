// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// export const getImages = createAsyncThunk('images/getImages', async () => {
//   const res = await axios.get(`${API_URL}/api/images/all`);
//   return res.data;
// });

// export const uploadImages = createAsyncThunk('images/uploadImages', async (formData: FormData) => {
//   const res = await axios.post(`${API_URL}/api/images/upload`, formData);
//   return res.data.images;
// });

// export const deleteImage = createAsyncThunk('images/deleteImage', async (filename: string) => {
//   await axios.delete(`${API_URL}/api/images/${filename}`);
//   return filename;
// });

// interface ImageState {
//   images: { filename: string; url: string }[];
//   loading: boolean;
//   message: string | null;
//   error: string | null;
// }

// const initialState: ImageState = {
//   images: [],
//   loading: false,
//   message: null,
//   error: null,
// };

// export const ImageSlice = createSlice({
//   name: 'images',
//   initialState,
//   reducers: {
//     resetImageState: state => {
//       state.message = null;
//       state.error = null;
//     },
//   },
//   extraReducers: builder => {
//     builder
//       .addCase(getImages.pending, state => { state.loading = true; })
//       .addCase(getImages.fulfilled, (state, action) => { state.loading = false; state.images = action.payload; })
//       .addCase(getImages.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
//       .addCase(uploadImages.pending, state => { state.loading = true; })
//       .addCase(uploadImages.fulfilled, (state, action) => { state.loading = false; state.images.push(...action.payload); state.message = 'Uploaded successfully'; })
//       .addCase(uploadImages.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
//       .addCase(deleteImage.fulfilled, (state, action) => {
//         state.images = state.images.filter(img => img.filename !== action.payload);
//         state.message = 'Deleted successfully';
//       });
//   }
// });

// export const { resetImageState } = ImageSlice.actions;
// export default ImageSlice.reducer;




import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ================= TYPES ================= */

interface ImageType {
  filename: string;
  url: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  createdAt?: string;
}

interface ImageState {
  images: ImageType[];
  loading: boolean;
  message: string | null;
  error: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: ImageState = {
  images: [],
  loading: false,
  message: null,
  error: null,
};

/* ================= THUNKS ================= */

// GET ALL IMAGES
export const getImages = createAsyncThunk<
  ImageType[],
  void,
  { rejectValue: string }
>('images/getImages', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/api/images/all`);
    return res.data.images;
  } catch (error: any) {
    console.log(error)
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch images'
    );
  }
});

// UPLOAD IMAGES
export const uploadImages = createAsyncThunk<
  ImageType[],
  FormData,
  { rejectValue: string }
>('images/uploadImages', async (formData, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/images/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.images;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Image upload failed'
    );
  }
});

// DELETE IMAGE
// ImageSlice.ts - deleteImage thunk
export const deleteImage = createAsyncThunk<
  any,           // Return type
  string,        // Argument type (filename)
  { rejectValue: string }  // ThunkAPI config with rejectValue type
>(
  'image/delete',
  async (filename: string, { rejectWithValue }) => {
    try {
      // Encode the filename to handle slashes
      const encodedFilename = encodeURIComponent(filename);
      const res = await axios.delete(`${API_URL}/api/images/${encodedFilename}`)
      return { ...res.data, filename };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Delete failed'
      );
    }
  }
);
/* ================= SLICE ================= */

export const ImageSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    resetImageState: state => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder

      // GET IMAGES
      .addCase(getImages.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getImages.fulfilled, (state, action: PayloadAction<ImageType[]>) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(getImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })

      // UPLOAD IMAGES
      .addCase(uploadImages.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImages.fulfilled, (state, action: PayloadAction<ImageType[]>) => {
        state.loading = false;
        state.images.unshift(...action.payload);
        state.message = 'Uploaded successfully';
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Upload failed';
      })

      // DELETE IMAGE
   .addCase(deleteImage.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.message = action.payload.message;
        state.images = state.images.filter(
          (img) => img.filename !== action.payload.filename
        );
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.error = action.payload || 'Delete failed';
      });
  },
});

export const { resetImageState } = ImageSlice.actions;
export default ImageSlice.reducer;
