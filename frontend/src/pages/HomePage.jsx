import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';
import { fetchListings, fetchCategories, setSelectedCategory } from '../store/slices/listingSlice';
import ListingCard from '../components/ListingCard';

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
  const { items, categories, selectedCategory, loading } = useSelector((state) => state.listings);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPricePreset, setSelectedPricePreset] = useState('');

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
    <div className="min-h-screen text-[#ededed]">
      
      {/* Hero Section: Left-Aligned Clean Architecture */}
      <section className="relative pt-6 sm:pt-16 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl flex flex-col items-start text-left">

            {/* Main Headline (Pure color font, responsive scale) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-[1.15]">
              Find and rent <br />
              <span className="text-amber-400">
                homes, vehicles
              </span> <br />
              & equipment.
            </h1>

            {/* Concise, Grounded Subtitle */}
            <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-neutral-400 max-w-xl leading-relaxed font-normal">
              Direct marketplace connecting renters with verified property and equipment owners across Ethiopia.
            </p>

            {/* Integrated Left-Aligned Search Bar with Price & City Filters */}
            <div className="mt-6 sm:mt-8 w-full max-w-3xl">
              <form 
                onSubmit={handleSearchSubmit}
                className="bg-[#0b0c10]/95 border border-white/[0.1] focus-within:border-amber-500/60 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 transition-all duration-200 shadow-2xl backdrop-blur-md"
              >
                {/* Keyword Input */}
                <div className="flex items-center gap-3 px-3 py-2 w-full sm:flex-1">
                  <Search className="w-4 h-4 text-amber-400 shrink-0" />
                  <input 
                    type="text"
                    placeholder="Search villas, cars, tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
                  />
                </div>

                <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

                {/* City Selector */}
                <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-40 bg-neutral-900/40 sm:bg-transparent rounded-xl sm:rounded-none">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-neutral-300 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0b0c10]">All Cities</option>
                    <option value="Addis Ababa" className="bg-[#0b0c10]">Addis Ababa</option>
                    <option value="Hawassa" className="bg-[#0b0c10]">Hawassa</option>
                    <option value="Adama" className="bg-[#0b0c10]">Adama</option>
                    <option value="Bahir Dar" className="bg-[#0b0c10]">Bahir Dar</option>
                    <option value="Bishoftu" className="bg-[#0b0c10]">Bishoftu</option>
                  </select>
                </div>

                <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

                {/* Price Range Filter */}
                <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-44 bg-neutral-900/40 sm:bg-transparent rounded-xl sm:rounded-none">
                  <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <select
                    value={selectedPricePreset}
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
                    className="w-full bg-transparent text-xs sm:text-sm text-neutral-300 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0b0c10]">All Prices</option>
                    <option value="under_10k" className="bg-[#0b0c10]">Under 10k ETB</option>
                    <option value="10k_50k" className="bg-[#0b0c10]">10k - 50k ETB</option>
                    <option value="50k_150k" className="bg-[#0b0c10]">50k - 150k ETB</option>
                    <option value="above_150k" className="bg-[#0b0c10]">Above 150k ETB</option>
                  </select>
                </div>

                {/* Search CTA */}
                <button
                  type="submit"
                  className="w-full sm:w-auto btn-gold text-xs py-2.5 px-6 font-semibold shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Dynamic Categories from DB as Popular Filter Pills */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-neutral-400">
                <span className="text-neutral-500">Popular:</span>
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => dispatch(setSelectedCategory(cat.slug))}
                    className={`px-2.5 py-1 rounded-md transition-colors border text-[11px] sm:text-xs ${
                      selectedCategory === cat.slug 
                        ? 'bg-amber-500 text-black border-amber-400 font-semibold' 
                        : 'bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white border-white/[0.06]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <section className="py-3 sm:py-6 border-b border-white/[0.06] bg-[#050608]/90 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            
            {/* "All" Filter Pill */}
            <button
              onClick={() => dispatch(setSelectedCategory(''))}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                selectedCategory === ''
                  ? 'bg-amber-500 text-black border-amber-400 font-semibold shadow-sm'
                  : 'bg-white/[0.03] text-neutral-300 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Categories</span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const IconComp = iconMap[cat.icon_name] || Layers;
              const isActive = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  onClick={() => dispatch(setSelectedCategory(cat.slug))}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-black border-amber-400 font-semibold shadow-sm'
                      : 'bg-white/[0.03] text-neutral-300 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {cat.listings_count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black text-amber-400' : 'bg-white/[0.08] text-neutral-400'
                    }`}>
                      {cat.listings_count}
                    </span>
                  )}
                </button>
              );
            })}

          </div>
        </div>
      </section>

      {/* Featured Categories Carousel / Grid with Cover Images */}
      <section className="pt-6 sm:pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-white font-sans">
              Explore Categories
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
              Select a rental category to explore available properties, vehicles, and equipment
            </p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => dispatch(setSelectedCategory(''))}
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Mobile Swipeable Carousel & Desktop Grid */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <div
                key={cat.id}
                onClick={() => dispatch(setSelectedCategory(isSelected ? '' : cat.slug))}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 shrink-0 w-36 sm:w-auto snap-start ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-gold-sm scale-[1.02]'
                    : 'border-white/[0.08] hover:border-amber-500/50 hover:scale-[1.02]'
                }`}
              >
                <div className="h-28 w-full relative">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute inset-x-2 bottom-2">
                    <h3 className="text-xs font-bold text-white leading-tight truncate drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-amber-400/90 font-medium">
                      {cat.listings_count || 0} rentals
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Listings Grid */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white font-sans">
              Available Listings
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Browse approved properties, vehicles, and equipment
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse bg-white/[0.02] rounded-2xl h-80 border border-white/[0.05]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 sm:py-20 text-center bg-[#09090d]/80 border border-white/[0.06] rounded-2xl p-6 sm:p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">No Listings Found</h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              No active listings match your current filters. Try changing your search query or city selection.
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
              className="btn-outline-gold text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      </section>

      {/* Trust & Architecture Principles */}
      <section className="py-14 border-t border-white/[0.06] px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#090a0d]/70 border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">Direct Owner Contact</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect directly with property or vehicle owners to arrange viewings and confirm availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090a0d]/70 border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">Direct Messaging</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Coordinate terms, ask questions, and negotiate rates directly within the platform.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090a0d]/70 border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">Moderated Listings</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Submissions are reviewed before publication to maintain quality standards across all rental categories.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
