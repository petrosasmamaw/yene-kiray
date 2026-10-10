import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Layers, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ArrowLeft,
  Eye,
  MapPin,
  Calendar,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { fetchMyListings, clearPostSuccessData } from '../store/slices/listingSlice';
import PaymentModal from '../components/PaymentModal';
import api from '../services/api';

export default function MyListingsPage({ onNavigatePost, onSelectListing, onGoBack, onGoHome }) {
  const dispatch = useDispatch();
  const { myListings, myListingsLoading, postSuccessData } = useSelector((state) => state.listings);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [paymentTarget, setPaymentTarget] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (isAuthenticated) {
      dispatch(fetchMyListings());
      api.get('/categories').then(res => setCategories(res.data.categories || [])).catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  const handlePaymentSuccess = () => {
    setPaymentTarget(null);
    dispatch(fetchMyListings());
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      dispatch(fetchMyListings());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const handleSaveListingEdit = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    try {
      await api.put(`/listings/${editingListing.id}`, {
        title: editingListing.title,
        rental_price: editingListing.rental_price,
        price_period: editingListing.price_period,
        category_id: editingListing.category_id,
        city: editingListing.city,
        subcity: editingListing.subcity,
        contact_phone: editingListing.contact_phone,
        description: editingListing.description,
        status: editingListing.status
      });
      setEditingListing(null);
      dispatch(fetchMyListings());
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update listing');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 sm:pb-6">
          <div>
            <button
              type="button"
              onClick={() => {
                if (onGoBack) onGoBack();
                else if (onGoHome) onGoHome();
                else window.history.back();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-sans leading-tight">
                  My Posted Rentals
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage your posted properties, vehicles, and track admin approval
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigatePost}
            className="w-full sm:w-auto btn-gold text-xs py-2.5 px-5 font-bold justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Another Rental</span>
          </button>
        </div>

        {/* Newly Added Listing Success Notification */}
        {postSuccessData && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-gold-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Listing Added!</strong> Your rental post <strong className="text-white">"{postSuccessData.listing?.title}"</strong> has been successfully added to your listings!
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(clearPostSuccessData())}
              className="text-neutral-400 hover:text-white p-1"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Listings Content */}
        {myListingsLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((n) => (
              <div 
                key={n} 
                className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 animate-pulse"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white/[0.05] skeleton-shimmer shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-20 rounded bg-white/[0.08] skeleton-shimmer" />
                    <div className="h-4 w-48 sm:w-64 rounded bg-white/[0.07] skeleton-shimmer" />
                    <div className="h-3 w-32 rounded bg-white/[0.05] skeleton-shimmer" />
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="h-8 w-24 rounded-xl bg-white/[0.05] skeleton-shimmer" />
                  <div className="h-8 w-20 rounded-xl bg-white/[0.05] skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-[#0D0D0D] border border-neutral-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md mx-auto">
            <Layers className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Listings Yet</h3>
            <p className="text-xs text-neutral-400 mb-6">
              You haven't posted any rental items yet. Share your house, car, or tools to reach thousands of renters.
            </p>
            <button
              onClick={onNavigatePost}
              className="btn-gold text-xs py-2.5 px-6 font-bold"
            >
              Post a Rent Now
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {myListings.map((listing) => {
              const primaryImg = listing.images && listing.images.length > 0 
                ? listing.images[0].image_url 
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={listing.id}
                  className="bg-[#0D0D0D] border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-3.5 sm:p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={primaryImg}
                      alt={listing.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-400">
                          {listing.category_name || 'Rental'}
                        </span>
                        
                        {/* Status Chip */}
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          listing.status === 'approved'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : listing.status === 'pending'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                        }`}>
                          {listing.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                          {listing.status === 'pending' && <Clock className="w-3 h-3" />}
                          {listing.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                          <span>{listing.status}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white truncate max-w-lg">
                        {listing.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          <span>{listing.city}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{new Date(listing.created_at || Date.now()).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
                    <div className="flex items-center justify-between sm:block text-left md:text-right">
                      <p className="text-[11px] text-neutral-500 uppercase font-semibold">Rent Rate</p>
                      <p className="text-base sm:text-lg font-black text-amber-400">
                        {Number(listing.rental_price).toLocaleString()} <span className="text-xs text-white">ETB/{listing.price_period}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                      {/* If status is pending & pay_to_post is active, offer payment proof button */}
                      {listing.status === 'pending' && (
                        <button
                          onClick={() => setPaymentTarget(listing)}
                          className="btn-gold text-xs py-2 px-3 font-bold flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Proof</span>
                        </button>
                      )}

                      <button
                        onClick={() => setEditingListing({ ...listing })}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-amber-400 border border-neutral-800 hover:border-amber-500/40 flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onSelectListing(listing)}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white border border-neutral-700/60 text-center"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 border border-neutral-800"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111111] border border-neutral-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Edit Rental Listing</span>
              </h3>
              <button
                onClick={() => setEditingListing(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveListingEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  value={editingListing.title}
                  onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })}
                  className="input-luxury text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Rental Price (ETB)</label>
                  <input
                    type="number"
                    required
                    value={editingListing.rental_price}
                    onChange={(e) => setEditingListing({ ...editingListing, rental_price: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Price Period</label>
                  <select
                    value={editingListing.price_period}
                    onChange={(e) => setEditingListing({ ...editingListing, price_period: e.target.value })}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="day" className="bg-[#111111]">Per Day</option>
                    <option value="month" className="bg-[#111111]">Per Month</option>
                    <option value="year" className="bg-[#111111]">Per Year</option>
                    <option value="hour" className="bg-[#111111]">Per Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Category</label>
                  <select
                    value={editingListing.category_id || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, category_id: e.target.value })}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="" className="bg-[#111111]">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#111111]">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Availability Status</label>
                  <select
                    value={editingListing.status}
                    onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="approved" className="bg-[#111111]">Available (Approved)</option>
                    <option value="rented" className="bg-[#111111]">Marked as Rented</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editingListing.city}
                    onChange={(e) => setEditingListing({ ...editingListing, city: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Subcity</label>
                  <input
                    type="text"
                    value={editingListing.subcity || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, subcity: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editingListing.contact_phone}
                  onChange={(e) => setEditingListing({ ...editingListing, contact_phone: e.target.value })}
                  className="input-luxury text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingListing.description || ''}
                  onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })}
                  className="input-luxury text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 font-bold border border-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentTarget && (
        <PaymentModal
          listing={paymentTarget}
          feeAmount={200}
          onClose={() => setPaymentTarget(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
