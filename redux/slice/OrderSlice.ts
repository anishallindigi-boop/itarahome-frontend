import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/* ---------------- TYPES ---------------- */

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface OrderItem {
  productId: string;
  productVariationId?: string | null;
  quantity: number;
  price: number;
  originalPrice?: number;
  name?: string;
  image?: string;
  attributes?: { [key: string]: string };
  sku?: string;
}

export interface PaymentDetails {
  status: 
    | 'pending'
    | 'initiated'
    | 'processing'
    | 'charged'
    | 'pending_vbv'
    | 'authentication_failed'
    | 'authorization_failed'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';
  method?: 'card' | 'netbanking' | 'upi' | 'wallet' | 'emi' | null;
  sessionId?: string;
  orderId?: string;
  txnId?: string;
  txnUuid?: string;
  gatewayReferenceId?: string;
  paymentUrl?: string;
  cardDetails?: {
    last4?: string;
    cardType?: string;
    cardBrand?: string;
  };
  errorCode?: string;
  errorMessage?: string;
  totalRefunded?: number;
  initiatedAt?: string;
  completedAt?: string;
  failedAt?: string;
}

export interface CouponDetails {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  discountAmount: number;
}

export interface Order {
  _id?: string;
  orderNumber?: string;
  status: 
    | 'pending_payment'
    | 'payment_initiated'
    | 'order_success'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethodId?: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  couponCode?: string | null;
  couponDetails?: CouponDetails;
  payment?: PaymentDetails;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  createdAt?: string;
  updatedAt?: string;
  cancelReason?: string;
  cancelledAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  user?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
}

interface OrderState {
  orders: Order[];
  order: Order | null;
  stats: OrderStats | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  paymentUrl: string | null;
  sessionId: string | null;
}

const initialState: OrderState = {
  orders: [],
  order: null,
  stats: null,
  loading: false,
  error: null,
  message: null,
  paymentUrl: null,
  sessionId: null,
};

/* ---------------- ASYNC ACTIONS ---------------- */

// store/slices/orderSlice.js - Update these specific actions

// ✅ Create Order - matches your backend route POST /api/orders/create
export const createOrder = createAsyncThunk<
  { message: string; order: Order },
  Partial<Order>,
  { rejectValue: string }
>("order/create", async (payload, { rejectWithValue }) => {
  try {
    // Your backend uses POST /api/orders/create (from your routes)
    const res = await axios.post(`${API_URL}/api/orders/create`, payload, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Order creation failed"
    );
  }
});

// ✅ Initiate Payment - matches your backend route POST /api/orders/initiate-payment
export const initiatePayment = createAsyncThunk<
  { 
    success: boolean;
    message: string; 
    paymentUrl: string; 
    sessionId: string;
    order: Order;
  },
  string, // orderId
  { rejectValue: string }
>("order/initiatePayment", async (orderId, { rejectWithValue }) => {
  try {
    // Your backend uses POST /api/orders/initiate-payment
    const res = await axios.post(
      `${API_URL}/api/orders/initiate-payment`,
      { orderId },
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    console.log(err);
    return rejectWithValue(
      err.response?.data?.message || "Payment initiation failed"
    );
  }
});

// ✅ Check Payment Status - matches your backend route GET /api/orders/payment-status/:orderNumber
export const checkPaymentStatus = createAsyncThunk<
  { 
    success: boolean;
    order: {
      orderNumber: string;
      status: string;
      paymentStatus: string;
      total: number;
      paymentMethod?: string;
      txnId?: string;
    };
  },
  string, // orderNumber
  { rejectValue: string }
>("order/checkPaymentStatus", async (orderNumber, { rejectWithValue }) => {
  try {
    // Your backend uses GET /api/orders/payment-status/:orderNumber
    const res = await axios.get(
      `${API_URL}/api/orders/payment-status/${orderNumber}`,
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to check payment status"
    );
  }
});

// ✅ Get Order by Order Number - matches your backend route GET /api/orders/order-number/:orderNumber


// ✅ Get ALL Orders (Admin)
export const getAllOrders = createAsyncThunk<
  { 
    success: boolean;
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  },
  { 
    status?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
    search?: string;
  },
  { rejectValue: string }
>("order/getAll", async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const res = await axios.get(
      `${API_URL}/api/orders?${queryParams.toString()}`,
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// ✅ Get Order Stats (Admin)
export const getOrderStats = createAsyncThunk<
  { success: boolean; stats: OrderStats },
  void,
  { rejectValue: string }
>("order/getStats", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/api/orders/stats`, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch stats"
    );
  }
});

// ✅ Get Single Order by ID (Admin)
export const getOrderById = createAsyncThunk<
  { success: boolean; order: Order },
  string,
  { rejectValue: string }
>("order/getById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/api/orders/${id}`, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Order not found"
    );
  }
});

// ✅ Get Order by Order Number (Public/Customer)
export const getOrderByOrderNumber = createAsyncThunk<
  { success: boolean; order: Order },
  string,
  { rejectValue: string }
>("order/getByOrderNumber", async (orderNumber, { rejectWithValue }) => {
  try {
    const res = await axios.get(
      `${API_URL}/api/orders/order-number/${orderNumber}`,
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Order not found"
    );
  }
});

// ✅ Get Orders by Customer (Authenticated User)
export const getOrdersByCustomer = createAsyncThunk<
  { success: boolean; orders: Order[] },
  void,
  { rejectValue: string }
>("order/getByCustomer", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/api/orders/customer`, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// ✅ Update Order Status (Admin)
export const updateOrderStatus = createAsyncThunk<
  { success: boolean; message: string; order: Order },
  {
    id: string;
    status: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
  },
  { rejectValue: string }
>("order/updateStatus", async (payload, { rejectWithValue }) => {
  try {
    const { id, ...data } = payload;
    const res = await axios.patch(
      `${API_URL}/api/orders/${id}/status`,
      data,
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Update failed"
    );
  }
});

// ✅ Cancel Order
export const cancelOrder = createAsyncThunk<
  { success: boolean; message: string; order: Order },
  { id: string; reason?: string },
  { rejectValue: string }
>("order/cancel", async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/orders/${id}/cancel`,
      { reason },
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Cancellation failed"
    );
  }
});

// ✅ Initiate Refund (Admin)
export const initiateRefund = createAsyncThunk<
  { success: boolean; message: string; order: Order },
  { id: string; amount?: number; reason?: string },
  { rejectValue: string }
>("order/refund", async ({ id, amount, reason }, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/orders/${id}/refund`,
      { amount, reason },
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Refund failed"
    );
  }
});

// ✅ Delete Order (Admin - only unpaid orders)
export const deleteOrder = createAsyncThunk<
  { success: boolean; message: string; id: string },
  string,
  { rejectValue: string }
>("order/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`${API_URL}/api/orders/${id}`, {
      withCredentials: true,
      headers: { "x-api-key": API_KEY },
    });
    return { ...res.data, id };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Delete failed"
    );
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
      state.paymentUrl = null;
      state.sessionId = null;
    },
    clearOrder: (state) => {
      state.order = null;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder

      /* ============================================ */
      /* CREATE ORDER */
      /* ============================================ */
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
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

      /* ============================================ */
      /* INITIATE PAYMENT */
      /* ============================================ */
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.paymentUrl = action.payload.paymentUrl;
        state.sessionId = action.payload.sessionId;
        if (action.payload.order) {
          state.order = action.payload.order;
        }
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Payment initiation failed";
      })

      /* ============================================ */
      /* CHECK PAYMENT STATUS */
      /* ============================================ */
      .addCase(checkPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update order if it exists
        if (state.order && state.order.orderNumber === action.payload.order.orderNumber) {
          state.order = {
            ...state.order,
            status: action.payload.order.status as any,
            payment: {
              ...state.order.payment,
              status: action.payload.order.paymentStatus as any,
              txnId: action.payload.order.txnId,
            },
          };
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to check payment status";
      })

      /* ============================================ */
      /* GET ALL ORDERS */
      /* ============================================ */
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch failed";
      })

      /* ============================================ */
      /* GET ORDER STATS */
      /* ============================================ */
      .addCase(getOrderStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stats";
      })

      /* ============================================ */
      /* GET ORDER BY ID */
      /* ============================================ */
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order not found";
      })

      /* ============================================ */
      /* GET ORDER BY ORDER NUMBER */
      /* ============================================ */
      .addCase(getOrderByOrderNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByOrderNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(getOrderByOrderNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Order not found";
      })

      /* ============================================ */
      /* GET ORDERS BY CUSTOMER */
      /* ============================================ */
      .addCase(getOrdersByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(getOrdersByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      /* ============================================ */
      /* UPDATE ORDER STATUS */
      /* ============================================ */
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        // Update in orders array
        const index = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        
        // Update current order
        if (state.order && state.order._id === action.payload.order._id) {
          state.order = action.payload.order;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Update failed";
      })

      /* ============================================ */
      /* CANCEL ORDER */
      /* ============================================ */
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        // Update in orders array
        const index = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        
        // Update current order
        if (state.order && state.order._id === action.payload.order._id) {
          state.order = action.payload.order;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Cancellation failed";
      })

      /* ============================================ */
      /* INITIATE REFUND */
      /* ============================================ */
      .addCase(initiateRefund.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateRefund.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        // Update in orders array
        const index = state.orders.findIndex(
          (o) => o._id === action.payload.order._id
        );
        if (index !== -1) {
          state.orders[index] = action.payload.order;
        }
        
        // Update current order
        if (state.order && state.order._id === action.payload.order._id) {
          state.order = action.payload.order;
        }
      })
      .addCase(initiateRefund.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Refund failed";
      })

      /* ============================================ */
      /* DELETE ORDER */
      /* ============================================ */
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.orders = state.orders.filter((o) => o._id !== action.payload.id);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
      });
  },
});

export const { resetOrderState, clearOrder, clearOrders } = OrderSlice.actions;
export default OrderSlice.reducer;