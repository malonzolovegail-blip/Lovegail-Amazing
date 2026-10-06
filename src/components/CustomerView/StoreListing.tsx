import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Bike,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Store } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface StoreListingProps {
  stores: Store[];
  onSelectStore: (store: Store) => void;
}

export const StoreListing: React.FC<StoreListingProps> = ({
  stores,
  onSelectStore,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(3.0); // 3 kilometer radius as specified
  const [onlyOpenStores, setOnlyOpenStores] = useState<boolean>(false);

  const categories = ['All', 'Food', 'Beverages', 'Grocery', 'Bakery'];

  // Filter stores based on search, category, 3km radius, and open/closed
  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || store.category === selectedCategory;
    const matchesRadius = store.distanceKm <= maxRadiusKm;
    const matchesOpen = !onlyOpenStores || store.isOpen;

    return matchesSearch && matchesCategory && matchesRadius && matchesOpen;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Hero & Search Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase mb-1.5">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Hyperlocal Delivery Zone
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>·</span>
              <span className={isDark ? 'text-emerald-400 font-mono' : 'text-emerald-700 font-mono'}>
                3.0 KM Radius
              </span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Stores In Your Neighborhood
            </h1>
            <p className={`text-sm mt-1 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Fresh meals, essentials, and local groceries delivered directly by neighborhood biker couriers.
            </p>
          </div>

          {/* Quick Distance Radius Controller */}
          <div
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors shrink-0 ${
              isDark
                ? 'bg-[#0E1422] border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-current opacity-70 shrink-0" />
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold whitespace-nowrap">Radius:</span>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
                className={`w-24 cursor-pointer ${
                  isDark ? 'accent-white' : 'accent-slate-900'
                }`}
              />
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}
              >
                {maxRadiusKm.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores, dishes, groceries, coffee, or cravings..."
              className={`w-full pl-10 pr-4 py-2 text-sm bg-transparent rounded-xl focus:outline-hidden ${
                isDark
                  ? 'text-white placeholder:text-slate-500'
                  : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Category Filter Pills (Functional Buttons) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 px-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-white text-slate-950 font-black shadow-xs'
                        : 'bg-slate-950 text-white font-black shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Only Open Stores Toggle */}
          <label
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer shrink-0 transition-colors ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={onlyOpenStores}
              onChange={(e) => setOnlyOpenStores(e.target.checked)}
              className="rounded-xs cursor-pointer"
            />
            <span>Open Only</span>
          </label>
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <div
          className={`text-center py-16 rounded-3xl border border-dashed p-8 transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800'
              : 'bg-white border-slate-300'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            No Stores Found
          </h3>
          <p className={`text-xs max-w-md mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            No merchant matches your search within {maxRadiusKm.toFixed(1)} km radius. Try extending the radius or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxRadiusKm(5.0);
              setOnlyOpenStores(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isDark
                ? 'bg-white text-slate-950 hover:bg-slate-200'
                : 'bg-slate-950 text-white hover:bg-slate-800'
            }`}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => {
            const isWithin3km = store.distanceKm <= 3.0;

            return (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer ${
                  isDark
                    ? 'bg-[#0E1422] border-slate-800/90 hover:border-slate-600 hover:shadow-xl hover:shadow-black/60'
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-lg'
                }`}
              >
                {/* Store Cover Image & Status Badges */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={store.bannerUrl}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />

                  {/* Open / Closed Status & Distance */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm uppercase tracking-wider backdrop-blur-md ${
                        store.isOpen
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-rose-600/90 text-white'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          store.isOpen ? 'bg-white animate-pulse' : 'bg-rose-200'
                        }`}
                      />
                      {store.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md bg-black/60 text-white font-mono">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      {store.distanceKm.toFixed(1)} km
                    </span>
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                      {store.category}
                    </span>
                  </div>

                  {/* Store Identity */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/20 shadow-md bg-white shrink-0">
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-white drop-shadow-xs min-w-0">
                        <h3 className="text-sm font-black leading-tight truncate group-hover:underline">
                          {store.name}
                        </h3>
                        <p className="text-[11px] text-slate-300 truncate">
                          {store.tagline}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content & Metrics */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{store.rating.toFixed(1)}</span>
                        <span
                          className={`font-normal text-[11px] ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          ({store.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 opacity-60" />
                        <span>15–25 mins delivery</span>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div
                      className={`flex items-center justify-between text-xs pt-2 border-t ${
                        isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                      }`}
                    >
                      <span>
                        Delivery:{' '}
                        <strong className={isDark ? 'text-white font-mono' : 'text-slate-900 font-mono'}>
                          ₱{store.baseDeliveryFee + Math.round(store.distanceKm * store.perKmDeliveryFee)}
                        </strong>
                      </span>
                      <span>
                        Min Order:{' '}
                        <strong className={isDark ? 'text-white font-mono' : 'text-slate-900 font-mono'}>
                          ₱{store.minOrderAmount}
                        </strong>
                      </span>
                    </div>

                    {isWithin3km && (
                      <div
                        className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-xl border ${
                          isDark
                            ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Neighborhood biker dispatch active (within 3km)</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={!store.isOpen}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      store.isOpen
                        ? isDark
                          ? 'bg-white hover:bg-slate-200 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950 hover:bg-slate-800 text-white font-black shadow-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>{store.isOpen ? 'View Menu & Order' : 'Store Currently Closed'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
