import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, 
  Bookmark, 
  MessageSquare, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { toggleSave } from '../store/slices/listingSlice';
import { startConversation } from '../store/slices/chatSlice';
import { useLanguage } from '../context/LanguageContext';

export default function ListingCard({ listing, onSelect, onOpenAuth }) {
  const dispatch = useDispatch();
  const { t, isAmharic, getCityTitle } = useLanguage();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { savedItems } = useSelector((state) => state.listings);

  const isSaved = savedItems.some((item) => String(item.id) === String(listing.id));
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
      className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer border border-neutral-100 hover:border-amber-400/40 shadow-xs w-full max-w-full min-w-0"
    >
      {/* 1. Item Image Container (Decreased Height by 15%, 100% Width Fit, No White Space) */}
      <div className="relative aspect-[15/17] sm:aspect-[16/17] w-full max-w-full overflow-hidden bg-neutral-100">
        <img 
          src={primaryImage} 
          alt={listing.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Status Badge if Pending/Rejected */}
        {listing.status && listing.status !== 'approved' && (
          <div className="absolute top-2 left-2 z-10">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider shadow-xs ${
              listing.status === 'pending' 
                ? 'bg-amber-500 text-neutral-950' 
                : 'bg-rose-500 text-white'
            }`}>
              {listing.status === 'pending' ? <Clock className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
              <span>{listing.status === 'pending' ? t('statusPending') : listing.status === 'rejected' ? t('statusRejected') : listing.status}</span>
            </span>
          </div>
        )}

        {/* Top Right: Favorite / Bookmark Button */}
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label={isSaved ? (isAmharic ? 'ከተወደዱ አውጣ' : 'Remove from Saved') : (isAmharic ? 'አስቀምጥ' : 'Save to Favorites')}
            title={isSaved ? (isAmharic ? 'ከተወደዱ አውጣ' : 'Remove from Saved') : (isAmharic ? 'አስቀምጥ' : 'Save to Favorites')}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md transition-all duration-200 flex items-center justify-center ${
              isSaved 
                ? 'bg-amber-500 text-neutral-950 shadow-md scale-105' 
                : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-amber-600 hover:scale-105 shadow-xs'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-neutral-950' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Text Box (Responsive Height, Strictly Contained Within Box) */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between gap-2 bg-white w-full max-w-full min-w-0 overflow-hidden">
        <div className="space-y-1 w-full max-w-full min-w-0 overflow-hidden">
          {/* Price at Top of Text Section */}
          <div className="flex items-baseline gap-1 font-sans flex-wrap min-w-0 max-w-full overflow-hidden">
            <span className="text-[11px] sm:text-xs font-black text-amber-600 uppercase tracking-tight">
              {t('etb')}
            </span>
            <span className="text-sm sm:text-base font-black text-amber-600 tracking-tight truncate">
              {Number(listing.rental_price).toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">
              /{periodLabel}
            </span>
          </div>

          {/* Listing Title: Strictly Contained In Box, Limited to 2 Lines on Mobile */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2 break-words [overflow-wrap:anywhere] [word-break:break-word] w-full max-w-full min-w-0">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-neutral-500 font-medium truncate pt-0.5 w-full min-w-0 max-w-full">
            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate">
              {getCityTitle(listing.city)}{listing.subcity ? ` • ${listing.subcity}` : ''}
            </span>
          </div>
        </div>

        {/* Bottom Tag Row: Clean Category Badge + Action */}
        <div className="pt-1 flex items-center justify-between gap-1.5 w-full min-w-0 max-w-full overflow-hidden">
          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium rounded-md bg-neutral-100 text-neutral-600 truncate min-w-0 max-w-[calc(100%-2rem)]">
            {categoryTitle}
          </span>

          {!isOwner && (
            <button
              type="button"
              onClick={handleChatClick}
              aria-label={t('messageOwner')}
              title={t('messageOwner')}
              className="p-1 rounded-md text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
