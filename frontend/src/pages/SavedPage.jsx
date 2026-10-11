import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bookmark, Layers, ArrowLeft } from 'lucide-react';
import { fetchSavedListings } from '../store/slices/listingSlice';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import { useLanguage } from '../context/LanguageContext';

export default function SavedPage({ onSelectListing, onOpenAuth, onGoBack, onGoHome }) {
  const dispatch = useDispatch();
  const { t, isAmharic } = useLanguage();
  const { savedItems, savedLoading } = useSelector((state) => state.listings);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSavedListings());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-neutral-900 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header */}
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
                <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 font-sans leading-tight">
                  {t('savedPageTitle')}
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {savedItems.length} {isAmharic ? 'የተቀመጡ የኪራይ ዕቃዎች በመለያዎ ውስጥ ይገኛሉ' : 'rental listings saved to your account'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Feed */}
        {savedLoading ? (
          <>
            <div className="sm:hidden flex gap-2.5 items-start">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {[1, 3].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3 min-w-0 pt-24">
                {[2].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
            </div>
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <ListingCardSkeleton key={n} />
              ))}
            </div>
          </>
        ) : savedItems.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <Bookmark className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-950 mb-1">{t('savedNoneTitle')}</h3>
            <p className="text-xs text-neutral-500 mb-6">
              {t('savedNoneDesc')}
            </p>
            <button
              onClick={onGoHome}
              className="btn-gold text-xs py-2.5 px-6 font-bold"
            >
              {t('savedBrowseRentals')}
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: 2-column Staggered Brick Layout */}
            <div className="sm:hidden flex gap-2.5 items-start">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {savedItems
                  .filter((_, idx) => idx % 2 === 0)
                  .map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSelect={onSelectListing}
                      onOpenAuth={onOpenAuth}
                    />
                  ))}
              </div>
              <div className="flex-1 flex flex-col gap-3 min-w-0 pt-24">
                {savedItems
                  .filter((_, idx) => idx % 2 === 1)
                  .map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSelect={onSelectListing}
                      onOpenAuth={onOpenAuth}
                    />
                  ))}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedItems.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={onSelectListing}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
