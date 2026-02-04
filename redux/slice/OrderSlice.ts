import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ---------------- TYPES ---------------- */

export interface Order {
  _id?: string;
  orderNumber?: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethodId?: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt?: string;
  couponCode?: string | null;
  discount?: number;
  couponDetails?: any;
}

interface OrderState {
  orders: Order[];
  order: Order | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  
}

const initialState: OrderState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  message: null,
};

/* ---------------- ASYNC ACTIONS ---------------- */

// ✅ Create Order
export const createOrder = createAsyncThunk<
  { message: string; order: Order },
  Order,
  { rejectValue: string }
>("order/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/api/order/create`, payload, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Order creation failed");
  }
});

// ✅ Get ALL Orders (Admin / Authorized)
export const getAllOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("order/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/api/order/all`, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    // console.log(res.data,"ath")
    return res.data.orders;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch orders");
  }
});

// ✅ Get Single Order   (orderNumber or _id)
export const getOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("order/getOne", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/order/get/${id}`,
      {
          withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data.order;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Order not found");
  }
});

// ✅ Update Order Status
// ✅ Update Order Status
export const updateOrderStatus = createAsyncThunk<
  { message: string; order: Order },
  { id: string; status: string },
  { rejectValue: string }
>("order/updateStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/order/update-status/${id}`,
      { status },
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    
    // Log the response for debugging
    // console.log('Update status API response:', res.data);
    
    return res.data;
  } catch (err: any) {
    // console.error('Update status API error:', err);
    return rejectWithValue(err.response?.data?.error || "Update failed");
  }
});

// ✅ Delete Order
export const deleteOrder = createAsyncThunk<
  { message: string; id: string },
  string,
  { rejectValue: string }
>("order/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.delete(
      `${API_URL}/api/order/delete/${id}`,
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Delete failed");
  }
});



// Get orders for the current authenticated user
export const getOrdersByCustomer = createAsyncThunk(
  "order/getOrdersByCustomer",
  async (_, { rejectWithValue }) => { 
    try {
      const res = await axios.get(`${API_URL}/api/order/customer-order`, {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      });
      return res.data.orders;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Fetch failed");
    }
  }
);


//------------------get order by order number-0------------


export const getOrderByOrderNumber=createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("order/getOrderByOrderNumber", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/order/order-by-order-number/${id}`,
      {
          withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.error || "Order not found");
  }
});



/* ---------------- SLICE ---------------- */

export const OrderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* CREATE */
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.order = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Create failed";
      })

      /* GET ALL */
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch failed";
      })

      /* GET ONE */
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order not found";
      })

      /* UPDATE STATUS */
   /* UPDATE STATUS */
.addCase(updateOrderStatus.fulfilled, (state, action) => {
  console.log('Status update fulfilled:', action.payload);
  state.message = action.payload.message;
  
  // Check if payload has the updated order
  if (action.payload.order) {
    // Update the specific order in the orders array
    const index = state.orders.findIndex(o => o._id === action.payload.order._id);
    if (index !== -1) {
      state.orders[index] = action.payload.order;
    }
  }
  
  // Also update the current order if it's the same one
  if (state.order && state.order._id === action.payload.order._id) {
    state.order = action.payload.order;
  }
})

  // GET ORDERS BY CUSTOMER
      .addCase(getOrdersByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrdersByCustomer.rejected, (state, action) => {
        state.loading = false;
     
      })


        /* GET order by order number */
      .addCase(getOrderByOrderNumber.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderByOrderNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderByOrderNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order not found";
      })


      /* DELETE */
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.orders = state.orders.filter(
          (o) => o._id !== action.payload.id
        );
      });
  },
});

export const { resetOrderState } = OrderSlice.actions;
export default OrderSlice.reducer;
