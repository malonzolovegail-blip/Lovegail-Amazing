import React, { useState } from 'react';
import {
  Shield,
  Store as StoreIcon,
  Bike,
  TrendingUp,
  DollarSign,
  MapPin,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Plus,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  Smartphone,
  Sparkles,
  QrCode,
  Zap,
} from 'lucide-react';
import { Store, Rider, Order } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { buildMerchantLoginUrl, buildStaffClockInUrl } from '../../utils/urlHelper';
import { QRCodeModal } from '../Modals/QRCodeModal';

interface PlatformAdminProps {
  stores: Store[];
  riders: Rider[];
  orders: Order[];
  onOpenStoreRegisterModal: () => void;
  onOpenRiderRegisterModal: () => void;
  onUpdateStore?: (store: Store) => void;
  onNavigate?: (view: 'customer' | 'merchant_login' | 'staff_clockin' | 'rider' | 'admin', storeId?: string) => void;
}

export const PlatformAdmin: React.FC<PlatformAdminProps> = ({
  stores,
  riders,
  orders,
  onOpenStoreRegisterModal,
  onOpenRiderRegisterModal,
  onUpdateStore,
  onNavigate,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'merchants' | 'passwords' | 'riders' | 'fees'>('overview');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');

  const [qrModalData, setQrModalData] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    subtitle: string;
    badge: string;
    onTest?: () => void;
  }>({
    isOpen: false,
    url: '',
    title: '',
    subtitle: '',
    badge: '',
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const togglePasswordVisibility = (storeId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  const handleSavePassword = (store: Store) => {
    if (!newPasswordVal.trim() || !onUpdateStore) return;
    const updated: Store = {
      ...store,
      adminPassword: newPasswordVal.trim(),
      managerPasswordHash: newPasswordVal.trim(),
    };
    onUpdateStore(updated);
    setEditingStoreId(null);
    setNewPasswordVal('');
  };

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.isOpen).length;
  const totalRiders = riders.length;
  const clockedInRiders = riders.filter((r) => r.isClockedIn).length;
  const totalOrders = orders.length;

  // 5 PESO PLATFORM FEE CALCULATIONS
  const totalPlatformFeesCollected = orders.reduce((sum, o) => sum + (o.platformFee || 5), 0);
  const totalMarketplaceGross = orders.reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Platform Header */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Governance & Territory Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Gem Store Local Platform Administration
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Overseeing all merchants, 3km delivery radius zones, rider rotation queues, and ₱5 platform fee collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenStoreRegisterModal}
            className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            + Register Merchant Store
          </button>
          <button
            onClick={onOpenRiderRegisterModal}
            className="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            + Register Rider
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-3xl border transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Registered Merchants
            </span>
            <StoreIcon className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            {totalStores} stores
          </div>
          <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
            ● {activeStores} currently open within 3km
          </span>
        </div>

        <div
          className={`p-5 rounded-3xl border transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Registered Bikers
            </span>
            <Bike className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            {totalRiders} riders
          </div>
          <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
            ● {clockedInRiders} on duty in rotation
          </span>
        </div>

        <div
          className={`p-5 rounded-3xl border transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Marketplace Gross Volume
            </span>
            <TrendingUp className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-black font-mono mt-1">
            ₱{totalMarketplaceGross.toLocaleString()}
          </div>
          <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {totalOrders} transactions fulfilled
          </span>
        </div>

        {/* 5 PESO PLATFORM FEE TOTAL LEDGER */}
        <div
          className={`p-5 rounded-3xl border shadow-lg transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-slate-950 text-white border-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider block opacity-70">
              Total ₱5 Platform Revenue
            </span>
            <DollarSign className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-3xl font-black font-mono mt-1">
            ₱{totalPlatformFeesCollected.toLocaleString()}
          </div>
          <span className="text-[11px] opacity-70 font-medium mt-1 block">
            ₱5 flat fee on every successful order
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={`flex items-center gap-1.5 p-1 rounded-2xl border text-xs font-bold w-fit ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-slate-100 border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? isDark
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'bg-slate-950 text-white font-black shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Policies
        </button>
        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'merchants'
              ? isDark
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'bg-slate-950 text-white font-black shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stores ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab('passwords')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'passwords'
              ? isDark
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'bg-slate-950 text-white font-black shadow-xs'
              : isDark
              ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
              : 'text-amber-900 bg-amber-100 hover:bg-amber-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>🔑 Passwords & Recovery ({stores.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('riders')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'riders'
              ? isDark
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'bg-slate-950 text-white font-black shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Riders ({riders.length})
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'fees'
              ? isDark
                ? 'bg-white text-slate-950 font-black shadow-xs'
                : 'bg-slate-950 text-white font-black shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ₱5 Fee Audit Log
        </button>
      </div>

      {/* Content based on tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`p-6 rounded-3xl border shadow-xs space-y-4 transition-colors ${
              isDark ? 'bg-[#0E1422] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <MapPin className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-slate-900'}`} />
              <span>3-Kilometer Hyperlocal Boundary Enforcement</span>
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Gem Store Local strictly enforces a 3.0 kilometer service radius between registered merchants and customers. This ensures meals arrive hot and fresh within 15–25 minutes via neighborhood bicycle and motorcycle couriers, reducing urban carbon footprint and delivery delays.
            </p>
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isDark
                  ? 'bg-slate-900/70 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>Maximum Radius:</span>
                <span>3.0 Kilometers</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Platform Transaction Fee:</span>
                <span>₱5.00 per processed order</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Dispatch Logic:</span>
                <span>Automated Rotation (Next Clocked-in Rider)</span>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-3xl border shadow-xs space-y-4 transition-colors ${
              isDark ? 'bg-[#0E1422] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Shield className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-slate-900'}`} />
              <span>Owner & Multi-Role Governance Architecture</span>
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Every store operates with role-based access control. Staff members access the Kitchen Display System (KDS) and counter POS. Store managers control inventory and timecards. As mandated, <strong>only the verified store Owner holds the master passkey</strong> required to change manager credentials.
            </p>
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                isDark
                  ? 'bg-slate-900/70 border-slate-800 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div>• <strong className={isDark ? 'text-white' : 'text-slate-900'}>Owner:</strong> Full authority + Manager password security</div>
              <div>• <strong className={isDark ? 'text-white' : 'text-slate-900'}>Manager:</strong> Daily operations, inventory audits, sales reports</div>
              <div>• <strong className={isDark ? 'text-white' : 'text-slate-900'}>Staff/Kitchen:</strong> Visual kitchen screen with food photos</div>
              <div>• <strong className={isDark ? 'text-white' : 'text-slate-900'}>Riders:</strong> Clock in/out + fair rotation delivery assignments</div>
            </div>
          </div>
        </div>
      )}

      {/* Stores List */}
      {activeTab === 'merchants' && (
        <div
          className={`rounded-3xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#0E1422] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <th className="p-4">Store Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Distance</th>
                <th className="p-4 text-center">Base Fee</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {stores.map((s) => (
                <tr key={s.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</strong>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.address}</span>
                    </div>
                  </td>
                  <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{s.category}</td>
                  <td className={`p-4 text-center font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.distanceKm} km</td>
                  <td className={`p-4 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₱{s.baseDeliveryFee}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        s.isOpen ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {s.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-amber-400">⭐ {s.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔑 Merchant Passwords & Direct Links (Platform Creator Credential Recovery) */}
      {activeTab === 'passwords' && (
        <div className="space-y-4">
          <div
            className={`p-4 border rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              isDark
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-sm">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Platform Creator Credential Recovery System</span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                If a merchant forgets their password, you can look up their exact password here, copy it for them, reset it directly, or provide them their dedicated Merchant Controls landing page link.
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border overflow-hidden shadow-xs transition-colors ${
              isDark ? 'bg-[#0E1422] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-bold uppercase tracking-wider ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <th className="p-4">Store Name</th>
                  <th className="p-4">Merchant Admin Password</th>
                  <th className="p-4">Merchant Controls Link</th>
                  <th className="p-4">Staff Phone Clock-In Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {stores.map((s) => {
                  const currentPass =
                    s.adminPassword || s.managerPasswordHash || (s as any).ownerPasswordHash || 'manager123';
                  const isRevealed = !!revealedPasswords[s.id];
                  const merchantLink = buildMerchantLoginUrl(s.id);
                  const staffClockInLink = buildStaffClockInUrl(s.id);

                  return (
                    <tr key={s.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                      {/* Store Name & ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                            <img src={s.logoUrl} alt={s.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <strong className={`block text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono block">ID: {s.id}</span>
                            <span className="text-[10px] text-slate-400">{s.contactNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Password with Reveal & Edit */}
                      <td className="p-4">
                        {editingStoreId === s.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newPasswordVal}
                              onChange={(e) => setNewPasswordVal(e.target.value)}
                              placeholder="New password..."
                              className={`px-2.5 py-1 text-xs border rounded-lg font-mono focus:outline-none ${
                                isDark
                                  ? 'bg-slate-900 border-slate-700 text-white'
                                  : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <button
                              onClick={() => handleSavePassword(s)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStoreId(null)}
                              className={`px-2 py-1 rounded-lg text-[10px] cursor-pointer ${
                                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border ${
                                isDark
                                  ? 'bg-amber-950/40 border-amber-800/40 text-amber-200'
                                  : 'bg-amber-50 border-amber-200 text-amber-950'
                              }`}
                            >
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>{isRevealed ? currentPass : '••••••••'}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(s.id)}
                              title={isRevealed ? 'Hide Password' : 'Read/Reveal Password'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(currentPass, `pass-${s.id}`)}
                              title="Copy password to clipboard"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              {copiedKey === `pass-${s.id}` ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Merchant Controls Direct Landing Link */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(merchantLink, `merch-${s.id}`)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                            }`}
                            title="Copy Merchant Login Link"
                          >
                            {copiedKey === `merch-${s.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setQrModalData({
                                isOpen: true,
                                url: merchantLink,
                                title: `${s.name} Controls`,
                                subtitle: `Merchant Login. Admin Password: ${currentPass}`,
                                badge: 'Merchant QR',
                                onTest: onNavigate ? () => onNavigate('merchant_login', s.id) : undefined,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-amber-700'
                            }`}
                            title="Show Mobile QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </button>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('merchant_login', s.id)}
                              className="px-2 py-1 bg-white text-slate-950 hover:bg-slate-100 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Test Merchant Login immediately"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Test</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Staff Mobile Clock-In Link */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(staffClockInLink, `staff-${s.id}`)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/50 text-emerald-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                            }`}
                            title="Copy Staff Phone Clock-In Link"
                          >
                            {copiedKey === `staff-${s.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Smartphone className="w-3 h-3 text-emerald-400" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setQrModalData({
                                isOpen: true,
                                url: staffClockInLink,
                                title: `${s.name} Staff Clock-In`,
                                subtitle: 'Scan with mobile phone to open GPS & selfie clock-in station',
                                badge: 'Staff QR',
                                onTest: onNavigate ? () => onNavigate('staff_clockin', s.id) : undefined,
                              })
                            }
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-400' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-emerald-700'
                            }`}
                            title="Show Mobile QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR</span>
                          </button>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('staff_clockin', s.id)}
                              className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Test Staff Clock-In immediately"
                            >
                              <Zap className="w-3 h-3" />
                              <span>Test</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Reset Password Action */}
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStoreId(s.id);
                            setNewPasswordVal(currentPass);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold border rounded-lg transition-colors cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Riders List */}
      {activeTab === 'riders' && (
        <div
          className={`rounded-3xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#0E1422] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <th className="p-4">Rider Courier</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4 text-center">Duty Status</th>
                <th className="p-4 text-center">Rotation #</th>
                <th className="p-4 text-center">Completed</th>
                <th className="p-4 text-right">Total Earnings</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {riders.map((r) => (
                <tr key={r.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.name}</strong>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{r.phone}</span>
                    </div>
                  </td>
                  <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {r.vehicleType} ({r.plateNumber})
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        r.isClockedIn ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {r.isClockedIn ? 'ON DUTY' : 'OFF DUTY'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-amber-400 font-mono">#{r.rotationIndex}</td>
                  <td className={`p-4 text-center font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.completedDeliveries}</td>
                  <td className={`p-4 text-right font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₱{r.totalEarnings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5 Peso Platform Fee Audit Log */}
      {activeTab === 'fees' && (
        <div
          className={`rounded-3xl border overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-[#0E1422] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Platform Fee (₱5) Central Collection Log
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                5 peso fee deducted on every completed transaction across all stores and deliveries.
              </p>
            </div>
            <span className="font-mono text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
              Total: ₱{totalPlatformFeesCollected}
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider ${
                  isDark
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                    : 'bg-slate-50/50 border-slate-200 text-slate-500'
                }`}
              >
                <th className="p-4">Ticket</th>
                <th className="p-4">Store</th>
                <th className="p-4">Order Type</th>
                <th className="p-4 text-right">Order Subtotal</th>
                <th className="p-4 text-right font-black text-amber-400">Platform Fee</th>
                <th className="p-4 text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {orders.map((o) => (
                <tr key={o.id} className={isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'}>
                  <td className={`p-4 font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>#{o.id}</td>
                  <td className={`p-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{o.storeName}</td>
                  <td className={`p-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {o.type === 'walk_in' ? 'Walk-in Counter POS' : '3km Online Delivery'}
                  </td>
                  <td className={`p-4 text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₱{o.subtotal}</td>
                  <td className="p-4 text-right font-black text-amber-400 font-mono">₱{o.platformFee}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Collected</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Modal for Platform Admin */}
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
        url={qrModalData.url}
        title={qrModalData.title}
        subtitle={qrModalData.subtitle}
        badge={qrModalData.badge}
        onTestInApp={qrModalData.onTest}
      />
    </div>
  );
};
