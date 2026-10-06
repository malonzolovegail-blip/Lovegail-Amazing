import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Bike,
  Plus,
  Search,
  Phone,
  Info,
} from 'lucide-react';
import { Store, MenuItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface StoreDetailProps {
  store: Store;
  menuItems: MenuItem[];
  onBack: () => void;
  onSelectItem: (item: MenuItem) => void;
}

export const StoreDetail: React.FC<StoreDetailProps> = ({
  store,
  menuItems,
  onBack,
  onSelectItem,
}) => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchDish, setSearchDish] = useState('');

  // Extract unique categories for this store's menu
  const storeCategories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchDish.toLowerCase()) ||
      item.description.toLowerCase().includes(searchDish.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const estimatedDeliveryFee =
    store.baseDeliveryFee + Math.round(store.distanceKm * store.perKmDeliveryFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border mb-5 transition-colors cursor-pointer ${
          isDark
            ? 'bg-[#0E1422] hover:bg-slate-800 text-slate-300 border-slate-800'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Stores in 3km Area</span>
      </button>

      {/* Store Banner & Brand Header */}
      <div
        className={`rounded-3xl overflow-hidden border shadow-sm mb-8 transition-colors ${
          isDark
            ? 'bg-[#0E1422] border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="relative h-56 sm:h-72 w-full bg-slate-950">
          <img
            src={store.bannerUrl}
            alt={store.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

          {/* Open / Closed Status Pill */}
          <div className="absolute top-4 left-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-wider backdrop-blur-md ${
                store.isOpen
                  ? 'bg-emerald-500/95 text-white'
                  : 'bg-rose-600/95 text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-white animate-pulse' : 'bg-rose-200'}`} />
              {store.isOpen ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}
            </span>
          </div>

          {/* Delivery & Radius Stats on Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 font-mono">
              <Bike className="w-3.5 h-3.5 text-slate-300" />
              <span>₱{estimatedDeliveryFee} Delivery ({store.distanceKm.toFixed(1)} km)</span>
            </div>
          </div>

          {/* Brand Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-white shrink-0">
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-slate-300 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {store.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-xs mt-1">
                  {store.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-1">
                  {store.tagline}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-center gap-1 font-bold text-amber-300">
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>{store.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({store.reviewCount})</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-1 text-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>20–30m ETA</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="text-slate-200 font-mono">
                Min. <strong>₱{store.minOrderAmount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Store Detail Info Footer */}
        <div
          className={`p-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs transition-colors ${
            isDark
              ? 'bg-[#0B0F19] border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-100 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 opacity-70 shrink-0" />
            <span>{store.address}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 opacity-70" />
              <span>{store.contactNumber}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Info className="w-3 h-3" />
              <span>₱5 platform fee applied at checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Category Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {storeCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-white text-slate-950 font-black shadow-xs'
                      : 'bg-slate-950 text-white font-black shadow-xs'
                    : isDark
                    ? 'bg-[#0E1422] text-slate-400 hover:text-white border border-slate-800'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Dishes */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchDish}
            onChange={(e) => setSearchDish(e.target.value)}
            placeholder="Search this menu..."
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-hidden border transition-colors ${
              isDark
                ? 'bg-[#0E1422] border-slate-800 text-white placeholder:text-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Dishes Menu Grid */}
      {filteredItems.length === 0 ? (
        <div
          className={`text-center py-12 rounded-3xl border border-dashed p-8 transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800 text-slate-400'
              : 'bg-white border-slate-300 text-slate-600'
          }`}
        >
          <p className="text-sm">No dishes match your filter in this store.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const hasVariants = item.variantGroups && item.variantGroups.length > 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group rounded-3xl p-4 border transition-all flex flex-col justify-between cursor-pointer ${
                  isDark
                    ? 'bg-[#0E1422] border-slate-800 hover:border-slate-600 hover:shadow-lg hover:shadow-black/50'
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Food Picture */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3
                      className={`text-base font-black transition-colors ${
                        isDark ? 'text-white group-hover:text-slate-200' : 'text-slate-900 group-hover:text-slate-700'
                      }`}
                    >
                      {item.name}
                    </h3>
                    <span
                      className={`text-base font-black shrink-0 font-mono ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      ₱{item.price}
                    </span>
                  </div>

                  <p
                    className={`text-xs line-clamp-2 mb-3 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                <div>
                  {/* Variant summary */}
                  {hasVariants ? (
                    <div
                      className={`text-[11px] px-2.5 py-1 rounded-xl mb-3 flex items-center justify-between border ${
                        isDark
                          ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Customizable Options</span>
                      <span className="font-bold">{item.variantGroups.length} groups</span>
                    </div>
                  ) : (
                    <div
                      className={`text-[11px] px-2.5 py-1 rounded-xl mb-3 border ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-500'
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      Standard Recipe
                    </div>
                  )}

                  {/* Add Button */}
                  <button
                    disabled={!store.isOpen || !item.available}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      store.isOpen && item.available
                        ? isDark
                          ? 'bg-white hover:bg-slate-200 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-950 hover:bg-slate-800 text-white font-black shadow-xs'
                        : isDark
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{hasVariants ? 'Customize & Add' : 'Add to Order'}</span>
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
