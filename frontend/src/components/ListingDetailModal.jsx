import React, { useState } from 'react';
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

export default function ListingDetailModal({ listing, onClose, onOpenAuth }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { savedItems } = useSelector((state) => state.listings);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!listing) return null;

  const isSaved = savedItems.some((item) => item.id === listing.id);
  const isOwner = user?.id === listing.user_id;

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [{ image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }];

  const handleStartChat = () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    dispatch(startConversation(listing.id));
    onClose();
  };

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    dispatch(toggleSave(listing.id));
  };

  return (
    <div className="fixed inset-0 sm:top-[72px] z-50 flex items-start justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#0D0D0D] sm:border border-neutral-800 rounded-none sm:rounded-3xl overflow-hidden shadow-2xl min-h-screen sm:min-h-0 sm:my-4 transition-all pb-24 sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Bar: Prominent Back to Home & Details Info */}
        <div className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-300 hover:text-white text-xs font-semibold tracking-wide transition-all group shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-black text-amber-400 border border-amber-500/30">
              {listing.category_name || 'Rental Item'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Gallery Hero */}
        <div className="relative aspect-[16/9] w-full bg-neutral-950 overflow-hidden">
          <img 
            src={images[activeImageIndex]?.image_url} 
            alt={listing.title}
            className="w-full h-full object-cover transition-all duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-black/30 pointer-events-none" />

          {/* Gallery Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700/60 backdrop-blur-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-neutral-700/60 backdrop-blur-md"
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
                      i === activeImageIndex ? 'w-6 bg-amber-400' : 'w-2 bg-neutral-600/70 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
              {listing.category_name || 'Rental Item'}
            </span>
          </div>
        </div>

        {/* Details Body: Spacious layout */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Header Row: Title, Location & Price */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400 font-medium">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>
                  {listing.city} {listing.subcity ? `• ${listing.subcity}` : ''} {listing.specific_location ? `(${listing.specific_location})` : ''}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
                {listing.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Posted {new Date(listing.created_at || Date.now()).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>{listing.views_count || 1} Views</span>
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col items-start md:items-end justify-center shrink-0">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Rental Rate
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-amber-400">
                  {Number(listing.rental_price).toLocaleString()}
                </span>
                <span className="text-sm font-bold text-white uppercase">
                  ETB
                </span>
              </div>
              <span className="text-xs text-neutral-400 font-semibold mt-0.5">
                Per {listing.price_period || 'month'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Overview & Specifications
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Features / Amenities */}
          {listing.features && listing.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                Key Features & Amenities
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {listing.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{typeof feature === 'string' ? feature : feature.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner & Action Bottom Bar */}
          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Owner profile card */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-base font-bold text-amber-400">
                {listing.owner_name ? listing.owner_name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{listing.owner_name || 'Rental Owner'}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-neutral-400">Verified Platform Host</span>
              </div>
            </div>

            {/* Direct CTAs */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>

              <button
                onClick={handleToggleSave}
                className={`p-3 rounded-xl border transition-all ${
                  isSaved 
                    ? 'bg-amber-500 text-black border-amber-400' 
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-amber-400 hover:border-amber-400'
                }`}
                title={isSaved ? 'Saved' : 'Save'}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-black' : ''}`} />
              </button>

              <a
                href={`tel:${listing.contact_phone}`}
                className="btn-outline-gold text-sm py-3 px-5 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call ({listing.contact_phone})</span>
              </a>

              {!isOwner && (
                <button
                  onClick={handleStartChat}
                  className="btn-gold text-sm py-3 px-6 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Live Chat</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Sticky Bottom Floating Action Bar */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-[#0d0d0e]/95 backdrop-blur-2xl border-t border-white/[0.08] p-3 z-50 flex items-center gap-2 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.8)]">
          <button
            onClick={handleToggleSave}
            className={`p-3 rounded-xl border transition-all shrink-0 ${
              isSaved 
                ? 'bg-amber-500 text-black border-amber-400 font-semibold' 
                : 'bg-neutral-900 text-neutral-300 border-neutral-800'
            }`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-black' : ''}`} />
          </button>

          <a
            href={`tel:${listing.contact_phone}`}
            className="flex-1 btn-outline-gold text-xs py-2.5 px-3 flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Call Host</span>
          </a>

          {!isOwner && (
            <button
              onClick={handleStartChat}
              className="flex-1 btn-gold text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 font-bold"
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Live Chat</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
