import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, 
  Bookmark, 
  MessageSquare, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { toggleSave } from '../store/slices/listingSlice';
import { startConversation } from '../store/slices/chatSlice';
import { useLanguage } from '../context/LanguageContext';

export default function ListingCard({ listing, onSelect, onOpenAuth }) {
  const dispatch = useDispatch();
  const { t, isAmharic, getCityTitle } = useLanguage();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { savedItems } = useSelector((state) => state.listings);

  const isSaved = savedItems.some((item) => item.id === listing.id);
  const isOwner = user?.id === listing.user_id;

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    dispatch(toggleSave(listing.id));
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    dispatch(startConversation(listing.id));
  };

  const primaryImage = listing.images && listing.images.length > 0 
    ? listing.images[0].image_url 
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  const categoryTitle = isAmharic && listing.category_name_am 
    ? listing.category_name_am 
    : (listing.category_name || (isAmharic ? 'ኪራይ' : 'Rental'));

  const periodLabel = listing.price_period === 'day' 
    ? t('periodDay') 
    : listing.price_period === 'hour' 
    ? t('periodHour') 
    : listing.price_period === 'year' 
    ? t('periodYear') 
    : t('periodMonth');

  return (
    <div 
      onClick={() => onSelect(listing)}
      className="group relative bg-white border border-neutral-200/90 rounded-xl sm:rounded-2xl overflow-hidden hover:border-amber-500/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer shadow-xs"
    >
      {/* Image Container with ONLY Favorite Button & Price */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        <img 
          src={primaryImage} 
          alt={listing.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0"
          loading="lazy"
        />

        {/* Subtle Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Top Right: ONLY Favorite Button */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label={isSaved ? (isAmharic ? 'ከተወደዱ አውጣ' : 'Remove from Saved') : (isAmharic ? 'አስቀምጥ' : 'Save to Favorites')}
            title={isSaved ? (isAmharic ? 'ከተወደዱ አውጣ' : 'Remove from Saved') : (isAmharic ? 'አስቀምጥ' : 'Save to Favorites')}
            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full backdrop-blur-md transition-all duration-200 border shadow-sm flex items-center justify-center ${
              isSaved 
                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-md scale-105' 
                : 'bg-white/90 text-neutral-700 border-white/80 hover:bg-white hover:text-amber-600 hover:scale-105'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-neutral-950' : ''}`} />
          </button>
        </div>

        {/* Bottom Left: ONLY Floating Price Pill */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10">
          <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/95 backdrop-blur-md border border-neutral-200 text-neutral-900 flex items-baseline gap-1 sm:gap-1.5 shadow-md">
            <span className="text-xs sm:text-base font-black text-amber-600 font-sans tracking-tight">
              {Number(listing.rental_price).toLocaleString()}
            </span>
            <span className="text-[9px] sm:text-[11px] text-neutral-600 font-bold">
              {t('etb')}<span className="hidden sm:inline"> / {periodLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content Section: Category is inside this box */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Category Tag & Location Row in the Box */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-bold rounded-md sm:rounded-lg bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs truncate">
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
              <span className="truncate">{categoryTitle}</span>
            </span>

            {/* Location */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-500 font-medium truncate">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">
                {getCityTitle(listing.city)}{listing.subcity ? ` • ${listing.subcity}` : ''}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-[15px] font-bold text-neutral-950 group-hover:text-amber-600 transition-colors line-clamp-1 leading-snug">
            {listing.title}
          </h3>

          {/* Description Snippet (Desktop only for compact mobile height) */}
          {listing.description && (
            <p className="hidden sm:block text-xs text-neutral-600 line-clamp-2 leading-relaxed font-normal">
              {listing.description}
            </p>
          )}

          {/* Status Badge if Pending/Rejected */}
          {listing.status && listing.status !== 'approved' && (
            <div className="pt-0.5">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md uppercase tracking-wide ${
                listing.status === 'pending' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {listing.status === 'pending' ? <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                <span>{listing.status === 'pending' ? t('statusPending') : listing.status === 'rejected' ? t('statusRejected') : listing.status}</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Footer: Owner Info & Action CTAs */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-amber-700 shrink-0">
              {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'O'}
            </div>
            <span className="text-[10px] sm:text-xs text-neutral-700 font-semibold truncate max-w-[55px] sm:max-w-none">
              {listing.owner_name || t('verifiedOwner')}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {!isOwner && (
              <button
                type="button"
                onClick={handleChatClick}
                title={t('messageOwner')}
                className="p-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                <span className="hidden sm:inline">{isAmharic ? 'መልዕክት' : 'Chat'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelect(listing)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 text-white text-[10px] sm:text-xs font-bold transition-all shadow-2xs"
            >
              {t('detailsButton')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
