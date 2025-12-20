import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getImages = createAsyncThunk('images/getImages', async () => {
  const res = await axios.get(`${API_URL}/api/images/all`);
  return res.data;
});

export const uploadImages = createAsyncThunk('images/uploadImages', async (formData: FormData) => {
  const res = await axios.post(`${API_URL}/api/images/upload`, formData);
  return res.data.images;
});

export const deleteImage = createAsyncThunk('images/deleteImage', async (filename: string) => {
  await axios.delete(`${API_URL}/api/images/${filename}`);
  return filename;
});

interface ImageState {
  images: { filename: string; url: string }[];
  loading: boolean;
  message: string | null;
  error: string | null;
}

const initialState: ImageState = {
  images: [],
  loading: false,
  message: null,
  error: null,
};

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
      .addCase(getImages.pending, state => { state.loading = true; })
      .addCase(getImages.fulfilled, (state, action) => { state.loading = false; state.images = action.payload; })
      .addCase(getImages.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(uploadImages.pending, state => { state.loading = true; })
      .addCase(uploadImages.fulfilled, (state, action) => { state.loading = false; state.images.push(...action.payload); state.message = 'Uploaded successfully'; })
      .addCase(uploadImages.rejected, (state, action) => { state.loading = false; state.error = action.error.message || null; })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.images = state.images.filter(img => img.filename !== action.payload);
        state.message = 'Deleted successfully';
      });
  }
});

export const { resetImageState } = ImageSlice.actions;
export default ImageSlice.reducer;
