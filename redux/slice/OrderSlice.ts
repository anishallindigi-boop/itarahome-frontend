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
  callbackReceived?: boolean;
  callbackAt?: string;
}

export interface CouponDetails {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  discountAmount: number;
}

export interface ShiprocketDetails {
  status: 'pending' | 'created' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
  orderId?: string;
  shipmentId?: string;
  awbCode?: string;
  courierName?: string;
  retryCount?: number;
  errors?: Array<{ message: string; timestamp: string }>;
}

export interface Order {
  _id?: string;
  orderNumber?: string;
  status: 
    | 'pending_payment'
    | 'payment_initiated'
    | 'payment_pending'
    | 'payment_failed'
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
  shiprocketDetails?: ShiprocketDetails;
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
  inventoryUpdated?: boolean;
  inventoryUpdatedAt?: string;
  canRetryShiprocket?: boolean;
}

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  yearOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  shiprocketFailed: number;
  pendingShipments: number;
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
  // Polling for payment status
  isPolling: boolean;
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
  isPolling: false,
};

/* ---------------- ASYNC ACTIONS ---------------- */

// ✅ Create Order - POST /api/orders
export const createOrder = createAsyncThunk<
  { success: boolean; message: string; order: Order },
  Partial<Order>,
  { rejectValue: string }
>("order/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/api/orders`, payload, {
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

// ✅ Initiate Payment - POST /api/payments/initiate (NEW ROUTE)
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
    // CHANGED: Now uses /api/payments/initiate instead of /api/orders/initiate-payment
    const res = await axios.post(
      `${API_URL}/api/payments/initiate`,
      { orderId },
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );

    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.log(err);
    return rejectWithValue(
      err.response?.data?.message || "Payment initiation failed"
    );
  }
});

// ✅ Check Payment Status - GET /api/payments/status/:orderNumber (NEW ROUTE)
export const checkPaymentStatus = createAsyncThunk<
  { 
    success: boolean;
    source: 'database' | 'gateway';
    order: {
      orderNumber: string;
      status: string;
      paymentStatus: string;
      total: number;
      paymentMethod?: string;
      txnId?: string;
      shiprocketStatus?: string;
      trackingNumber?: string;
      trackingUrl?: string;
      confirmed: boolean;
    };
    warning?: string;
  },
  string, // orderNumber
  { rejectValue: string }
>("order/checkPaymentStatus", async (orderNumber, { rejectWithValue }) => {
  try {
    // CHANGED: Now uses /api/payments/status/:orderNumber instead of /api/orders/payment-status/:orderNumber
    const res = await axios.get(
      `${API_URL}/api/payments/status/${orderNumber}`,
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

// ✅ Get ALL Orders (Admin) - GET /api/orders
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
    shiprocketStatus?: string;
    page?: number;
    limit?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  { rejectValue: string }
>("order/getAll", async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params.shiprocketStatus) queryParams.append('shiprocketStatus', params.shiprocketStatus);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

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

// ✅ Get Order Stats (Admin) - GET /api/orders/stats
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

// ✅ Get Single Order by ID (Admin) - GET /api/orders/:id
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

// ✅ Get Order by Order Number (Public/Customer) - GET /api/orders/by-number/:orderNumber
export const getOrderByOrderNumber = createAsyncThunk<
  { success: boolean; order: Order },
  string,
  { rejectValue: string }
>("order/getByOrderNumber", async (orderNumber, { rejectWithValue }) => {
  try {
    // CHANGED: Route is now /by-number/:orderNumber (matching backend)
    const res = await axios.get(
      `${API_URL}/api/orders/by-number/${orderNumber}`,
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

// ✅ Get Orders by Customer (Authenticated User) - GET /api/orders/my-orders
export const getOrdersByCustomer = createAsyncThunk<
  { success: boolean; orders: Order[] },
  void,
  { rejectValue: string }
>("order/getByCustomer", async (_, { rejectWithValue }) => {
  try {
    // CHANGED: Route is now /my-orders (matching backend)
    const res = await axios.get(`${API_URL}/api/orders/my-orders`, {
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

// ✅ Update Order Status (Admin) - PATCH /api/orders/:id/status
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

// ✅ Cancel Order - POST /api/orders/:id/cancel
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

// ✅ Initiate Refund (Admin) - POST /api/payments/refund/:id (NEW ROUTE)
export const initiateRefund = createAsyncThunk<
  { success: boolean; message: string; refund: { id: string; amount: number; status: string } },
  { id: string; amount?: number; reason?: string },
  { rejectValue: string }
>("order/refund", async ({ id, amount, reason }, { rejectWithValue }) => {
  try {
    // CHANGED: Now uses /api/payments/refund/:id instead of /api/orders/:id/refund
    const res = await axios.post(
      `${API_URL}/api/payments/refund/${id}`,
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

// ✅ Delete Order (Admin - only unpaid orders) - DELETE /api/orders/:id
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

// ✅ Retry Shiprocket Order (Admin) - POST /api/orders/:orderId/retry-shiprocket
export const retryShiprocketOrder = createAsyncThunk<
  { success: boolean; message: string; data: { orderId: string; shipmentId: string; awbCode: string; courierName: string } },
  string, // orderId
  { rejectValue: string }
>("order/retryShiprocket", async (orderId, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/orders/${orderId}/retry-shiprocket`,
      {},
      {
        withCredentials: true,
        headers: { "x-api-key": API_KEY },
      }
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Shiprocket retry failed"
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
      state.isPolling = false;
    },
    clearOrder: (state) => {
      state.order = null;
    },
    clearOrders: (state) => {
      state.orders = [];
    },
    setPolling: (state, action: { payload: boolean }) => {
      state.isPolling = action.payload;
    },
    // Update order from callback/polling
    updateOrderPayment: (state, action: { payload: Partial<Order> }) => {
      if (state.order) {
        state.order = { ...state.order, ...action.payload };
      }
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
            shiprocketDetails: {
              ...state.order.shiprocketDetails,
              status: action.payload.order.shiprocketStatus as any,
            },
            trackingNumber: action.payload.order.trackingNumber,
            trackingUrl: action.payload.order.trackingUrl,
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
        
        // Note: Refund response structure changed - it returns refund object, not full order
        // You may want to refresh the order to get updated refund status
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
      })

      /* ============================================ */
      /* RETRY SHIPROCKET ORDER */
      /* ============================================ */
      .addCase(retryShiprocketOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retryShiprocketOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        
        // Update shiprocket details in current order
        if (state.order) {
          state.order.shiprocketDetails = {
            ...state.order.shiprocketDetails,
            orderId: action.payload.data.orderId,
            shipmentId: action.payload.data.shipmentId,
            awbCode: action.payload.data.awbCode,
            courierName: action.payload.data.courierName,
            status: 'created',
          };
        }
      })
      .addCase(retryShiprocketOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Shiprocket retry failed";
      });
  },
});

export const { resetOrderState, clearOrder, clearOrders, setPolling, updateOrderPayment } = OrderSlice.actions;
export default OrderSlice.reducer;