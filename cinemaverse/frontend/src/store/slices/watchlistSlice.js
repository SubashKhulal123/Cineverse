import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Async thunks
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'watchlist/add',
  async (movieData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/watchlist', movieData);
      toast.success('Added to watchlist');
      // Refetch to get updated list
      await dispatch(fetchWatchlist());
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/remove',
  async (movieId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/watchlist/${movieId}`);
      toast.success('Removed from watchlist');
      // Refetch to get updated list
      await dispatch(fetchWatchlist());
      return movieId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'watchlist/toggleFavorite',
  async (movieId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/watchlist/${movieId}/favorite`);
      // Refetch to get updated list
      await dispatch(fetchWatchlist());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAsWatched = createAsyncThunk(
  'watchlist/markWatched',
  async ({ movieId, watched }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/watchlist/${movieId}/watched`, { watched });
      await dispatch(fetchWatchlist());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Initial state
const initialState = {
  items: [],
  loading: false,
  error: null,
};

// Slice
const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearWatchlist: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.data || [];
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      // Add to Watchlist
      .addCase(addToWatchlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWatchlist.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from Watchlist
      .addCase(removeFromWatchlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromWatchlist.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWatchlist } = watchlistSlice.actions;
export default watchlistSlice.reducer;