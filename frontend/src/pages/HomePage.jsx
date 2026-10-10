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
            className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 pb-2 sm:pb-1"
          >
            {/* "All Categories" Button Card */}
            <button
              type="button"
              onClick={() => dispatch(setSelectedCategory(''))}
              aria-pressed={selectedCategory === ''}
              aria-label={t('allCategories')}
              className={`group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border text-left transition-all duration-300 w-full h-20 sm:h-32 flex flex-col justify-end p-1.5 sm:p-3 ${
                selectedCategory === ''
                  ? 'border-amber-500 ring-2 sm:ring-4 ring-amber-500/30 shadow-md sm:shadow-xl shadow-amber-500/15 -translate-y-0.5 sm:-translate-y-1 bg-neutral-900'
                  : 'border-neutral-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 bg-neutral-900'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-900/80 to-amber-950/40" />

              {/* Selected Checkmark Badge */}
              {selectedCategory === '' && (
                <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-20 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[8px] sm:text-[10px] font-black flex items-center gap-0.5 sm:gap-1 shadow-md">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                  <span>{isAmharic ? 'የተመረጠ' : 'Active'}</span>
                </div>
              )}

              {/* Bottom Gold Line if selected */}
              {selectedCategory === '' && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 sm:h-1 bg-amber-500 z-20" />
              )}

              <div className="relative z-10">
                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 mb-1 sm:mb-2">
                  <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-bold text-white leading-tight truncate">
                  {t('allCategories')}
                </h3>
                <p className="text-[8px] sm:text-[10px] text-amber-400 font-semibold mt-0.5 truncate">
                  {items.length} {t('rentals')}
                </p>
              </div>
            </button>

            {/* Dynamic Category Button Cards */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const IconComp = iconMap[cat.icon_name] || Layers;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => dispatch(setSelectedCategory(isSelected ? '' : cat.slug))}
                  aria-pressed={isSelected}
                  aria-label={getCategoryTitle(cat)}
                  className={`group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border text-left transition-all duration-300 w-full h-20 sm:h-32 flex flex-col justify-end p-1.5 sm:p-3 ${
                    isSelected
                      ? 'border-amber-500 ring-2 sm:ring-4 ring-amber-500/30 shadow-md sm:shadow-xl shadow-amber-500/15 -translate-y-0.5 sm:-translate-y-1'
                      : 'border-neutral-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {/* Category Image */}
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                    alt={getCategoryTitle(cat)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 transition-opacity ${
                    isSelected 
                      ? 'bg-gradient-to-t from-black/90 via-black/40 to-amber-500/15' 
                      : 'bg-gradient-to-t from-black/85 via-black/40 to-transparent'
                  }`} />

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-20 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[8px] sm:text-[10px] font-black flex items-center gap-0.5 sm:gap-1 shadow-md">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                      <span>{isAmharic ? 'የተመረጠ' : 'Active'}</span>
                    </div>
                  )}

                  {/* Bottom Gold Indicator */}
                  {isSelected && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 sm:h-1 bg-amber-500 z-20" />
                  )}

                  {/* Icon badge in top right */}
                  <div className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg backdrop-blur-md flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-amber-500 text-neutral-950 font-bold' 
                      : 'bg-black/40 text-white border border-white/20'
                  }`}>
                    <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>

                  {/* Category Title & Count in Bottom */}
                  <div className="relative z-10">
                    <h3 className={`text-[10px] sm:text-xs font-bold leading-tight truncate drop-shadow-sm ${
                      isSelected ? 'text-amber-300 font-extrabold' : 'text-white'
                    }`}>
                      {getCategoryTitle(cat)}
                    </h3>
                    <p className="text-[8px] sm:text-[10px] text-amber-400 font-semibold mt-0.5 truncate">
                      {cat.listings_count || 0} {t('rentals')}
                    </p>
                  </div>
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
            {/* Mobile Skeletons (2-col brick layout) */}
            <div className="sm:hidden flex gap-2.5 items-start">
              <div className="flex-1 flex flex-col gap-3 min-w-0">
                {[1, 3, 5].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3 min-w-0 pt-28">
                {[2, 4, 6].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
            </div>

            {/* Desktop Skeletons (preserved PC grid) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
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
            {/* Mobile View: 2-column Staggered Brick Layout (Right column starts half-way down) */}
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

              {/* Right Column (starts half-way down with pt-8 like interlocking building bricks) */}
              <div className="flex-1 flex flex-col gap-3 min-w-0 pt-28">
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
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
