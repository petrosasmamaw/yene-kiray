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
import { useLanguage } from '../context/LanguageContext';

export default function MyListingsPage({ onNavigatePost, onSelectListing, onGoBack, onGoHome }) {
  const dispatch = useDispatch();
  const { t, getCategoryTitle, isAmharic } = useLanguage();
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
    if (!window.confirm(t('deleteConfirm'))) return;
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
    <div className="min-h-screen bg-[#f4f5f7] text-neutral-900 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5 sm:pb-6">
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
                <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 font-sans leading-tight">
                  {t('myListingsTitle')}
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t('myListingsSubtitle')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigatePost}
            className="w-full sm:w-auto btn-gold text-xs py-2.5 px-5 font-bold justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('myListingsPostAnother')}</span>
          </button>
        </div>

        {/* Newly Added Listing Success Notification */}
        {postSuccessData && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>{t('myListingsNewAdded')}</strong> {isAmharic ? 'የለጠፉት ኪራይ' : 'Your rental post'} <strong className="text-neutral-950 font-bold">"{postSuccessData.listing?.title}"</strong> {isAmharic ? 'በተሳካ ሁኔታ ወደ ማስታወቂያዎችዎ ገብቷል!' : 'has been successfully added to your listings!'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(clearPostSuccessData())}
              className="text-neutral-500 hover:text-neutral-800 p-1"
              title={t('close')}
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
                className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 animate-pulse shadow-xs w-full max-w-full min-w-0 overflow-hidden"
              >
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full flex-1 min-w-0 overflow-hidden">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-200 skeleton-shimmer shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0 overflow-hidden">
                    <div className="h-4 w-20 rounded bg-neutral-200 skeleton-shimmer" />
                    <div className="h-4 w-full max-w-xs rounded bg-neutral-200 skeleton-shimmer" />
                    <div className="h-3 w-32 rounded bg-neutral-200 skeleton-shimmer" />
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="h-8 w-24 rounded-xl bg-neutral-200 skeleton-shimmer" />
                  <div className="h-8 w-20 rounded-xl bg-neutral-200 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <Layers className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-950 mb-1">{t('myListingsNoneTitle')}</h3>
            <p className="text-xs text-neutral-500 mb-6">
              {t('myListingsNoneDesc')}
            </p>
            <button
              onClick={onNavigatePost}
              className="btn-gold text-xs py-2.5 px-6 font-bold"
            >
              {t('myListingsPostFirst')}
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
                  className="bg-white border border-neutral-200 hover:border-amber-500/50 rounded-2xl p-3.5 sm:p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-xs w-full max-w-full min-w-0 overflow-hidden"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 w-full flex-1 min-w-0 overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={listing.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-neutral-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5 overflow-hidden">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 shrink-0">
                          {isAmharic && listing.category_name_am ? listing.category_name_am : (listing.category_name || (isAmharic ? 'ኪራይ' : 'Rental'))}
                        </span>
                        
                        {/* Status Chip */}
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                          listing.status === 'approved'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : listing.status === 'pending'
                            ? 'bg-amber-50 border border-amber-200 text-amber-800'
                            : 'bg-rose-50 border border-rose-200 text-rose-700'
                        }`}>
                          {listing.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {listing.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          {listing.status === 'rejected' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          <span>{listing.status === 'approved' ? t('statusApproved') : listing.status === 'pending' ? t('statusPending') : listing.status === 'rejected' ? t('statusRejected') : listing.status}</span>
                        </span>
                      </div>

                      {/* Product Name: Fully Contained, Wraps Elegantly Inside Card Box */}
                      <h3 className="text-sm sm:text-base font-bold text-neutral-950 leading-snug break-words [overflow-wrap:anywhere] [word-break:break-word] w-full min-w-0 line-clamp-2">
                        {listing.title}
                      </h3>

                      <div className="flex items-center gap-3 sm:gap-4 text-xs text-neutral-500 flex-wrap min-w-0">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{listing.city}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{new Date(listing.created_at || Date.now()).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                    <div className="flex items-center justify-between sm:block text-left md:text-right">
                      <p className="text-[11px] text-neutral-500 uppercase font-semibold">{isAmharic ? 'የኪራይ ክፍያ' : 'Rent Rate'}</p>
                      <p className="text-base sm:text-lg font-black text-amber-600">
                        {Number(listing.rental_price).toLocaleString()} <span className="text-xs text-neutral-900 font-bold">{t('etb')}/{listing.price_period === 'day' ? t('periodDay') : listing.price_period === 'hour' ? t('periodHour') : listing.price_period === 'year' ? t('periodYear') : t('periodMonth')}</span>
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
                          <span>{isAmharic ? 'የክፍያ ማረጋገጫ' : 'Proof'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setEditingListing({ ...listing })}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 border border-neutral-250 flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('edit')}</span>
                      </button>

                      <button
                        onClick={() => onSelectListing(listing)}
                        className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-800 border border-neutral-250 text-center"
                      >
                        {t('detailsButton')}
                      </button>

                      <button
                        onClick={() => handleDeleteListing(listing.id)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-250"
                        title={t('delete')}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>{isAmharic ? 'የኪራይ ማስታወቂያ ማስተካከያ' : 'Edit Rental Listing'}</span>
              </h3>
              <button
                onClick={() => setEditingListing(null)}
                className="p-1 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveListingEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelTitle')}</label>
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
                  <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelPrice')}</label>
                  <input
                    type="number"
                    required
                    value={editingListing.rental_price}
                    onChange={(e) => setEditingListing({ ...editingListing, rental_price: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelPeriod')}</label>
                  <select
                    value={editingListing.price_period}
                    onChange={(e) => setEditingListing({ ...editingListing, price_period: e.target.value })}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="month" className="bg-white text-neutral-900">{t('periodMonth')}</option>
                    <option value="day" className="bg-white text-neutral-900">{t('periodDay')}</option>
                    <option value="year" className="bg-white text-neutral-900">{t('periodYear')}</option>
                    <option value="hour" className="bg-white text-neutral-900">{t('periodHour')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelCategory')}</label>
                  <select
                    value={editingListing.category_id || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, category_id: e.target.value })}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="" className="bg-white text-neutral-900">{isAmharic ? 'የኪራይ ዘርፍ ይምረጡ' : 'Select Category'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white text-neutral-900">{getCategoryTitle(c)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{isAmharic ? 'የማስታወቂያ ሁኔታ' : 'Availability Status'}</label>
                  <select
                    value={editingListing.status}
                    onChange={(e) => setEditingListing({ ...editingListing, status: e.target.value })}
                    className="input-luxury text-xs cursor-pointer"
                  >
                    <option value="approved" className="bg-white text-neutral-900">{isAmharic ? 'ክፍት / የሚከራይ' : 'Available (Approved)'}</option>
                    <option value="rented" className="bg-white text-neutral-900">{isAmharic ? 'ተከራይቷል' : 'Marked as Rented'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelCity')}</label>
                  <input
                    type="text"
                    required
                    value={editingListing.city}
                    onChange={(e) => setEditingListing({ ...editingListing, city: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelSubcity')}</label>
                  <input
                    type="text"
                    value={editingListing.subcity || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, subcity: e.target.value })}
                    className="input-luxury text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelPhone')}</label>
                <input
                  type="text"
                  required
                  value={editingListing.contact_phone}
                  onChange={(e) => setEditingListing({ ...editingListing, contact_phone: e.target.value })}
                  className="input-luxury text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">{t('postLabelDesc')}</label>
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
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-bold border border-neutral-250 hover:bg-neutral-200"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 font-bold"
                >
                  {t('save')}
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
