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

export default function ListingCard({ listing, onSelect, onOpenAuth }) {
  const dispatch = useDispatch();
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

  return (
    <div 
      onClick={() => onSelect(listing)}
      className="group relative bg-[#090a0d]/90 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image Container with Badge Overlays */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 skeleton-shimmer">
        <img 
          src={primaryImage} 
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Category Chip */}
          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-white/[0.1] flex items-center gap-1.5 shadow-sm">
            <Tag className="w-3 h-3 text-amber-400" />
            <span>{listing.category_name || 'Rental'}</span>
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleSaveClick}
            title={isSaved ? 'Remove from Saved' : 'Save to Favorites'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all duration-200 border ${
              isSaved 
                ? 'bg-amber-500 text-black border-amber-400 font-semibold' 
                : 'bg-black/60 text-white border-white/[0.15] hover:text-amber-400 hover:border-amber-400/50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Floating Price Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/[0.1] text-white flex items-baseline gap-1.5 shadow-md">
            <span className="text-base font-bold text-amber-400 font-sans tracking-tight">
              {Number(listing.rental_price).toLocaleString()}
            </span>
            <span className="text-[11px] text-neutral-300 font-normal">
              ETB / {listing.price_period || 'month'}
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        {listing.status && listing.status !== 'approved' && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wide flex items-center gap-1 shadow-sm ${
              listing.status === 'pending' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md'
            }`}>
              {listing.status === 'pending' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>{listing.status}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-normal mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
            <span className="truncate">
              {listing.city} {listing.subcity ? `• ${listing.subcity}` : ''}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {listing.title}
          </h3>

          {/* Short description preview */}
          <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed font-normal">
            {listing.description}
          </p>
        </div>

        {/* Card Footer: Owner Info & Direct Chat CTA */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-amber-400">
              {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'O'}
            </div>
            <span className="text-xs text-neutral-300 font-normal truncate max-w-[110px]">
              {listing.owner_name || 'Verified Owner'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isOwner && (
              <button
                onClick={handleChatClick}
                title="Message owner"
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-amber-500 hover:text-black border border-white/[0.08] text-neutral-300 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onSelect(listing)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white border border-white/[0.08] transition-colors"
            >
              Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
