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
  ChevronRight,
  ArrowUpDown
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
  const { t, getCategoryTitle, isAmharic, getCityTitle } = useLanguage();
  const { items, categories, selectedCategory, loading, categoriesLoading } = useSelector((state) => state.listings);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPricePreset, setSelectedPricePreset] = useState('');
  const [sortBy, setSortBy] = useState('');

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

  // Real-time automatic search on typing (with 300ms debounce), filter changes, and auto-reset when search text is cleared
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchListings({
        category: selectedCategory || undefined,
        search: searchTerm.trim() || undefined,
        city: selectedCity || undefined,
        period: selectedPeriod || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort: sortBy || undefined
      }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedCity, selectedPeriod, minPrice, maxPrice, sortBy, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchListings({
      category: selectedCategory || undefined,
      search: searchTerm.trim() || undefined,
      city: selectedCity || undefined,
      period: selectedPeriod || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort: sortBy || undefined
    }));
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedPeriod('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPricePreset('');
    setSortBy('');
    dispatch(setSelectedCategory(''));
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const currentCategoryName = currentCategoryObj 
    ? getCategoryTitle(currentCategoryObj) 
    : (isAmharic ? 'ሁሉም ምድቦች' : 'All Categories');

  return (
    <div className="min-h-screen text-neutral-900 pb-16">
      
      {/* =========================================================================
          1. MOBILE / TABLET VIEW (< lg screen size) - UNTOUCHED & 100% PRESERVED
          ========================================================================= */}
      
      {/* Mobile/Tablet Top Search & Filter Bar */}
      <section className="lg:hidden pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6 border-b border-neutral-200/80 bg-white/70 backdrop-blur-sm">
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

              {/* Mobile-only inline Search CTA Button */}
              <button
                type="submit"
                className="sm:hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 shrink-0 transition-transform"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('searchButton')}</span>
              </button>
            </div>

            <div className="h-8 w-px bg-neutral-200 hidden sm:block mx-0.5" />

            {/* Row 2 on mobile: City Filter & Price Filter */}
            <div className="grid grid-cols-2 gap-2 sm:contents">
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

            {/* Tablet-only Search CTA Button */}
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

      {/* Mobile/Tablet Category Carousel/Grid */}
      <section className="lg:hidden pt-6 sm:pt-8 pb-2 px-4 sm:px-6 max-w-7xl mx-auto">
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
                className={`block mt-1.5 sm:mt-2 text-xs sm:text-sm leading-snug font-semibold line-clamp-2 max-w-[85px] sm:max-w-[100px] md:max-w-[110px] transition-colors ${
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

                    {isSelected && (
                      <div className="absolute top-1 right-1 z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <span
                    className={`block mt-1.5 sm:mt-2 text-xs sm:text-sm leading-snug font-semibold line-clamp-2 max-w-[85px] sm:max-w-[100px] md:max-w-[110px] transition-colors ${
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

      {/* Mobile/Tablet Main Listings Feed (< lg) */}
      <section className="lg:hidden py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto">
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

        {loading ? (
          <>
            {/* Mobile Skeletons (Brick Layout) */}
            <div className="sm:hidden flex gap-2.5 items-start w-full max-w-full overflow-hidden">
              <div className="flex-1 flex flex-col gap-3 min-w-0 max-w-[calc(50%-0.3125rem)]">
                {[1, 3, 5].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3 min-w-0 max-w-[calc(50%-0.3125rem)] pt-24">
                {[2, 4, 6].map((n) => (
                  <ListingCardSkeleton key={n} />
                ))}
              </div>
            </div>

            {/* Tablet Skeletons */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-6">
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
              onClick={handleClearAll}
              className="btn-outline-gold text-xs py-2 px-4 font-semibold"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: 2-column Staggered Brick Layout */}
            <div className="sm:hidden flex gap-2.5 items-start w-full max-w-full overflow-hidden">
              <div className="flex-1 flex flex-col gap-3 min-w-0 max-w-[calc(50%-0.3125rem)]">
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

              <div className="flex-1 flex flex-col gap-3 min-w-0 max-w-[calc(50%-0.3125rem)] pt-24">
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

            {/* Tablet View: 2 Columns */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-6">
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


      {/* =========================================================================
          2. PC SCREEN SIZE VIEW (>= lg) - MODERN JIJI-STYLE DESKTOP UI
          ========================================================================= */}

      {/* PC Top Search Bar */}
      <section className="hidden lg:block pt-5 pb-3 px-6 lg:px-8 xl:px-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white border border-slate-300 hover:border-slate-400 focus-within:border-slate-600 rounded-full p-1.5 pl-4 pr-1.5 flex items-center gap-2 transition-all duration-200 shadow-2xs hover:shadow-xs"
          >
            {/* Search Input - Single line, centered, no 2-line text */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text"
                aria-label={t('searchPlaceholder')}
                placeholder={isAmharic ? 'የሚከራይ ዕቃ ወይም አገልግሎት ይፈልጉ...' : 'Search rentals in Ethiopia...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none min-w-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="text-neutral-400 hover:text-neutral-700 text-xs px-1.5 py-0.5 rounded shrink-0"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 shrink-0" />

            {/* Location in Top Search */}
            <div className="flex items-center gap-1.5 w-44 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCity}
                aria-label={t('filterAllCities')}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer truncate"
              >
                <option value="">{t('filterAllCities')}</option>
                <option value="Addis Ababa">{t('cityAddisAbaba')}</option>
                <option value="Hawassa">{t('cityHawassa')}</option>
                <option value="Adama">{t('cityAdama')}</option>
                <option value="Bahir Dar">{t('cityBahirDar')}</option>
                <option value="Bishoftu">{t('cityBishoftu')}</option>
                <option value="Mekelle">{t('cityMekelle')}</option>
                <option value="Dire Dawa">{t('cityDireDawa')}</option>
              </select>
            </div>

            {/* Search Button - Decreased height & width, centered */}
            <button
              type="submit"
              className="rounded-full px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs hover:shadow flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('searchButton')}</span>
            </button>
          </form>

          {/* Breadcrumbs Row like Jiji */}
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2">
            <div className="flex items-center gap-1.5 flex-wrap font-medium">
              <span className="text-slate-700 font-bold">የኔ ኪራይ</span>
              <span>/</span>
              <span className={selectedCategory ? 'text-slate-800 font-bold' : 'text-slate-600'}>
                {currentCategoryName}
              </span>
              {selectedCity && (
                <>
                  <span>/</span>
                  <span className="text-slate-800 font-bold">{getCityTitle(selectedCity)}</span>
                </>
              )}
              <span className="text-slate-400">
                ({items.length} {t('items')})
              </span>
            </div>

            {(selectedCategory || selectedCity || selectedPricePreset || minPrice || maxPrice || searchTerm || sortBy) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold hover:underline"
              >
                {t('clearAllFilters')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* PC Main Section: Sidebar (Left) + 3 Products Per Row Grid (Right) */}
      <div className="hidden lg:flex items-start gap-5 max-w-7xl mx-auto px-6 lg:px-8 xl:px-10 py-5">
        
        {/* Left Sidebar: Filters & Categories (Grey-Blue theme, no gold, small margins) */}
        <aside className="w-68 xl:w-72 shrink-0 space-y-2.5 sticky top-24">
          
          {/* 1. Sort Box (Price Ascending, Descending, Newest in Left Filter) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAmharic ? 'ደርድር' : 'Sort Listings'}</span>
              </span>
              {sortBy && (
                <button
                  type="button"
                  onClick={() => setSortBy('')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold hover:underline"
                >
                  {t('clearFilter')}
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs">
              {[
                { id: '', label: isAmharic ? 'አዲስ የወጡ' : 'Newest' },
                { id: 'price_asc', label: isAmharic ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High' },
                { id: 'price_desc', label: isAmharic ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low' }
              ].map((s) => {
                const isChecked = sortBy === s.id;
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg transition-colors ${
                      isChecked ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sort_by_filter"
                      checked={isChecked}
                      onChange={() => setSortBy(s.id)}
                      className="w-3.5 h-3.5 accent-slate-700 cursor-pointer"
                    />
                    <span>{s.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Categories Box (Grey-Blue header, no gold border) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-800 text-white font-bold px-3 py-2 flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider">{t('exploreCategories')}</span>
              <Layers className="w-3.5 h-3.5 text-slate-300" />
            </div>
            
            <div className="p-1.5 space-y-0.5 max-h-[300px] overflow-y-auto no-scrollbar">
              {/* All Categories */}
              <button
                type="button"
                onClick={() => dispatch(setSelectedCategory(''))}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs ${
                  selectedCategory === ''
                    ? 'bg-slate-100 text-slate-900 font-bold border-l-3 border-slate-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{t('allCategories')}</span>
                </span>
                {selectedCategory === '' && <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
              </button>

              {/* Dynamic Category List */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => dispatch(setSelectedCategory(isSelected ? '' : cat.slug))}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors text-xs ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-bold border-l-3 border-slate-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <img 
                        src={cat.image_url || '/categories/cat_houses.jpg'} 
                        alt="" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/categories/cat_houses.jpg';
                        }}
                        className="w-5 h-5 rounded object-cover scale-125 shrink-0 bg-neutral-100" 
                      />
                      <span className="truncate">{getCategoryTitle(cat)}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Location Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{isAmharic ? 'ከተማ / አካባቢ' : 'Location'}</span>
              </span>
              {selectedCity && (
                <button
                  type="button"
                  onClick={() => setSelectedCity('')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold hover:underline"
                >
                  {t('clearFilter')}
                </button>
              )}
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-500 cursor-pointer"
            >
              <option value="">{t('filterAllCities')} (ሁሉም ኢትዮጵያ)</option>
              <option value="Addis Ababa">{t('cityAddisAbaba')}</option>
              <option value="Hawassa">{t('cityHawassa')}</option>
              <option value="Adama">{t('cityAdama')}</option>
              <option value="Bahir Dar">{t('cityBahirDar')}</option>
              <option value="Bishoftu">{t('cityBishoftu')}</option>
              <option value="Mekelle">{t('cityMekelle')}</option>
              <option value="Dire Dawa">{t('cityDireDawa')}</option>
            </select>
          </div>

          {/* 4. Price Filter Box (Price, ETB) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isAmharic ? 'የኪራይ ዋጋ (ብር)' : 'Price, ETB'}
              </span>
              {(minPrice || maxPrice || selectedPricePreset) && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedPricePreset('');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold hover:underline"
                >
                  {t('clearFilter')}
                </button>
              )}
            </div>

            {/* Min & Max inputs */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setSelectedPricePreset('');
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-500"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="number"
                placeholder="max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setSelectedPricePreset('');
                }}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-500"
              />
            </div>

            {/* Price Presets Radios */}
            <div className="space-y-1 pt-0.5 text-xs">
              {[
                { id: '', label: t('filterAnyPrice') },
                { id: 'under_10k', label: t('priceUnder10k'), min: '', max: '10000' },
                { id: '10k_50k', label: t('price10kTo50k'), min: '10000', max: '50000' },
                { id: '50k_150k', label: t('price50kTo150k'), min: '50000', max: '150000' },
                { id: 'above_150k', label: t('priceAbove150k'), min: '150000', max: '' }
              ].map((preset) => {
                const isChecked = selectedPricePreset === preset.id;
                return (
                  <label
                    key={preset.id}
                    className={`flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg transition-colors ${
                      isChecked ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'
                    }`}
                  >
                    <input
                      type="radio"
                      name="desktop_price_preset"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedPricePreset(preset.id);
                        setMinPrice(preset.min !== undefined ? preset.min : '');
                        setMaxPrice(preset.max !== undefined ? preset.max : '');
                      }}
                      className="w-3.5 h-3.5 accent-slate-700 cursor-pointer"
                    />
                    <span>{preset.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Clear / Apply buttons - Grey Blue button */}
            <div className="pt-1.5 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSelectedPricePreset('');
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-wider"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(fetchListings({
                    category: selectedCategory || undefined,
                    search: searchTerm || undefined,
                    city: selectedCity || undefined,
                    minPrice: minPrice || undefined,
                    maxPrice: maxPrice || undefined,
                    sort: sortBy || undefined
                  }));
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg font-bold uppercase tracking-wider shadow-2xs transition-colors"
              >
                APPLY
              </button>
            </div>
          </div>
        </aside>

        {/* Right Listings Feed - Products start immediately, no subheader banner */}
        <main className="flex-1 min-w-0">
          {/* PC Listings Grid (Exactly 3 Products in One Row!) */}
          {loading ? (
            <div className="grid grid-cols-3 gap-4 xl:gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <ListingCardSkeleton key={n} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-950 mb-1.5">{t('noListingsFound')}</h3>
              <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
                {t('noListingsFoundDesc')}
              </p>
              <button
                onClick={handleClearAll}
                className="btn-outline-gold text-xs py-2 px-4 font-semibold"
              >
                {t('clearAllFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 xl:gap-5">
              {items.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onSelect={onSelectListing}
                  onOpenAuth={onOpenAuth}
                />
              ))}
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
