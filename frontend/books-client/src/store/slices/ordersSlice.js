import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchUserOrders = createAsyncThunk('orders/fetchUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (status, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/admin/all', { params: status ? { status } : {} });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/admin/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update status');
  }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    userOrders: [],
    allOrders: [],
    loading: false,
    adminLoading: false,
    error: null,
  },
  reducers: {
    clearOrderError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // User orders
      .addCase(fetchUserOrders.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUserOrders.fulfilled, (s, a) => { s.loading = false; s.userOrders = a.payload; })
      .addCase(fetchUserOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Admin: all orders
      .addCase(fetchAllOrders.pending, (s) => { s.adminLoading = true; s.error = null; })
      .addCase(fetchAllOrders.fulfilled, (s, a) => { s.adminLoading = false; s.allOrders = a.payload; })
      .addCase(fetchAllOrders.rejected, (s, a) => { s.adminLoading = false; s.error = a.payload; })

      // Admin: update status — updates allOrders list immediately (optimistic UI)
      // userOrders is NOT touched here — user side re-fetches from server on its own poll
      .addCase(updateOrderStatus.fulfilled, (s, a) => {
        const updated = a.payload;
        // Sync allOrders
        const adminIdx = s.allOrders.findIndex(o => o.id === updated.id);
        if (adminIdx !== -1) s.allOrders[adminIdx] = updated;
        // Also sync userOrders in case the same user is logged in on another tab
        const userIdx = s.userOrders.findIndex(o => o.id === updated.id);
        if (userIdx !== -1) s.userOrders[userIdx] = updated;
      });
  },
});

export const { clearOrderError } = ordersSlice.actions;
export default ordersSlice.reducer;
