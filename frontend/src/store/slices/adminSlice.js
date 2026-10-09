import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFinancialDashboard = createAsyncThunk('admin/fetchFinancialDashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/financial-dashboard');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load financial dashboard');
  }
});

export const fetchPayments = createAsyncThunk('admin/fetchPayments', async (status = '', { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/payments', { params: { status: status || undefined } });
    return res.data.payments;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load payments');
  }
});

export const updatePaymentStatus = createAsyncThunk('admin/updatePaymentStatus', async ({ id, status, admin_notes }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/payments/${id}/status`, { status, admin_notes });
    return res.data.payment;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update payment status');
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchAdminUsers', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/users', { params });
    return res.data.users;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load users');
  }
});

export const updateUserByAdmin = createAsyncThunk('admin/updateUserByAdmin', async ({ id, is_active, name, phone, bio }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/users/${id}`, { is_active, name, phone, bio });
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update user');
  }
});

export const updateSettings = createAsyncThunk('admin/updateSettings', async (settingsData, { rejectWithValue }) => {
  try {
    const res = await api.put('/admin/settings', settingsData);
    return res.data.settings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    dashboardData: null,
    payments: [],
    users: [],
    loading: false,
    error: null,
    statusFilter: 'all'
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Financial Dashboard
    builder.addCase(fetchFinancialDashboard.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFinancialDashboard.fulfilled, (state, action) => {
      state.dashboardData = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchFinancialDashboard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Payments
    builder.addCase(fetchPayments.fulfilled, (state, action) => {
      state.payments = action.payload;
    });

    // Update Payment
    builder.addCase(updatePaymentStatus.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.payments.findIndex(p => p.id === updated.id);
      if (index !== -1) {
        state.payments[index] = { ...state.payments[index], ...updated };
      }
    });

    // Users
    builder.addCase(fetchAdminUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });

    // Update User
    builder.addCase(updateUserByAdmin.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.users.findIndex(u => u.id === updated.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...updated };
      }
    });

    // Update Settings
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      if (state.dashboardData) {
        state.dashboardData.settings = action.payload;
      }
    });
  }
});

export const { setStatusFilter } = adminSlice.actions;
export default adminSlice.reducer;
