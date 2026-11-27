// // movieSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api';

// export const fetchTrending = createAsyncThunk('movies/trending', async (_, { rejectWithValue }) => {
//   try { return (await api.get('/movies/trending')).data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const fetchPopular = createAsyncThunk('movies/popular', async (page = 1, { rejectWithValue }) => {
//   try { return (await api.get(`/movies/popular?page=${page}`)).data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const fetchTopRated = createAsyncThunk('movies/topRated', async (page = 1, { rejectWithValue }) => {
//   try { return (await api.get(`/movies/top-rated?page=${page}`)).data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const fetchUpcoming = createAsyncThunk('movies/upcoming', async (_, { rejectWithValue }) => {
//   try { return (await api.get('/movies/upcoming')).data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const fetchMovieDetails = createAsyncThunk('movies/details', async (id, { rejectWithValue }) => {
//   try { return (await api.get(`/movies/${id}`)).data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const searchMovies = createAsyncThunk('movies/search', async ({ q, page = 1 }, { rejectWithValue }) => {
//   try { return (await api.get(`/movies/search?q=${encodeURIComponent(q)}&page=${page}`)).data.data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// const movieSlice = createSlice({
//   name: 'movies',
//   initialState: {
//     trending: [],
//     popular: [],
//     topRated: [],
//     upcoming: [],
//     details: null,
//     searchResults: null,
//     genres: [],
//     loading: false,
//     detailsLoading: false,
//     error: null,
//   },
//   reducers: {
//     clearDetails: (state) => { state.details = null; },
//     clearSearch: (state) => { state.searchResults = null; },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTrending.fulfilled, (s, a) => { s.trending = a.payload.results || []; })
//       .addCase(fetchPopular.fulfilled, (s, a) => { s.popular = a.payload.results || []; })
//       .addCase(fetchTopRated.fulfilled, (s, a) => { s.topRated = a.payload.results || []; })
//       .addCase(fetchUpcoming.fulfilled, (s, a) => { s.upcoming = a.payload.results || []; })
//       .addCase(fetchMovieDetails.pending, (s) => { s.detailsLoading = true; s.details = null; })
//       .addCase(fetchMovieDetails.fulfilled, (s, a) => { s.detailsLoading = false; s.details = a.payload; })
//       .addCase(fetchMovieDetails.rejected, (s, a) => { s.detailsLoading = false; s.error = a.payload; })
//       .addCase(searchMovies.pending, (s) => { s.loading = true; })
//       .addCase(searchMovies.fulfilled, (s, a) => { s.loading = false; s.searchResults = a.payload; })
//       .addCase(searchMovies.rejected, (s) => { s.loading = false; });
//   },
// });

// export const { clearDetails, clearSearch } = movieSlice.actions;
// export default movieSlice.reducer;

// // ─────────────────────────────────────────────────────────────
// // watchlistSlice.js
// import { createSlice as createWSlice, createAsyncThunk as createWThunk } from '@reduxjs/toolkit';
// import apiW from '../../services/api';
// import toastW from 'react-hot-toast';

// export const fetchWatchlist = createWThunk('watchlist/fetch', async (_, { rejectWithValue }) => {
//   try { return (await apiW.get('/watchlist')).data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const addToWatchlist = createWThunk('watchlist/add', async (movieData, { rejectWithValue }) => {
//   try {
//     const res = await apiW.post('/watchlist', movieData);
//     toastW.success('Added to watchlist');
//     return res.data.data;
//   } catch (e) {
//     toastW.error(e.response?.data?.message || 'Already in watchlist');
//     return rejectWithValue(e.response?.data?.message);
//   }
// });

// export const removeFromWatchlist = createWThunk('watchlist/remove', async (movieId, { rejectWithValue }) => {
//   try {
//     await apiW.delete(`/watchlist/${movieId}`);
//     toastW.success('Removed from watchlist');
//     return movieId;
//   } catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// export const toggleFavorite = createWThunk('watchlist/favorite', async (movieId, { rejectWithValue }) => {
//   try { return (await apiW.put(`/watchlist/${movieId}/favorite`)).data; }
//   catch (e) { return rejectWithValue(e.response?.data?.message); }
// });

// const watchlistSlice = createWSlice({
//   name: 'watchlist',
//   initialState: { items: [], loading: false, error: null },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchWatchlist.pending, (s) => { s.loading = true; })
//       .addCase(fetchWatchlist.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.data || []; })
//       .addCase(fetchWatchlist.rejected, (s) => { s.loading = false; })
//       .addCase(addToWatchlist.fulfilled, (s, a) => { s.items.unshift(a.payload); })
//       .addCase(removeFromWatchlist.fulfilled, (s, a) => {
//         s.items = s.items.filter((i) => i.movieId !== a.payload);
//       })
//       .addCase(toggleFavorite.fulfilled, (s, a) => {
//         const item = s.items.find((i) => i.movieId === a.payload.data?.movieId);
//         if (item) item.isFavorite = a.payload.isFavorite;
//       });
//   },
// });

// export default watchlistSlice.reducer;

// // ─────────────────────────────────────────────────────────────
// // uiSlice.js
// import { createSlice as createUSlice } from '@reduxjs/toolkit';

// const uiSlice = createUSlice({
//   name: 'ui',
//   initialState: {
//     searchOpen: false,
//     mobileMenuOpen: false,
//     trailerOpen: false,
//     trailerKey: null,
//   },
//   reducers: {
//     toggleSearch: (s) => { s.searchOpen = !s.searchOpen; },
//     toggleMobileMenu: (s) => { s.mobileMenuOpen = !s.mobileMenuOpen; },
//     openTrailer: (s, a) => { s.trailerOpen = true; s.trailerKey = a.payload; },
//     closeTrailer: (s) => { s.trailerOpen = false; s.trailerKey = null; },
//   },
// });

// export const { toggleSearch, toggleMobileMenu, openTrailer, closeTrailer } = uiSlice.actions;
// export const uiReducer = uiSlice.reducer;
// export default uiSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTrending = createAsyncThunk('movies/trending', async (_, { rejectWithValue }) => {
  try { return (await api.get('/movies/trending')).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchPopular = createAsyncThunk('movies/popular', async (page = 1, { rejectWithValue }) => {
  try { return (await api.get(`/movies/popular?page=${page}`)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchTopRated = createAsyncThunk('movies/topRated', async (page = 1, { rejectWithValue }) => {
  try { return (await api.get(`/movies/top-rated?page=${page}`)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchUpcoming = createAsyncThunk('movies/upcoming', async (_, { rejectWithValue }) => {
  try { return (await api.get('/movies/upcoming')).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const fetchMovieDetails = createAsyncThunk('movies/details', async (id, { rejectWithValue }) => {
  try { return (await api.get(`/movies/${id}`)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const searchMovies = createAsyncThunk('movies/search', async ({ q, page = 1 }, { rejectWithValue }) => {
  try { return (await api.get(`/movies/search?q=${encodeURIComponent(q)}&page=${page}`)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    details: null,
    searchResults: null,
    genres: [],
    loading: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearDetails: (state) => { state.details = null; },
    clearSearch: (state) => { state.searchResults = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrending.fulfilled, (s, a) => { s.trending = a.payload.results || []; })
      .addCase(fetchPopular.fulfilled, (s, a) => { s.popular = a.payload.results || []; })
      .addCase(fetchTopRated.fulfilled, (s, a) => { s.topRated = a.payload.results || []; })
      .addCase(fetchUpcoming.fulfilled, (s, a) => { s.upcoming = a.payload.results || []; })
      .addCase(fetchMovieDetails.pending, (s) => { s.detailsLoading = true; s.details = null; })
      .addCase(fetchMovieDetails.fulfilled, (s, a) => { s.detailsLoading = false; s.details = a.payload; })
      .addCase(fetchMovieDetails.rejected, (s, a) => { s.detailsLoading = false; s.error = a.payload; })
      .addCase(searchMovies.pending, (s) => { s.loading = true; })
      .addCase(searchMovies.fulfilled, (s, a) => { s.loading = false; s.searchResults = a.payload; })
      .addCase(searchMovies.rejected, (s) => { s.loading = false; });
  },
});

// ─────────────────────────────────────────────────────────────
// watchlistSlice.js
import { createSlice as createWSlice, createAsyncThunk as createWThunk } from '@reduxjs/toolkit';
import apiW from '../../services/api';
import toastW from 'react-hot-toast';

export const fetchWatchlist = createWThunk('watchlist/fetch', async (_, { rejectWithValue }) => {
  try { return (await apiW.get('/watchlist')).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const addToWatchlist = createWThunk('watchlist/add', async (movieData, { rejectWithValue }) => {
  try {
    const res = await apiW.post('/watchlist', movieData);
    toastW.success('Added to watchlist');
    return res.data.data;
  } catch (e) {
    toastW.error(e.response?.data?.message || 'Already in watchlist');
    return rejectWithValue(e.response?.data?.message);
  }
});

export const removeFromWatchlist = createWThunk('watchlist/remove', async (movieId, { rejectWithValue }) => {
  try {
    await apiW.delete(`/watchlist/${movieId}`);
    toastW.success('Removed from watchlist');
    return movieId;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const toggleFavorite = createWThunk('watchlist/favorite', async (movieId, { rejectWithValue }) => {
  try { return (await apiW.put(`/watchlist/${movieId}/favorite`)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const watchlistSlice = createWSlice({
  name: 'watchlist',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchlist.pending, (s) => { s.loading = true; })
      .addCase(fetchWatchlist.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.data || []; })
      .addCase(fetchWatchlist.rejected, (s) => { s.loading = false; })
      .addCase(addToWatchlist.fulfilled, (s, a) => { s.items.unshift(a.payload); })
      .addCase(removeFromWatchlist.fulfilled, (s, a) => {
        s.items = s.items.filter((i) => i.movieId !== a.payload);
      })
      .addCase(toggleFavorite.fulfilled, (s, a) => {
        const item = s.items.find((i) => i.movieId === a.payload.data?.movieId);
        if (item) item.isFavorite = a.payload.isFavorite;
      });
  },
});

// ─────────────────────────────────────────────────────────────
// uiSlice.js
import { createSlice as createUSlice } from '@reduxjs/toolkit';

const uiSlice = createUSlice({
  name: 'ui',
  initialState: {
    searchOpen: false,
    mobileMenuOpen: false,
    trailerOpen: false,
    trailerKey: null,
  },
  reducers: {
    toggleSearch: (s) => { s.searchOpen = !s.searchOpen; },
    toggleMobileMenu: (s) => { s.mobileMenuOpen = !s.mobileMenuOpen; },
    openTrailer: (s, a) => { s.trailerOpen = true; s.trailerKey = a.payload; },
    closeTrailer: (s) => { s.trailerOpen = false; s.trailerKey = null; },
  },
});

// ✅ FIX: Only ONE default export, rest are named exports
export const { clearDetails, clearSearch } = movieSlice.actions;
export const { toggleSearch, toggleMobileMenu, openTrailer, closeTrailer } = uiSlice.actions;
export const watchlistReducer = watchlistSlice.reducer;
export const uiReducer = uiSlice.reducer;
export default movieSlice.reducer;