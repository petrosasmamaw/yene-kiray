import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bookmark, Layers, ArrowLeft } from 'lucide-react';
import { fetchSavedListings } from '../store/slices/listingSlice';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';

export default function SavedPage({ onSelectListing, onOpenAuth, onGoBack, onGoHome }) {
  const dispatch = useDispatch();
  const { savedItems, savedLoading } = useSelector((state) => state.listings);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSavedListings());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header */}
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
                <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-sans leading-tight">
                  Saved Favorites
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {savedItems.length} rental listings saved to your account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {savedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3].map((n) => (
              <ListingCardSkeleton key={n} />
            ))}
          </div>
        ) : savedItems.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-[#0D0D0D] border border-neutral-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md mx-auto">
            <Bookmark className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Saved Listings</h3>
            <p className="text-xs text-neutral-400 mb-6">
              You haven't bookmarked any rentals yet. Click the bookmark icon on any card to save it for later.
            </p>
            <button
              onClick={onGoHome}
              className="btn-gold text-xs py-2.5 px-6 font-bold"
            >
              Browse Rentals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {savedItems.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={onSelectListing}
                onOpenAuth={onOpenAuth}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
