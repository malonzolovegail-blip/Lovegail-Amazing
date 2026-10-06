import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Bike,
  ShoppingCart,
  Cloud,
  ChefHat,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronsLeftRight,
  Check,
  Share2,
  Lock,
  Moon,
  Sun,
  RefreshCw,
  Globe,
  Radio,
} from 'lucide-react';
import { Store, UserRole, CartItem } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  stores: Store[];
  activeStoreId: string;
  setActiveStoreId: (storeId: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  isDriveConnected: boolean;
  userEmail?: string;
  onOpenGoogleDriveModal: () => void;
  onOpenStoreRegisterModal: () => void;
  onOpenRiderRegisterModal: () => void;
  isCustomerOnlyMode?: boolean;
  onExitCustomerOnlyMode?: () => void;
  onOpenCustomerShareModal: () => void;
  themeMode?: 'midnight' | 'monochrome';
  onToggleTheme?: () => void;
  isCloudSynced?: boolean;
  onOpenFreeCloudModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  stores,
  activeStoreId,
  setActiveStoreId,
  cart,
  setIsCartOpen,
  isDriveConnected,
  userEmail,
  onOpenGoogleDriveModal,
  onOpenStoreRegisterModal,
  onOpenRiderRegisterModal,
  isCustomerOnlyMode = false,
  onExitCustomerOnlyMode,
  onOpenCustomerShareModal,
  themeMode = 'midnight',
  onToggleTheme,
  isCloudSynced = true,
  onOpenFreeCloudModal,
}) => {
  const [isRolesCollapsed, setIsRolesCollapsed] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const isDark = themeMode === 'midnight';
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0];

  const roleOptions: {
    role: UserRole;
    label: string;
    sub: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      role: 'customer',
      label: 'Customer',
      sub: 'Order food & groceries (3km)',
      icon: StoreIcon,
    },
    {
      role: 'staff',
      label: 'Staff Terminal',
      sub: 'Kitchen KDS, Daily Inventory & Clock In',
      icon: ChefHat,
    },
    {
      role: 'manager',
      label: 'Merchant Admin',
      sub: 'Losses & Expenses, Payroll & Settings',
      icon: StoreIcon,
    },
    {
      role: 'rider',
      label: 'Rider Queue',
      sub: 'Shift rotation & active deliveries',
      icon: Bike,
    },
    {
      role: 'platform',
      label: 'Platform',
      sub: 'Territory control & ₱5 fee ledger',
      icon: Shield,
    },
  ];

  const currentRoleConfig =
    roleOptions.find(
      (r) =>
        r.role === currentRole ||
        (currentRole === 'owner' && r.role === 'manager')
    ) || roleOptions[0];
  const ActiveIcon = currentRoleConfig.icon;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        isDark
          ? 'bg-[#0B0F19]/95 text-white border-slate-800/90 backdrop-blur-md'
          : 'bg-white/95 text-slate-900 border-slate-200 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand in 2-shade Midnight / Monochrome */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentRole('customer')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-105 border ${
                  isDark
                    ? 'bg-slate-900 text-white border-slate-700 shadow-sm'
                    : 'bg-slate-950 text-white border-slate-900 shadow-sm'
                }`}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight block leading-tight">
                  Gem<span className={isDark ? 'text-slate-400 font-light' : 'text-slate-500 font-light'}>Local</span>
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>3-Km Multi-Store</span>
                </div>
              </div>
            </button>
          </div>

          {/* Collapsible Role Navigation or Customer Mode Badge */}
          {isCustomerOnlyMode ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                isDark
                  ? 'bg-slate-900/90 text-white border-slate-800'
                  : 'bg-slate-100 text-slate-900 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <StoreIcon className="w-3.5 h-3.5 text-slate-300" />
              <span>Customer Storefront</span>
              <span
                className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                3km Radius
              </span>
            </div>
          ) : isRolesCollapsed ? (
            /* COLLAPSED MODE: Compact Dropdown Trigger in 2-shade */
            <div className="relative">
              <div
                className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'bg-slate-950 text-white shadow-xs'
                  }`}
                >
                  <ActiveIcon className="w-3.5 h-3.5" />
                  <span>{currentRoleConfig.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isRoleDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <button
                  onClick={() => {
                    setIsRolesCollapsed(false);
                    setIsRoleDropdownOpen(false);
                  }}
                  title="Expand navigation bar"
                  className={`p-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <ChevronsLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Expand</span>
                </button>
              </div>

              {/* Dropdown Menu in Midnight/Monochrome */}
              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div
                    className={`absolute top-full left-0 mt-2 w-72 rounded-2xl shadow-2xl p-2 z-50 border animate-in fade-in zoom-in-95 ${
                      isDark
                        ? 'bg-[#0B0F19] text-white border-slate-800'
                        : 'bg-white text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Switch Platform Role</span>
                      <button
                        onClick={() => {
                          setIsRolesCollapsed(false);
                          setIsRoleDropdownOpen(false);
                        }}
                        className="hover:underline cursor-pointer lowercase text-slate-300"
                      >
                        expand bar
                      </button>
                    </div>

                    <div className="space-y-1 mt-1">
                      {roleOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isCurrent =
                          currentRole === opt.role ||
                          (currentRole === 'owner' && opt.role === 'manager');

                        return (
                          <button
                            key={opt.role}
                            onClick={() => {
                              setCurrentRole(opt.role);
                              setIsRoleDropdownOpen(false);
                            }}
                            className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isCurrent
                                ? isDark
                                  ? 'bg-slate-800 text-white font-bold'
                                  : 'bg-slate-100 text-slate-900 font-bold'
                                : isDark
                                ? 'hover:bg-slate-900 text-slate-300'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`p-1.5 rounded-lg ${
                                  isCurrent
                                    ? isDark
                                      ? 'bg-white text-slate-950'
                                      : 'bg-slate-950 text-white'
                                    : isDark
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-xs font-bold block leading-tight">
                                  {opt.label}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {opt.sub}
                                </span>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-current shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* EXPANDED MODE: Sleek 2-Shade Pills without scrollbar */
            <div
              className={`flex items-center gap-1 p-1 rounded-xl max-w-full border ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <nav className="flex items-center gap-1 text-xs font-semibold overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isCurrent =
                    currentRole === opt.role ||
                    (currentRole === 'owner' && opt.role === 'manager');

                  return (
                    <button
                      key={opt.role}
                      onClick={() => setCurrentRole(opt.role)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                        isCurrent
                          ? isDark
                            ? 'bg-white text-slate-950 font-black shadow-xs'
                            : 'bg-slate-950 text-white font-black shadow-xs'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Collapse Trigger Button */}
              <button
                onClick={() => setIsRolesCollapsed(true)}
                title="Collapse into compact dropdown"
                className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Collapse</span>
              </button>
            </div>
          )}

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2">
            {/* Free Cloud Sync & Sharing Button */}
            {onOpenFreeCloudModal && (
              <button
                onClick={onOpenFreeCloudModal}
                title="Free Cloud Firestore Live Sync & Updates"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <Cloud className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline font-mono text-[11px]">Free Cloud</span>
              </button>
            )}

            {/* 2-Shade Midnight / Monochrome Theme Switcher */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={isDark ? 'Switch to Monochrome (Light)' : 'Switch to Midnight (Dark)'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 shadow-2xs'
                }`}
              >
                {isDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="hidden md:inline font-medium text-[11px]">Midnight</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="hidden md:inline font-medium text-[11px]">Monochrome</span>
                  </>
                )}
              </button>
            )}

            {/* Customer Link Share Button (Admin Mode) */}
            {!isCustomerOnlyMode && (
              <button
                onClick={onOpenCustomerShareModal}
                title="Get landing page links for customers, merchants & staff"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  isDark
                    ? 'bg-white text-slate-950 hover:bg-slate-100 border-white'
                    : 'bg-slate-950 text-white hover:bg-slate-900 border-slate-950'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Links</span>
              </button>
            )}

            {/* Exit Customer-Only Mode (If opened via customer link) */}
            {isCustomerOnlyMode && onExitCustomerOnlyMode && (
              <button
                onClick={onExitCustomerOnlyMode}
                title="Switch to Merchant Admin & Staff Console"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                  isDark
                    ? 'text-slate-300 hover:text-white bg-slate-900 border-slate-800'
                    : 'text-slate-700 hover:text-slate-950 bg-slate-100 border-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Quick Register Buttons (Admin Mode) */}
            {!isCustomerOnlyMode && (
              <div className="hidden xl:flex items-center gap-1.5">
                <button
                  onClick={onOpenStoreRegisterModal}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-300 bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  + Store
                </button>
                <button
                  onClick={onOpenRiderRegisterModal}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                      : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  + Rider
                </button>
              </div>
            )}

            {/* Cart Button with Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative flex items-center justify-center p-2 rounded-xl transition-colors shadow-xs cursor-pointer border ${
                isDark
                  ? 'bg-slate-900 text-white hover:bg-slate-800 border-slate-700'
                  : 'bg-slate-950 text-white hover:bg-slate-800 border-slate-900'
              }`}
              aria-label="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-slate-950 font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar when viewing merchant: Store Switcher & Store Open/Close Status in 2-shade */}
      {(currentRole === 'staff' || currentRole === 'manager' || currentRole === 'owner') && (
        <div
          className={`px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-t transition-colors ${
            isDark
              ? 'bg-[#080B12] text-slate-300 border-slate-800'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Store:</span>
            <select
              value={activeStoreId}
              onChange={(e) => setActiveStoreId(e.target.value)}
              className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-hidden cursor-pointer ${
                isDark
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.distanceKm} km · {s.isOpen ? 'OPEN' : 'CLOSED'})
                </option>
              ))}
            </select>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeStore.isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {activeStore.isOpen ? '● OPEN' : '○ CLOSED'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>
              Fee: <strong className={isDark ? 'text-white' : 'text-slate-900'}>₱5 / order</strong>
            </span>
            <span>•</span>
            <span>
              Radius: <strong className={isDark ? 'text-white' : 'text-slate-900'}>3.0 km max</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Free Cloud Live
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
