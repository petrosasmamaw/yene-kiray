import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Bookmark, 
  ShieldCheck, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';
import { toggleSave } from '../store/slices/listingSlice';
import { startConversation } from '../store/slices/chatSlice';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export default function ListingDetailModal({ listing, onClose, onOpenAuth }) {
  const dispatch = useDispatch();
  const { t, isAmharic, getCityTitle } = useLanguage();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { savedItems } = useSelector((state) => state.listings);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!listing) return null;

  const isSaved = savedItems.some((item) => String(item.id) === String(listing.id));
  const isOwner = user?.id === listing.user_id;
  const isAdmin = user?.role === 'admin';

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [{ image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }];

  const categoryTitle = isAmharic && listing.category_name_am 
    ? listing.category_name_am 
    : (listing.category_name || (isAmharic ? 'የኪራይ ዕቃ' : 'Rental Item'));

  const periodLabel = listing.price_period === 'day' 
    ? t('periodDay') 
    : listing.price_period === 'hour' 
    ? t('periodHour') 
    : listing.price_period === 'year' 
    ? t('periodYear') 
    : t('periodMonth');

  const toast = useToast();

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    try {
      await dispatch(startConversation(listing.id)).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
      toast.error(typeof err === 'string' ? err : (isAmharic ? 'ውይይት መጀመር አልተቻለም፤ እባክዎ የኔትወርክ ግንኙነትዎን ያረጋግጡ' : 'Could not start conversation. Please check your connection.'));
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    try {
      await dispatch(toggleSave(listing.id)).unwrap();
    } catch (err) {
      console.error('Failed to toggle save:', err);
      toast.error(typeof err === 'string' ? err : (isAmharic ? 'ማስታወቂያውን ማስቀመጥ አልተቻለም' : 'Could not save listing'));
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 sm:top-[72px] z-50 flex items-start justify-center p-0 sm:p-6 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        className="relative w-full max-w-4xl bg-white sm:border border-neutral-200/90 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl min-h-screen sm:min-h-0 sm:my-4 transition-all pb-24 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Bar: Prominent Back to Home & Details Info */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 text-neutral-800 text-xs font-semibold tracking-wide transition-all group shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('back')}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              {categoryTitle}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 border border-neutral-200 transition-colors"
              title={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Gallery Hero */}
        <div className="relative aspect-[16/9] w-full bg-neutral-100 overflow-hidden">
          <img 
            src={images[activeImageIndex]?.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'} 
            alt={listing.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
            }}
            className="w-full h-full object-cover transition-all duration-300 relative z-0"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

          {/* Gallery Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-neutral-900 border border-neutral-200 backdrop-blur-md shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-neutral-900 border border-neutral-200 backdrop-blur-md shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeImageIndex ? 'w-6 bg-amber-500' : 'w-2 bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/95 text-neutral-900 border border-neutral-200 backdrop-blur-md shadow-xs">
              {categoryTitle}
            </span>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Header Row: Title, Location & Price */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>
                  {getCityTitle(listing.city)} {listing.subcity ? `• ${listing.subcity}` : ''} {listing.specific_location ? `(${listing.specific_location})` : ''}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 font-sans">
                {listing.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAmharic ? 'የተለጠፈበት ቀን፦ ' : 'Posted '}{new Date(listing.created_at || Date.now()).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>{listing.views_count || 1} {t('viewsCount')}</span>
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-start md:items-end justify-center shrink-0 shadow-2xs">
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                {isAmharic ? 'የኪራይ ክፍያ' : 'Rental Rate'}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-amber-600">
                  {Number(listing.rental_price).toLocaleString()}
                </span>
                <span className="text-sm font-black text-neutral-900 uppercase">
                  {t('etb')}
                </span>
              </div>
              <span className="text-xs text-neutral-600 font-semibold mt-0.5">
                {isAmharic ? 'በ' : 'Per '}{periodLabel}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
              {t('modalDescription')}
            </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Features / Amenities */}
          {listing.features && listing.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                {t('modalFeatures')}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {listing.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800 flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{typeof feature === 'string' ? feature : feature.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner & Action Bottom Bar */}
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Owner profile card */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-base font-bold text-amber-600">
                {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-neutral-950">{listing.owner_name || t('verifiedOwner')}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs text-neutral-500">{t('verifiedOwner')}</span>
              </div>
            </div>

            {/* Direct CTAs */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 text-neutral-800 text-xs font-semibold flex items-center gap-2 transition-colors group shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
                <span>{t('back')}</span>
              </button>

              {!isAdmin && (
                <button
                  onClick={handleToggleSave}
                  className={`p-3 rounded-xl border transition-all shadow-2xs ${
                    isSaved 
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold' 
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:text-amber-600 hover:border-amber-400'
                  }`}
                  title={isSaved ? t('savedToFavorites') : t('saveFavorite')}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-neutral-950' : ''}`} />
                </button>
              )}

              <a
                href={`tel:${listing.contact_phone}`}
                className="btn-outline-gold text-sm py-3 px-5 flex items-center gap-2 font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>{t('modalCall')} ({listing.contact_phone})</span>
              </a>

              {!isAdmin && !isOwner && (
                <button
                  onClick={handleStartChat}
                  className="btn-gold text-sm py-3 px-6 flex items-center gap-2 font-bold"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('modalMessage')}</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Sticky Bottom Floating Action Bar */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-2xl border-t border-neutral-200 p-3 z-50 flex items-center gap-2 shadow-lg">
          {!isAdmin && (
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-xl border transition-all shrink-0 ${
                isSaved 
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold' 
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
              title={isSaved ? t('savedToFavorites') : t('saveFavorite')}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-neutral-950' : ''}`} />
            </button>
          )}

          <a
            href={`tel:${listing.contact_phone}`}
            className="flex-1 btn-outline-gold text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('modalCall')}</span>
          </a>

          {!isAdmin && !isOwner && (
            <button
              onClick={handleStartChat}
              className="flex-1 btn-gold text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold"
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('modalMessage')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
