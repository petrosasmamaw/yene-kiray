import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  MapPin, 
  Filter, 
  Home, 
  Car, 
  Building2, 
  Truck, 
  Sparkles, 
  Wrench, 
  Layers,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchListings, fetchCategories, setSelectedCategory } from '../store/slices/listingSlice';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import { CategoryCardSkeleton } from '../components/CategorySkeleton';
import { useLanguage } from '../context/LanguageContext';

// Map icon string names to Lucide components
const iconMap = {
  Home,
  Car,
  Building2,
  Truck,
  Sparkles,
  Wrench,
  Layers
};

export default function HomePage({ onSelectListing, onOpenAuth }) {
  const dispatch = useDispatch();
  const { t, getCategoryTitle, isAmharic } = useLanguage();
  const { items, categories, selectedCategory, loading, categoriesLoading } = useSelector((state) => state.listings);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPricePreset, setSelectedPricePreset] = useState('');

  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 320;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchListings({
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
      city: selectedCity || undefined,
      period: selectedPeriod || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    }));
  }, [selectedCategory, selectedCity, selectedPeriod, minPrice, maxPrice, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchListings({
      category: selectedCategory || undefined,
      search: searchTerm || undefined,
      city: selectedCity || undefined,
      period: selectedPeriod || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    }));
  };

  return (
    <div className="min-h-screen text-neutral-900 pb-16">
      
      {/* Top Search & Filter Bar */}
      <section className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/80 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white border border-neutral-200/90 hover:border-neutral-300 focus-within:border-amber-500 rounded-2xl sm:rounded-full p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {/* Row 1 on mobile: Keyword Search Input + Search CTA Button side-by-side */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-neutral-50/80 rounded-xl sm:rounded-full transition-colors group/kw min-w-0">
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-focus-within/kw:text-amber-600 transition-colors">
                  {isAmharic ? 'የሚከራይ ዕቃ / አገልግሎት' : 'Search Rentals'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                  <input 
                    type="text"
                    aria-label={t('searchPlaceholder')}
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none min-w-0"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Clear search"
                      className="text-neutral-400 hover:text-neutral-700 text-xs px-1 rounded shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile-only inline Search CTA Button (Same Row as search bar) */}
              <button
                type="submit"
                className="sm:hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 shrink-0 transition-transform"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('searchButton')}</span>
              </button>
            </div>

            <div className="h-8 w-px bg-neutral-200 hidden sm:block mx-0.5" />

            {/* Row 2 on mobile: City Filter & Price Filter in the SAME ROW */}
            <div className="grid grid-cols-2 gap-2 sm:contents">
              {/* City Selector Segment */}
              <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-neutral-50/80 sm:bg-transparent hover:bg-neutral-100/70 sm:hover:bg-neutral-50/80 border border-neutral-150 sm:border-0 rounded-xl sm:rounded-full transition-colors group/city sm:w-44">
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-focus-within/city:text-amber-600 transition-colors">
                  {isAmharic ? 'ከተማ / አካባቢ' : 'Location'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 group-focus-within/city:text-amber-500 shrink-0" />
                  <select
                    value={selectedCity}
                    aria-label={t('filterAllCities')}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="" className="bg-white text-neutral-900 font-normal">{t('filterAllCities')}</option>
                    <option value="Addis Ababa" className="bg-white text-neutral-900 font-normal">{t('cityAddisAbaba')}</option>
                    <option value="Hawassa" className="bg-white text-neutral-900 font-normal">{t('cityHawassa')}</option>
                    <option value="Adama" className="bg-white text-neutral-900 font-normal">{t('cityAdama')}</option>
                    <option value="Bahir Dar" className="bg-white text-neutral-900 font-normal">{t('cityBahirDar')}</option>
                    <option value="Bishoftu" className="bg-white text-neutral-900 font-normal">{t('cityBishoftu')}</option>
                    <option value="Mekelle" className="bg-white text-neutral-900 font-normal">{t('cityMekelle')}</option>
                    <option value="Dire Dawa" className="bg-white text-neutral-900 font-normal">{t('cityDireDawa')}</option>
                  </select>
                </div>
              </div>

              <div className="h-8 w-px bg-neutral-200 hidden sm:block mx-0.5" />

              {/* Price Range Filter Segment */}
              <div className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-neutral-50/80 sm:bg-transparent hover:bg-neutral-100/70 sm:hover:bg-neutral-50/80 border border-neutral-150 sm:border-0 rounded-xl sm:rounded-full transition-colors group/price sm:w-48">
                <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-focus-within/price:text-amber-600 transition-colors">
                  {isAmharic ? 'የዋጋ ክልል' : 'Price Range'}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Filter className="w-3.5 h-3.5 text-neutral-400 group-focus-within/price:text-amber-500 shrink-0" />
                  <select
                    value={selectedPricePreset}
                    aria-label={t('filterAnyPrice')}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPricePreset(val);
                      if (val === 'under_10k') {
                        setMinPrice('');
                        setMaxPrice('10000');
                      } else if (val === '10k_50k') {
                        setMinPrice('10000');
                        setMaxPrice('50000');
                      } else if (val === '50k_150k') {
                        setMinPrice('50000');
                        setMaxPrice('150000');
                      } else if (val === 'above_150k') {
                        setMinPrice('150000');
                        setMaxPrice('');
                      } else {
                        setMinPrice('');
                        setMaxPrice('');
                      }
                    }}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 focus:outline-none cursor-pointer truncate"
                  >
                    <option value="" className="bg-white text-neutral-900 font-normal">{t('filterAnyPrice')}</option>
                    <option value="under_10k" className="bg-white text-neutral-900 font-normal">{t('priceUnder10k')}</option>
                    <option value="10k_50k" className="bg-white text-neutral-900 font-normal">{t('price10kTo50k')}</option>
                    <option value="50k_150k" className="bg-white text-neutral-900 font-normal">{t('price50kTo150k')}</option>
                    <option value="above_150k" className="bg-white text-neutral-900 font-normal">{t('priceAbove150k')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop-only Search CTA Button */}
            <button
              type="submit"
              className="hidden sm:flex sm:rounded-full px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-amber-500/25 items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>{t('searchButton')}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Category Buttons with Images (Listed Once) */}
      <section className="pt-6 sm:pt-8 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-neutral-950 font-sans flex items-center gap-2">
              <span>{t('exploreCategories')}</span>
              {selectedCategory && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {isAmharic ? 'የተጣራ' : 'Filtered'}
                </span>
              )}
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
              {t('exploreCategoriesSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button
                onClick={() => dispatch(setSelectedCategory(''))}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold hover:underline mr-1"
              >
                {t('clearFilter')}
              </button>
            )}

            {/* Scroll Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="p-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 shadow-2xs transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="p-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 shadow-2xs transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Carousel/Grid */}
        {categoriesLoading || (!categories.length && loading) ? (
          <CategoryCardSkeleton />
        ) : (
          <div 
            ref={categoryScrollRef}
            className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-4 pb-2 sm:pb-1"
          >
            {/* "All Categories" Tile */}
            <button
              type="button"
              onClick={() => dispatch(setSelectedCategory(''))}
              aria-pressed={selectedCategory === ''}
              aria-label={t('allCategories')}
              className="group flex flex-col items-center cursor-pointer text-center w-full transition-transform active:scale-95"
            >
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === ''
                    ? 'bg-neutral-950 shadow-md ring-2 ring-amber-500 -translate-y-0.5'
                    : 'bg-neutral-900 shadow-2xs hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <div className={`w-full h-full flex items-center justify-center transition-colors ${
                  selectedCategory === '' ? 'text-amber-400' : 'text-amber-400/90'
                }`}>
                  <Layers className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" />
                </div>

                {selectedCategory === '' && (
                  <div className="absolute top-1 right-1 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <span
                className={`block mt-1.5 sm:mt-2 text-[10px] sm:text-xs leading-tight font-medium line-clamp-2 max-w-[72px] sm:max-w-[88px] md:max-w-[100px] transition-colors ${
                  selectedCategory === '' ? 'text-amber-700 font-bold' : 'text-neutral-800 group-hover:text-amber-600'
                }`}
              >
                {t('allCategories')}
              </span>
            </button>

            {/* Dynamic Category Tiles */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => dispatch(setSelectedCategory(isSelected ? '' : cat.slug))}
                  aria-pressed={isSelected}
                  aria-label={getCategoryTitle(cat)}
                  className="group flex flex-col items-center cursor-pointer text-center w-full transition-transform active:scale-95"
                >
                  {/* Square Tile: Border-free, Zoomed to fill without white border */}
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex items-center justify-center p-0 transition-all duration-300 ${
                      isSelected
                        ? 'shadow-md ring-2 sm:ring-3 ring-amber-500/80 -translate-y-0.5'
                        : 'shadow-2xs hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <img
                      src={cat.image_url || '/categories/cat_houses.jpg'}
                      alt={getCategoryTitle(cat)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/categories/cat_houses.jpg';
                      }}
                      className="w-full h-full object-cover scale-125 group-hover:scale-135 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Text Below the Image (Clean, Not in the image) */}
                  <span
                    className={`block mt-1.5 sm:mt-2 text-[10px] sm:text-xs leading-tight font-medium line-clamp-2 max-w-[72px] sm:max-w-[88px] md:max-w-[100px] transition-colors ${
                      isSelected ? 'text-amber-700 font-bold' : 'text-neutral-800 group-hover:text-amber-600'
                    }`}
                  >
                    {getCategoryTitle(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Main Listings Grid */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-neutral-950 font-sans">
              {t('availableListings')}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t('availableListingsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-semibold bg-white border border-neutral-200 px-2.5 py-1 rounded-full shadow-2xs">
              {items.length} {t('items')}
            </span>
          </div>
        </div>

        {/* Listings Feed */}
        {loading ? (
          <>
            {/* Mobile Skeletons (Brick Layout) */}
            <div className="sm:hidden flex gap-2.5 items-start">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {[1, 3, 5].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3 min-w-0 pt-24">
                {[2, 4, 6].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
            </div>

            {/* Desktop Skeletons */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <ListingCardSkeleton key={n} />
              ))}
            </div>
          </>
        ) : items.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-950 mb-1.5">{t('noListingsFound')}</h3>
            <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
              {t('noListingsFoundDesc')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('');
                setMinPrice('');
                setMaxPrice('');
                setSelectedPricePreset('');
                dispatch(setSelectedCategory(''));
              }}
              className="btn-outline-gold text-xs py-2 px-4 font-semibold"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: 2-column Staggered Brick Layout (Right column starts in the middle of left) */}
            <div className="sm:hidden flex gap-2.5 items-start">
              {/* Left Column (starts at y=0) */}
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {items
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

              {/* Right Column (starts in the middle of left with pt-24 like interlocking bricks) */}
              <div className="flex-1 flex flex-col gap-3 min-w-0 pt-24">
                {items
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

            {/* Desktop View: Preserved PC Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((listing) => (
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
      </section>

    </div>
  );
}
