import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCategories = createAsyncThunk('listings/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data.categories;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to load categories');
  }
});

export const fetchListings = createAsyncThunk('listings/fetchListings', async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = { limit: 10, page: 1, ...params };
    const res = await api.get('/listings', { params: queryParams });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to load listings');
  }
});

export const fetchSavedListings = createAsyncThunk('listings/fetchSavedListings', async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = { limit: 10, page: 1, ...params };
    const res = await api.get('/listings/saved', { params: queryParams });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to load saved listings');
  }
});

export const toggleSave = createAsyncThunk('listings/toggleSave', async (listingId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/listings/${listingId}/save`);
    return { listingId, saved: res.data.saved };
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to toggle save');
  }
});

export const fetchMyListings = createAsyncThunk('listings/fetchMyListings', async (params = {}, { rejectWithValue }) => {
  try {
    const queryParams = { limit: 10, page: 1, ...params };
    const res = await api.get('/listings/my-listings', { params: queryParams });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to load user listings');
  }
});

export const createNewListing = createAsyncThunk('listings/createNewListing', async (listingData, { rejectWithValue }) => {
  try {
    const res = await api.post('/listings', listingData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.userMessage || err.response?.data?.message || 'Failed to create listing');
  }
});

const listingSlice = createSlice({
  name: 'listings',
  initialState: {
    categories: [],
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: true,
    loadingMore: false,

    savedItems: [],
    savedTotal: 0,
    savedPage: 1,
    hasMoreSaved: true,
    savedLoadingMore: false,

    myListings: [],
    myListingsTotal: 0,
    myListingsPage: 1,
    hasMoreMyListings: true,
    myListingsLoadingMore: false,

    selectedListing: null,
    loading: false,
    categoriesLoading: false,
    savedLoading: false,
    myListingsLoading: false,
    error: null,
    selectedCategory: '',
    searchQuery: '',
    postSuccessData: null
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedListing: (state, action) => {
      state.selectedListing = action.payload;
    },
    clearPostSuccessData: (state) => {
      state.postSuccessData = null;
    }
  },
  extraReducers: (builder) => {
    // Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.categoriesLoading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.categoriesLoading = false;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.categoriesLoading = false;
      state.error = action.payload;
    });

    // Public Listings
    builder.addCase(fetchListings.pending, (state, action) => {
      const isNextPage = action.meta.arg?.page && action.meta.arg.page > 1;
      if (isNextPage) {
        state.loadingMore = true;
      } else {
        state.loading = true;
        state.error = null;
      }
    });
    builder.addCase(fetchListings.fulfilled, (state, action) => {
      const isNextPage = action.meta.arg?.page && action.meta.arg.page > 1;
      const newItems = action.payload.listings || [];

      if (isNextPage) {
        const existingIds = new Set(state.items.map((i) => i.id));
        const uniqueItems = newItems.filter((i) => !existingIds.has(i.id));
        state.items = [...state.items, ...uniqueItems];
      } else {
        state.items = newItems;
      }

      state.total = action.payload.total ?? state.items.length;
      state.page = action.payload.page || 1;
      state.totalPages = action.payload.totalPages || 1;
      state.hasMore = action.payload.hasMore ?? (state.page < state.totalPages);
      state.loading = false;
      state.loadingMore = false;
    });
    builder.addCase(fetchListings.rejected, (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      state.error = action.payload;
    });

    // Saved Listings
    builder.addCase(fetchSavedListings.pending, (state, action) => {
      const isNextPage = action.meta.arg?.page && action.meta.arg.page > 1;
      if (isNextPage) {
        state.savedLoadingMore = true;
      } else {
        state.savedLoading = true;
      }
    });
    builder.addCase(fetchSavedListings.fulfilled, (state, action) => {
      const isNextPage = action.meta.arg?.page && action.meta.arg.page > 1;
      const newItems = action.payload.listings || (Array.isArray(action.payload) ? action.payload : []);

      if (isNextPage) {
        const existingIds = new Set(state.savedItems.map((i) => i.id));
        const uniqueItems = newItems.filter((i) => !existingIds.has(i.id));
        state.savedItems = [...state.savedItems, ...uniqueItems];
      } else {
        state.savedItems = newItems;
      }

      state.savedTotal = action.payload.total ?? state.savedItems.length;
      state.savedPage = action.payload.page || 1;
      state.hasMoreSaved = action.payload.hasMore ?? (newItems.length >= 10);
      state.savedLoading = false;
      state.savedLoadingMore = false;
    });
    builder.addCase(fetchSavedListings.rejected, (state) => {
      state.savedLoading = false;
      state.savedLoadingMore = false;
    });
    builder.addCase(toggleSave.fulfilled, (state, action) => {
      const { listingId, saved } = action.payload;
      if (!saved) {
        state.savedItems = state.savedItems.filter(item => String(item.id) !== String(listingId));
        if (state.savedTotal > 0) state.savedTotal--;
      } else {
        const alreadySaved = state.savedItems.some(item => String(item.id) === String(listingId));
        if (!alreadySaved) {
          const item = state.items.find(i => String(i.id) === String(listingId)) || 
                       state.myListings.find(i => String(i.id) === String(listingId)) || 
                       { id: listingId };
          state.savedItems.unshift(item);
          state.savedTotal = (state.savedTotal || 0) + 1;
        }
      }
    });

    // My Listings
    builder.addCase(fetchMyListings.pending, (state, action) => {
      const isNextPage = action.meta.arg?.page && action.meta.arg.page > 1;
      if (isNextPage) {
        state.myListingsLoadingMore = true;
      } else {
        state.myListingsLoading = true;
      }
    });
    builder.addCase(fetchMyListings.fulfilled, (state, action) => {
      const isNextPage = action.meta.arg?.page && action.meta.arg.page > 1;
      const newItems = action.payload.listings || (Array.isArray(action.payload) ? action.payload : []);

      if (isNextPage) {
        const existingIds = new Set(state.myListings.map((i) => i.id));
        const uniqueItems = newItems.filter((i) => !existingIds.has(i.id));
        state.myListings = [...state.myListings, ...uniqueItems];
      } else {
        state.myListings = newItems;
      }

      state.myListingsTotal = action.payload.total ?? state.myListings.length;
      state.myListingsPage = action.payload.page || 1;
      state.hasMoreMyListings = action.payload.hasMore ?? (newItems.length >= 10);
      state.myListingsLoading = false;
      state.myListingsLoadingMore = false;
    });
    builder.addCase(fetchMyListings.rejected, (state) => {
      state.myListingsLoading = false;
      state.myListingsLoadingMore = false;
    });

    // Create Listing
    builder.addCase(createNewListing.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNewListing.fulfilled, (state, action) => {
      state.loading = false;
      state.postSuccessData = action.payload;
      if (action.payload.listing) {
        state.myListings.unshift(action.payload.listing);
        state.items.unshift(action.payload.listing);
      }
    });
    builder.addCase(createNewListing.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const {
  setSelectedCategory,
  setSearchQuery,
  setSelectedListing,
  clearPostSuccessData
} = listingSlice.actions;

export default listingSlice.reducer;
