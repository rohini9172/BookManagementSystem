import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchBooks = createAsyncThunk('books/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/books', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch books');
  }
});

export const fetchBookById = createAsyncThunk('books/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/books/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Book not found');
  }
});

export const createBook = createAsyncThunk('books/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/books', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create book');
  }
});

export const updateBook = createAsyncThunk('books/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/books/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update book');
  }
});

export const deleteBook = createAsyncThunk('books/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/books/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete book');
  }
});

const booksSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 8,
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelected(state) { state.selected = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBooks.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items;
        s.totalCount = a.payload.totalCount;
        s.page = a.payload.page;
        s.pageSize = a.payload.pageSize;
      })
      .addCase(fetchBooks.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchBookById.pending, (s) => { s.loading = true; })
      .addCase(fetchBookById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(fetchBookById.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createBook.fulfilled, (s, a) => { s.items.unshift(a.payload); s.totalCount++; })
      .addCase(updateBook.fulfilled, (s, a) => {
        const idx = s.items.findIndex(b => b.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
        if (s.selected?.id === a.payload.id) s.selected = a.payload;
      })
      .addCase(deleteBook.fulfilled, (s, a) => {
        s.items = s.items.filter(b => b.id !== a.payload);
        s.totalCount--;
      });
  },
});

export const { clearSelected, clearError } = booksSlice.actions;
export default booksSlice.reducer;
