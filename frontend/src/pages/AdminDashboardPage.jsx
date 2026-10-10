import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  DollarSign, 
  CreditCard, 
  Users, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  Edit3, 
  Eye, 
  ArrowLeft,
  Search,
  Check,
  Power,
  Trash2,
  Image as ImageIcon,
  Building2,
  MapPin,
  X
} from 'lucide-react';
import { 
  fetchFinancialDashboard, 
  fetchPayments, 
  updatePaymentStatus, 
  fetchAdminUsers, 
  updateUserByAdmin, 
  updateSettings 
} from '../store/slices/adminSlice';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminDashboardPage({ onGoBack, onGoHome, onSelectListing }) {
  const dispatch = useDispatch();
  const { t, getCategoryTitle, isAmharic } = useLanguage();
  const { dashboardData, payments, users, loading } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState('financials'); // 'financials', 'payments', 'pricing', 'users', 'categories', 'listings'
  
  // Settings Form State
  const [payToPostEnabled, setPayToPostEnabled] = useState(false);
  const [postingFee, setPostingFee] = useState(200);
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Category Management State
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameAm, setNewCatNameAm] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [newCatImage, setNewCatImage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // User Filter & Edit State
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Listings Management State
  const [adminListings, setAdminListings] = useState([]);
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [loadingListings, setLoadingListings] = useState(false);

  // Receipt Preview Lightbox
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);

  useEffect(() => {
    dispatch(fetchFinancialDashboard());
    dispatch(fetchPayments());
    dispatch(fetchAdminUsers());
    loadCategories();
    loadAdminListings();
  }, [dispatch]);

  // Sync settings when dashboard data arrives
  useEffect(() => {
    if (dashboardData?.settings) {
      setPayToPostEnabled(dashboardData.settings.pay_to_post_enabled === 'true');
      setPostingFee(parseFloat(dashboardData.settings.posting_fee_amount) || 200);
      setPaymentInstructions(dashboardData.settings.payment_instructions || '');
    }
  }, [dashboardData]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/admin');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to load admin categories:', err);
    }
  };

  const loadAdminListings = async () => {
    try {
      setLoadingListings(true);
      const res = await api.get('/admin/listings');
      setAdminListings(res.data.listings || []);
    } catch (err) {
      console.error('Failed to load admin listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await dispatch(updateSettings({
      pay_to_post_enabled: payToPostEnabled ? 'true' : 'false',
      posting_fee_amount: String(postingFee),
      payment_instructions: paymentInstructions
    }));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handlePaymentDecision = async (id, status) => {
    await dispatch(updatePaymentStatus({ id, status, admin_notes: `Processed via Admin Portal` }));
    dispatch(fetchFinancialDashboard());
    dispatch(fetchPayments());
    loadAdminListings();
  };

  const handleToggleUserActive = async (u) => {
    await dispatch(updateUserByAdmin({
      id: u.id,
      is_active: !u.is_active
    }));
    dispatch(fetchAdminUsers());
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        phone: editingUser.phone,
        role: editingUser.role,
        is_active: editingUser.is_active,
        bio: editingUser.bio
      });
      setEditingUser(null);
      dispatch(fetchAdminUsers());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;

    try {
      await api.post('/categories', {
        name: newCatName,
        name_am: newCatNameAm.trim() || null,
        slug: newCatSlug,
        icon_name: newCatIcon,
        image_url: newCatImage.trim() || null
      });
      setNewCatName('');
      setNewCatNameAm('');
      setNewCatSlug('');
      setNewCatImage('');
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleSaveCategoryEdit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await api.put(`/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        name_am: editingCategory.name_am ? editingCategory.name_am.trim() : null,
        slug: editingCategory.slug,
        description: editingCategory.description,
        icon_name: editingCategory.icon_name,
        image_url: editingCategory.image_url,
        is_active: editingCategory.is_active
      });
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleToggleCategory = async (cat) => {
    try {
      await api.put(`/categories/${cat.id}`, { is_active: !cat.is_active });
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating category');
    }
  };

  const handleUpdateListingStatus = async (id, status) => {
    try {
      await api.put(`/admin/listings/${id}/status`, { status });
      loadAdminListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      loadAdminListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-neutral-900 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 pb-5 sm:pb-6">
          <div>
            <button
              type="button"
              onClick={() => {
                if (onGoBack) onGoBack();
                else if (onGoHome) onGoHome();
                else window.history.back();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-600 transition-colors mb-2 group font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-amber-600" />
              <span>{t('back')}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black text-neutral-950 font-sans">
                    {t('adminTitle')}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-800 shrink-0">
                    Terminal Guard
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isAmharic 
                    ? 'የገንዘብ፣ የክፍያ ማረጋገጫዎች፣ የኪራይ ማስታወቂያዎች፣ የዘርፎች እና የተጠቃሚዎች አስተዳደር ማዕከል' 
                    : 'Financials, payment approval pipeline, rental posts moderation, categories, and user administration'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Horizontal swipeable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200 no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: 'financials', label: t('adminFinancials'), icon: DollarSign },
            { id: 'listings', label: t('adminListings'), icon: Building2, badge: adminListings.length },
            { id: 'categories', label: t('adminCategories'), icon: Layers, badge: categories.length },
            { id: 'users', label: t('adminUsers'), icon: Users, badge: users.length },
            { id: 'payments', label: t('adminPayments'), icon: CreditCard, badge: dashboardData?.financials?.pendingCount },
            { id: 'pricing', label: t('adminMonetization'), icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:text-neutral-950 hover:bg-neutral-100 shadow-2xs'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-black rounded-full ${
                    isActive ? 'bg-neutral-950 text-amber-400' : 'bg-amber-500 text-neutral-950'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: FINANCIAL DASHBOARD */}
        {activeTab === 'financials' && (
          <div className="space-y-6 sm:space-y-8">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              
              {/* Total Revenue */}
              <div className="card-obsidian border-amber-500/30 p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total Revenue
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="text-xl sm:text-3xl font-black text-neutral-950 font-sans">
                  {Number(dashboardData?.financials?.totalRevenue || 0).toLocaleString()} <span className="text-xs sm:text-sm font-bold text-amber-600">ETB</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 sm:mt-2">
                  Verified posting fees collected
                </p>
              </div>

              {/* Pending Approvals */}
              <div className="card-obsidian p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Pending Volume
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="text-xl sm:text-3xl font-black text-amber-600 font-sans">
                  {Number(dashboardData?.financials?.pendingAmount || 0).toLocaleString()} <span className="text-xs sm:text-sm font-bold text-neutral-950">ETB</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-700 mt-1 sm:mt-2 font-medium">
                  {dashboardData?.financials?.pendingCount || 0} transaction(s) pending
                </p>
              </div>

              {/* Approved Transactions */}
              <div className="card-obsidian p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Approved
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="text-xl sm:text-3xl font-black text-neutral-950 font-sans">
                  {dashboardData?.counts?.approvedListings || 0}
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 sm:mt-2">
                  Live on marketplace
                </p>
              </div>

              {/* Registered Clients */}
              <div className="card-obsidian p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Accounts
                  </span>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <div className="text-xl sm:text-3xl font-black text-neutral-950 font-sans">
                  {dashboardData?.counts?.totalUsers || 0}
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 sm:mt-2">
                  Total registered clients
                </p>
              </div>

            </div>

            {/* Recent Payments Table */}
            <div className="card-obsidian space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-base font-bold text-neutral-950 font-sans">
                  Recent Financial Transactions
                </h3>
                <span className="text-xs text-amber-600 font-semibold">
                  Direct Ledger
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Listing Target</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {dashboardData?.recentPayments?.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-neutral-950">
                          <div>{p.user_name}</div>
                          <div className="text-[10px] text-neutral-500 font-normal">{p.user_phone || p.user_email}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-700 truncate max-w-xs">{p.listing_title || 'Rental Post'}</td>
                        <td className="py-3 px-4 font-bold text-amber-600">{Number(p.amount).toLocaleString()} ETB</td>
                        <td className="py-3 px-4 text-neutral-700">{p.payment_method}</td>
                        <td className="py-3 px-4 font-mono text-neutral-600">{p.transaction_reference || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            p.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                              : p.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-300'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT APPROVALS QUEUE */}
        {activeTab === 'payments' && (
          <div className="card-obsidian space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-950 font-sans">
                Pending Payment Verifications
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                When you approve a payment, the associated rental listing is automatically marked <strong>Approved</strong> and published live.
              </p>
            </div>

            {payments.filter(p => p.status === 'pending').length === 0 ? (
              <div className="py-16 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-neutral-950">Queue Cleared</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  There are no pending user payments awaiting admin approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.filter(p => p.status === 'pending').map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-neutral-50 border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-neutral-950">
                          Pending Approval
                        </span>
                        <span className="text-xs font-bold text-neutral-950">{p.user_name}</span>
                        <span className="text-xs text-neutral-500">• {p.user_phone}</span>
                      </div>

                      <h4 className="text-base font-bold text-amber-700">
                        Listing: {p.listing_title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                        <span>Method: <strong className="text-neutral-950">{p.payment_method}</strong></span>
                        <span>Reference: <strong className="text-neutral-950 font-mono">{p.transaction_reference || 'N/A'}</strong></span>
                        <span>Amount: <strong className="text-amber-600 font-bold">{Number(p.amount).toLocaleString()} ETB</strong></span>
                      </div>

                      {p.receipt_image_url && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(p.receipt_image_url)}
                            className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Submitted Receipt Screenshot</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-200">
                      <button
                        onClick={() => handlePaymentDecision(p.id, 'rejected')}
                        className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-rose-50 text-rose-600 border border-neutral-250 hover:border-rose-300 text-xs font-bold transition-all"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handlePaymentDecision(p.id, 'approved')}
                        className="btn-gold text-xs py-2.5 px-6 font-bold flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Approve & Publish Listing</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MONETIZATION & PRICING SETTINGS */}
        {activeTab === 'pricing' && (
          <div className="card-obsidian max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-950 font-sans">
                Monetization & Listing Fee Control
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Toggle pay-to-post requirement and specify listing fee in Ethiopian Birr.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Monetization settings saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Pay to Post ON/OFF Switch */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-950">
                    Pay-to-Post Requirement
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {payToPostEnabled 
                      ? 'ON: Users must pay fee and await admin approval before post goes live.' 
                      : 'OFF (Free): Users post rentals immediately for free to maximize platform growth.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPayToPostEnabled(!payToPostEnabled)}
                  className={`w-14 h-8 rounded-full p-1 transition-all ${
                    payToPostEnabled ? 'bg-amber-500 shadow-xs' : 'bg-neutral-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-xs transition-transform ${
                    payToPostEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Posting Fee Amount in ETB */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  Posting Fee Amount (ETB)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={postingFee}
                    onChange={(e) => setPostingFee(e.target.value)}
                    className="input-luxury text-sm font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600">
                    ETB
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Charged per listing when Pay-to-Post is enabled.
                </p>
              </div>

              {/* Payment Instructions Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  Payment Account Instructions (Displayed to Users)
                </label>
                <textarea
                  rows={3}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  className="input-luxury text-xs"
                />
              </div>

              <button
                type="submit"
                className="btn-gold text-xs py-3 px-8 font-bold"
              >
                Save Monetization Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB: RENTAL POSTS & LISTINGS */}
        {activeTab === 'listings' && (
          <div className="card-obsidian space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-950 font-sans flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  <span>All User Rental Posts & Moderation</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Inspect all properties, vehicles, and equipment posted by clients. Approve, reject, or delete.
                </p>
              </div>

              {/* Search & Status Filter */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search posts, city, owner..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="input-luxury pl-9 py-2 text-xs"
                  />
                </div>

                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value)}
                  className="input-luxury py-2 text-xs w-36 cursor-pointer"
                >
                  <option value="all" className="bg-white text-neutral-900">All Statuses</option>
                  <option value="approved" className="bg-white text-neutral-900">Approved</option>
                  <option value="pending" className="bg-white text-neutral-900">Pending</option>
                  <option value="rejected" className="bg-white text-neutral-900">Rejected</option>
                  <option value="rented" className="bg-white text-neutral-900">Rented</option>
                </select>
              </div>
            </div>

            {loadingListings ? (
              <div className="py-12 text-center text-neutral-500 text-xs">Loading rental posts...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Rental Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Rate</th>
                      <th className="py-3 px-4">Owner / Contact</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {loadingListings ? (
                      [1, 2, 3, 4, 5].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-neutral-200 skeleton-shimmer shrink-0" />
                              <div className="space-y-1.5">
                                <div className="h-3.5 w-36 rounded bg-neutral-200 skeleton-shimmer" />
                                <div className="h-2.5 w-20 rounded bg-neutral-100 skeleton-shimmer" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-3 w-16 rounded bg-amber-500/20 skeleton-shimmer" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-3.5 w-20 rounded bg-neutral-200 skeleton-shimmer" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-3.5 w-24 rounded bg-neutral-200 skeleton-shimmer" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-3 w-20 rounded bg-neutral-100 skeleton-shimmer" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-5 w-16 rounded-full bg-neutral-200 skeleton-shimmer" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-7 w-24 rounded-lg bg-neutral-200 skeleton-shimmer" />
                          </td>
                        </tr>
                      ))
                    ) : adminListings
                      .filter((l) => {
                        const matchSearch =
                          !listingSearch ||
                          l.title?.toLowerCase().includes(listingSearch.toLowerCase()) ||
                          l.city?.toLowerCase().includes(listingSearch.toLowerCase()) ||
                          l.owner_name?.toLowerCase().includes(listingSearch.toLowerCase());
                        const matchStatus =
                          listingStatusFilter === 'all' || l.status === listingStatusFilter;
                        return matchSearch && matchStatus;
                      })
                      .map((l) => {
                        const thumb =
                          l.images && l.images.length > 0 && l.images[0].image_url
                            ? l.images[0].image_url
                            : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

                        return (
                          <tr key={l.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={thumb}
                                  alt={l.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-neutral-950 max-w-xs truncate">{l.title}</div>
                                  <div className="text-[11px] text-neutral-500">{new Date(l.created_at).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-amber-700 font-semibold">
                              {l.category_name || 'General'}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-white">
                                {Number(l.rental_price).toLocaleString()} <span className="text-[10px] text-amber-400">ETB</span>
                              </div>
                              <div className="text-[10px] text-neutral-400">per {l.price_period}</div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{l.owner_name || 'Unknown'}</div>
                              <div className="text-[11px] text-neutral-400">{l.owner_phone || l.contact_phone}</div>
                            </td>

                            <td className="py-3 px-4 text-neutral-300">
                              {l.city}{l.subcity ? `, ${l.subcity}` : ''}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] flex items-center gap-1 w-fit ${
                                l.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : l.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : l.status === 'rented'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}>
                                {l.status}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {l.status !== 'approved' && (
                                  <button
                                    onClick={() => handleUpdateListingStatus(l.id, 'approved')}
                                    className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]"
                                    title="Approve post"
                                  >
                                    Approve
                                  </button>
                                )}
                                {l.status !== 'rejected' && (
                                  <button
                                    onClick={() => handleUpdateListingStatus(l.id, 'rejected')}
                                    className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold border border-rose-500/30 text-[10px]"
                                    title="Reject post"
                                  >
                                    Reject
                                  </button>
                                )}
                                {l.status === 'approved' && (
                                  <button
                                    onClick={() => handleUpdateListingStatus(l.id, 'rented')}
                                    className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold border border-blue-500/30 text-[10px]"
                                    title="Mark as Rented"
                                  >
                                    Mark Rented
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteListing(l.id)}
                                  className="p-1 rounded bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-800"
                                  title="Delete post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="card-obsidian space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-sans">
                  User Directory & Access Control
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  View registered clients, edit user details & roles, and toggle Active/Inactive account states.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input-luxury pl-9 py-2 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Listings</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-950">{u.name}</div>
                            <div className="text-[11px] text-neutral-500">{u.email} • {u.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          u.role === 'admin' 
                            ? 'bg-amber-50 text-amber-800 border border-amber-300' 
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-neutral-950">
                        {u.listings_count || 0}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] flex items-center gap-1 w-fit ${
                          u.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{u.is_active ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-250 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleToggleUserActive(u)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                              u.is_active 
                                ? 'bg-neutral-100 text-rose-600 border border-neutral-250 hover:bg-rose-50' 
                                : 'bg-amber-500 text-neutral-950 shadow-xs'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create Category Form */}
            <div className="card-obsidian space-y-4">
              <h3 className="text-base font-bold text-neutral-950 font-sans flex items-center gap-2 border-b border-neutral-200 pb-3">
                <PlusCircle className="w-4 h-4 text-amber-500" />
                <span>Add Rental Category</span>
              </h3>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Category Name (English)</span>
                    <span className="text-[10px] text-amber-600 font-mono font-bold">Required</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury Yachts & Boats"
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }}
                    className="input-luxury text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>የዘርፉ የአማርኛ ስም (Amharic Name)</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">አማራጭ (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ምሳሌ፦ የቅንጦት ጀልባዎች"
                    value={newCatNameAm}
                    onChange={(e) => setNewCatNameAm(e.target.value)}
                    className="input-luxury text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="input-luxury text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Category Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newCatImage}
                    onChange={(e) => setNewCatImage(e.target.value)}
                    className="input-luxury text-xs font-mono"
                  />
                  {newCatImage && (
                    <div className="mt-2 relative rounded-lg overflow-hidden h-24 border border-neutral-200">
                      <img src={newCatImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Lucide Icon Identifier
                  </label>
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="Home" className="bg-white text-neutral-900">Home (Houses)</option>
                    <option value="Car" className="bg-white text-neutral-900">Car (Vehicles)</option>
                    <option value="Building2" className="bg-white text-neutral-900">Building2 (Commercial)</option>
                    <option value="Truck" className="bg-white text-neutral-900">Truck (Heavy Machinery)</option>
                    <option value="Sparkles" className="bg-white text-neutral-900">Sparkles (Events & Venues)</option>
                    <option value="Wrench" className="bg-white text-neutral-900">Wrench (Tools & Equipment)</option>
                    <option value="Layers" className="bg-white text-neutral-900">Layers (General)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full btn-gold text-xs py-2.5 font-bold"
                >
                  Create Category
                </button>
              </form>
            </div>

            {/* Existing Categories List */}
            <div className="lg:col-span-2 card-obsidian space-y-4">
              <h3 className="text-base font-bold text-neutral-950 font-sans border-b border-neutral-200 pb-3 flex items-center justify-between">
                <span>Existing Categories ({categories.length})</span>
                <span className="text-xs text-neutral-500 font-normal">Images & Live Controls</span>
              </h3>

              <div className="space-y-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-neutral-950 truncate">{c.name}</span>
                          {c.name_am && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                              {c.name_am}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-neutral-500">({c.slug})</span>
                        </div>
                        <p className="text-xs text-neutral-600">
                          Total Listings: <strong className="text-amber-600 font-bold">{c.total_listings_count || 0}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setEditingCategory({ ...c })}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold border border-neutral-250 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleToggleCategory(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          c.is_active 
                            ? 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-250' 
                            : 'bg-amber-500 text-neutral-950 font-bold'
                        }`}
                      >
                        {c.is_active ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 rounded-lg bg-neutral-100 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-250"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Edit Category</span>
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Category Name (English)</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="input-luxury text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1 flex items-center justify-between">
                  <span>የምድቡ የአማርኛ ስም (Amharic Name)</span>
                  <span className="text-[10px] text-amber-600 font-bold">አማራጭ (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="ምሳሌ፦ የመኖሪያ ቤቶች እና ቪላዎች"
                  value={editingCategory.name_am || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_am: e.target.value })}
                  className="input-luxury text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="input-luxury text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  className="input-luxury text-xs font-mono"
                />
                {editingCategory.image_url && (
                  <div className="mt-2 rounded-lg overflow-hidden h-24 border border-neutral-200">
                    <img src={editingCategory.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="input-luxury text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-2 rounded-xl bg-neutral-100 text-neutral-700 font-bold border border-neutral-250 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Edit User Profile & Role</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="input-luxury text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="input-luxury text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="input-luxury text-xs cursor-pointer"
                >
                  <option value="user" className="bg-white text-neutral-900">User (Standard Client)</option>
                  <option value="admin" className="bg-white text-neutral-900">Admin (Full Controls)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-2">
                <label className="text-neutral-700 font-semibold">Account Active Status:</label>
                <button
                  type="button"
                  onClick={() => setEditingUser({ ...editingUser, is_active: !editingUser.is_active })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    editingUser.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'
                  }`}
                >
                  {editingUser.is_active ? 'Active' : 'Deactivated'}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 rounded-xl bg-neutral-100 text-neutral-700 font-bold border border-neutral-250 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2 font-bold"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Image Lightbox Modal */}
      {previewReceiptUrl && (
        <div 
          className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex items-center justify-center p-4 bg-neutral-900/80 backdrop-blur-md"
          onClick={() => setPreviewReceiptUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-white border border-neutral-200 rounded-3xl overflow-hidden p-2 shadow-2xl">
            <img src={previewReceiptUrl} alt="Receipt Screenshot" className="w-full h-auto rounded-2xl" />
            <div className="p-3 text-center">
              <span className="text-xs text-neutral-600 font-semibold">Click anywhere to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
