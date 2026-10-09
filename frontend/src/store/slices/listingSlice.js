import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCategories = createAsyncThunk('listings/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data.categories;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load categories');
  }
});

export const fetchListings = createAsyncThunk('listings/fetchListings', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/listings', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load listings');
  }
});

export const fetchSavedListings = createAsyncThunk('listings/fetchSavedListings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/listings/saved');
    return res.data.listings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load saved listings');
  }
});

export const toggleSave = createAsyncThunk('listings/toggleSave', async (listingId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/listings/${listingId}/save`);
    return { listingId, saved: res.data.saved };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to toggle save');
  }
});

export const fetchMyListings = createAsyncThunk('listings/fetchMyListings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/listings/my-listings');
    return res.data.listings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load user listings');
  }
});

export const createNewListing = createAsyncThunk('listings/createNewListing', async (listingData, { rejectWithValue }) => {
  try {
    const res = await api.post('/listings', listingData);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create listing');
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
    savedItems: [],
    myListings: [],
    selectedListing: null,
    loading: false,
    categoriesLoading: false,
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
    builder.addCase(fetchListings.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchListings.fulfilled, (state, action) => {
      state.items = action.payload.listings;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.loading = false;
    });
    builder.addCase(fetchListings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Saved Listings
    builder.addCase(fetchSavedListings.fulfilled, (state, action) => {
      state.savedItems = action.payload;
    });
    builder.addCase(toggleSave.fulfilled, (state, action) => {
      const { listingId, saved } = action.payload;
      if (!saved) {
        state.savedItems = state.savedItems.filter(item => item.id !== listingId);
      }
    });

    // My Listings
    builder.addCase(fetchMyListings.fulfilled, (state, action) => {
      state.myListings = action.payload;
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
