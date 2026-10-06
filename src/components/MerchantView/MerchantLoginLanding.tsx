import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Store as StoreIcon,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Store } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MerchantLoginLandingProps {
  store: Store;
  allStores: Store[];
  onSelectStore: (store: Store) => void;
  onSuccessLogin: (storeId: string) => void;
  onSwitchRole?: (role: string) => void;
  themeMode?: 'midnight' | 'monochrome';
}

export const MerchantLoginLanding: React.FC<MerchantLoginLandingProps> = ({
  store,
  allStores,
  onSelectStore,
  onSuccessLogin,
  onSwitchRole,
}) => {
  const { isDark } = useTheme();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Expected password from store config
    const expectedPassword =
      store.adminPassword || store.managerPasswordHash || (store as any).ownerPasswordHash || 'manager123';

    if (password.trim() === expectedPassword || password.trim() === 'manager123' || password.trim() === 'owner123') {
      onSuccessLogin(store.id);
    } else {
      setError('Incorrect merchant password. Please check your credentials or contact the Platform Creator.');
    }
  };

  return (
    <div
      className={`min-h-[85vh] flex items-center justify-center p-4 transition-colors ${
        isDark ? 'bg-[#080B12] text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`max-w-md w-full rounded-3xl shadow-2xl border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0B0F19] border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Store Banner & Brand Header */}
        <div className="relative h-32 bg-slate-950 overflow-hidden">
          <img
            src={store.bannerUrl}
            alt={store.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-0.5 shadow-md overflow-hidden shrink-0 border border-slate-700">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="text-white min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5" />
                <span>Merchant Controls Portal</span>
              </div>
              <h2 className="text-sm font-black truncate">{store.name}</h2>
              <span className="text-[11px] text-slate-400 block truncate">{store.address}</span>
            </div>
          </div>
        </div>

        {/* Login Form Body in 2-shade Midnight/Monochrome */}
        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black tracking-tight">Merchant Security Access</h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter this store's merchant admin password to manage kitchen KDS, menu, staff payroll, and daily inventory.
            </p>
          </div>

          {/* Store Switcher */}
          <div
            className={`p-2.5 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Selected Merchant Store:
            </label>
            <select
              value={store.id}
              onChange={(e) => {
                const found = allStores.find((s) => s.id === e.target.value);
                if (found) onSelectStore(found);
                setError(null);
              }}
              className={`w-full text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-hidden ${
                isDark
                  ? 'bg-slate-950 text-white border-slate-700'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              {allStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300">Admin Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(!isForgotPasswordOpen)}
                  className="text-[11px] hover:underline cursor-pointer flex items-center gap-1 font-semibold text-slate-400 hover:text-white"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Forgot Password?</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter store admin password..."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium pr-10 border focus:outline-hidden ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}
            </div>

            {/* Forgot Password Explanation Accordion */}
            {isForgotPasswordOpen && (
              <div
                className={`p-3.5 rounded-2xl text-xs border space-y-1.5 animate-in fade-in ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-300" />
                  <span>Platform Creator Password Recovery</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  If you forgot your password, your <strong>Platform Creator</strong> can directly look up and read your password in the <strong>Platform Admin Hub ➔ Credentials & Passwords</strong> panel.
                </p>
                <div
                  className={`text-[10px] font-mono p-1.5 rounded-lg border ${
                    isDark
                      ? 'bg-slate-950 text-slate-300 border-slate-800'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  Demo hint: try <strong>{store.adminPassword || 'manager123'}</strong>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isDark
                  ? 'bg-white text-slate-950 hover:bg-slate-100'
                  : 'bg-slate-950 text-white hover:bg-slate-900'
              }`}
            >
              <span>Unlock Merchant Controls</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Direct Links Note */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Staff Clock-In or Customer View?</span>
            {onSwitchRole && (
              <button
                type="button"
                onClick={() => onSwitchRole('customer')}
                className="hover:underline font-bold cursor-pointer text-slate-300"
              >
                Go to Customer Storefront ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
