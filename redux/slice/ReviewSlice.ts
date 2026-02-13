// redux/slice/ReviewSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ================= TYPES ================= */

export interface ReviewInput {
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewUser {
  _id: string;
  name: string;
  avatar?: string;
}

export interface ReviewResponse {
  adminId: ReviewUser;
  message: string;
  respondedAt: string;
}

export interface Review {
  _id: string;
  userId: ReviewUser;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  status: 'pending' | 'approved' | 'rejected';
  response?: ReviewResponse;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewPagination {
  current: number;
  pages: number;
  total: number;
}

interface ReviewState {
  reviews: Review[];              // For product reviews
  pendingReviews: Review[];       // For pending reviews (admin)
  adminReviews: Review[];         // NEW: For all admin reviews
  stats: RatingStats;
  pagination: ReviewPagination | null;
  adminPagination: ReviewPagination | null; // NEW: Separate pagination for admin
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

/* ================= INITIAL STATE ================= */

const initialState: ReviewState = {
  reviews: [],
  pendingReviews: [],
  adminReviews: [], // NEW
  stats: {
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  },
  pagination: null,
  adminPagination: null, // NEW
  loading: false,
  error: null,
  success: false,
  message: null,
};
/* ================= THUNKS ================= */

/* GET PRODUCT REVIEWS (Public) */
export const getProductReviews = createAsyncThunk<
  any,
  { productId: string; page?: number; limit?: number; sort?: string },
  { rejectValue: string }
>('review/getProductReviews', async ({ productId, page = 1, limit = 10, sort = 'newest' }, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/review/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`,
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch reviews'
    );
  }
});

/* ADD REVIEW (Protected) */
export const addReview = createAsyncThunk<
  any,
  { productId: string; reviewData: ReviewInput },
  { rejectValue: string }
>('review/addReview', async ({ productId, reviewData }, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/review/product/${productId}`,
      reviewData,
      {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to submit review'
    );
  }
});

/* MARK REVIEW HELPFUL (Protected) */
export const markReviewHelpful = createAsyncThunk<
  any,
  { productId: string; reviewId: string; helpful: boolean },
  { rejectValue: string }
>('review/markHelpful', async ({ productId, reviewId, helpful }, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/review/product/${productId}/${reviewId}/helpful`,
      { helpful },
      {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to mark review'
    );
  }
});

/* GET PENDING REVIEWS (Admin) */
export const getPendingReviews = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>('review/getPendingReviews', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/review/admin/pending`,
      {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch pending reviews'
    );
  }
});

/* UPDATE REVIEW STATUS (Admin) */
export const updateReviewStatus = createAsyncThunk<
  any,
  { productId: string; reviewId: string; status: 'approved' | 'rejected'; responseMessage?: string },
  { rejectValue: string }
>('review/updateStatus', async ({ productId, reviewId, status, responseMessage }, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/review/admin/${productId}/${reviewId}`,
      { status, responseMessage },
      {
        headers: {
          'x-api-key': API_KEY,
        },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to update review status'
    );
  }
});




// Add these new thunks after the existing ones:

/* GET ALL REVIEWS (Admin) */
export const getAllReviews = createAsyncThunk<
  any,
  { page?: number; limit?: number; status?: string; search?: string },
  { rejectValue: string }
>('review/getAllReviews', async ({ 
  page = 1, 
  limit = 20, 
  status = 'all',
  search = ''
}, { rejectWithValue }) => {
  try {
    let url = `${API_URL}/api/review/admin/all?page=${page}&limit=${limit}`;
    
    if (status !== 'all') {
      url += `&status=${status}`;
    }
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    const res = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch all reviews'
    );
  }
});

/* GET REVIEWS BY STATUS (Admin) */
export const getReviewsByStatus = createAsyncThunk<
  any,
  { status: string; page?: number; limit?: number },
  { rejectValue: string }
>('review/getReviewsByStatus', async ({ status, page = 1, limit = 20 }, { rejectWithValue }) => {
  try {
    const url = `${API_URL}/api/review/admin/status/${status}?page=${page}&limit=${limit}`;
    const res = await axios.get(url, {
      headers: {
        'x-api-key': API_KEY,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || 'Failed to fetch reviews by status'
    );
  }
});

/* ================= SLICE ================= */

export const ReviewSlice = createSlice({
  name: 'review',
  initialState,
 reducers: {
  resetState: (state) => {
    state.loading = false;
    state.error = null;
    state.success = false;
    state.message = null;
  },
  clearReviews: (state) => {
    state.reviews = [];
    state.adminReviews = []; // NEW
    state.stats = {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
    state.pagination = null;
    state.adminPagination = null; // NEW
  },
},
  extraReducers: (builder) => {
    builder

      /* GET PRODUCT REVIEWS */
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ADD REVIEW */
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addReview.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      /* MARK HELPFUL */
      .addCase(markReviewHelpful.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markReviewHelpful.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(markReviewHelpful.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* GET PENDING REVIEWS (Admin) */
      .addCase(getPendingReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingReviews.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.pendingReviews = action.payload.reviews;
      })
      .addCase(getPendingReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE REVIEW STATUS (Admin) */
      .addCase(updateReviewStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Add these after your existing extraReducers:

/* GET ALL REVIEWS (Admin) */
.addCase(getAllReviews.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getAllReviews.fulfilled, (state, action: PayloadAction<any>) => {
  state.loading = false;
  state.adminReviews = action.payload.reviews || [];
  state.adminPagination = action.payload.pagination || null;
})
.addCase(getAllReviews.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
})

/* GET REVIEWS BY STATUS (Admin) */
.addCase(getReviewsByStatus.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getReviewsByStatus.fulfilled, (state, action: PayloadAction<any>) => {
  state.loading = false;
  state.adminReviews = action.payload.reviews || [];
  state.adminPagination = action.payload.pagination || null;
})
.addCase(getReviewsByStatus.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
})
  },
});

export const { resetState, clearReviews } = ReviewSlice.actions;
export default ReviewSlice.reducer;