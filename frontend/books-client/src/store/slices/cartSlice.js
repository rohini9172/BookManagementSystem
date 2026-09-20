import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/cart', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ bookId, quantity }, { rejectWithValue }) => {
  try {
    if (quantity <= 0) {
      await api.delete(`/cart/${bookId}`);
      return { bookId, item: null };
    }
    const res = await api.put(`/cart/${bookId}`, quantity, {
      headers: { 'Content-Type': 'application/json' },
    });
    return { bookId, item: res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (bookId, { rejectWithValue }) => {
  try {
    await api.delete(`/cart/${bookId}`);
    return bookId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const checkout = createAsyncThunk('cart/checkout', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/orders/checkout', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Checkout failed');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null, lastOrder: null },
  reducers: {
    clearCartError(state) { state.error = null; },
    clearLastOrder(state) { state.lastOrder = null; },

    // Optimistic update — change quantity in state immediately, no API wait
    optimisticUpdate(state, action) {
      const { bookId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter(i => i.bookId !== bookId);
      } else {
        const idx = state.items.findIndex(i => i.bookId === bookId);
        if (idx !== -1) {
          const item = state.items[idx];
          state.items[idx] = {
            ...item,
            quantity,
            subtotal: +(item.price * quantity).toFixed(2),
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch — replace entire cart
      .addCase(fetchCart.fulfilled, (s, a) => { s.items = a.payload; })

      // Add — upsert by bookId
      .addCase(addToCart.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addToCart.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.items.findIndex(i => i.bookId === a.payload.bookId);
        if (idx !== -1) s.items[idx] = a.payload;
        else s.items.push(a.payload);
      })
      .addCase(addToCart.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // Update — confirm with server response, or rollback via fetchCart on error
      .addCase(updateCartItem.fulfilled, (s, a) => {
        const { bookId, item } = a.payload;
        if (!item) {
          s.items = s.items.filter(i => i.bookId !== bookId);
        } else {
          const idx = s.items.findIndex(i => i.bookId === bookId);
          if (idx !== -1) s.items[idx] = item;
        }
      })
      .addCase(updateCartItem.rejected, (s, a) => { s.error = a.payload; })

      // Remove
      .addCase(removeFromCart.fulfilled, (s, a) => {
        s.items = s.items.filter(i => i.bookId !== a.payload);
      })

      // Checkout
      .addCase(checkout.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(checkout.fulfilled, (s, a) => { s.loading = false; s.items = []; s.lastOrder = a.payload; })
      .addCase(checkout.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearCartError, clearLastOrder, optimisticUpdate } = cartSlice.actions;
export default cartSlice.reducer;
