import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;


interface Address {
  country?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isDefault?: boolean;
}
// TYPES
interface Auth {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
 addresses?: Address; // ✅ plural
  message?: string;
}

interface AuthState {
  user: Auth | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  isAuthenticated: boolean;
  isRegistered: boolean;
  isOTPSent: boolean;
  isOTPVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  message: null,
  isAuthenticated: false,
  isRegistered: false,
  isOTPSent: false,
  isOTPVerified: false,
};

// ------------------ ASYNC ACTIONS ------------------

// 1. Register
export const createuser = createAsyncThunk<
  { message: string },
  { name: string; email: string; phone: string; },
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, payload, {
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Registration failed");
  }
});

// 2. Send OTP
export const sendOTP = createAsyncThunk<
  { message: string },
  { phone: string },
  { rejectValue: string }
>("auth/sendOTP", async ({ phone }, { rejectWithValue }) => {
  try {
    console.log("phone",phone)
    const res = await axios.post(`${API_URL}/api/auth/send-otp`, { phone },{
      headers:{"x-api-key": API_KEY}
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to send OTP");
  }
});

// 3. Verify OTP (login)
export const verifyotp = createAsyncThunk<
  { message: string; user: Auth },
  { phone: string; otp: string },
  { rejectValue: string }
>("auth/verifyotp", async ({ phone, otp }, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/auth/verify-otp`,
      { phone, otp },
      {headers:{
        "x-api-key": API_KEY
      }, withCredentials: true }
     
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Invalid OTP");
  }
});

// 4. Get user profile
export const getuser = createAsyncThunk<Auth, void, { rejectValue: string }>(
  "auth/getuser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to load user");
    }
  }
);

// 6. Update Profile
export const updateprofile = createAsyncThunk<
  Auth,
  Partial<Auth>,
  { rejectValue: string }
>("auth/updateprofile", async (payload, { rejectWithValue }) => {
  try {
    console.log(payload,"data")
    const res = await axios.put(`${API_URL}/api/auth/update/profile`, payload, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to update profile");
  }
});

// 5. Logout
export const logoutuser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/auth/logout`,
      {},
      { withCredentials: true ,
          headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Logout failed");
  }
});

// ------------------ SLICE ------------------
export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: (state) => {
      state.error = null;
      state.message = null;
      state.isRegistered = false;
      state.isOTPSent = false;
      state.isOTPVerified = false;
    },
  },
  extraReducers: (builder) => {
    // REGISTER
    builder
      .addCase(createuser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRegistered = false;
      })
      .addCase(createuser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.isRegistered = true;
      })
      .addCase(createuser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.isRegistered = false;
      });

    // SEND OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isOTPSent = false;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.isOTPSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send OTP";
        state.isOTPSent = false;
      });

    // VERIFY OTP
    builder
      .addCase(verifyotp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isOTPVerified = false;
      })
 .addCase(verifyotp.fulfilled, (state, action) => {
  state.loading = false;
  state.message = action.payload.message;
  state.user = action.payload.user;      // ✅ ADD THIS
  state.isAuthenticated = true;
  state.isOTPVerified = true;
})

      .addCase(verifyotp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Invalid OTP";
        state.isOTPVerified = false;
      });

    // GET USER
    builder
      .addCase(getuser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getuser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getuser.rejected, (state, action) => {
        state.loading = false;
        // state.error = action.payload || "Failed to get user";
        state.user = null;
        state.isAuthenticated = false;
      })


      //----------update profile---------


      .addCase(updateprofile.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(updateprofile.fulfilled, (state, action) => {
    state.loading = false;
    state.user = action.payload;
    state.message = "Profile updated successfully";
  })
  .addCase(updateprofile.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Failed to update profile";
  })

    // LOGOUT
    builder.addCase(logoutuser.fulfilled, (state, action) => {
      state.user = null;
      state.isAuthenticated = false;
      state.message = action.payload.message;
    });
  },
});

export const { resetState } = AuthSlice.actions;
export default AuthSlice.reducer;