import React, { useState } from 'react';
import {
  Copy,
  Check,
  ShoppingBag,
  Store as StoreIcon,
  X,
  Share2,
  Lock,
  Smartphone,
  Sparkles,
  QrCode,
  Zap,
  Globe,
  Settings,
  Bike,
  Shield,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { Store } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  getShareableBaseUrl,
  getLocalPreviewBaseUrl,
  setCustomShareableBaseUrl,
  DEFAULT_SHARED_APP_URL,
  buildCustomerMarketplaceUrl,
  buildCustomerStoreUrl,
  buildMerchantLoginUrl,
  buildStaffClockInUrl,
  buildRiderPortalUrl,
  buildAdminPortalUrl,
} from '../../utils/urlHelper';
import { QRCodeModal } from './QRCodeModal';

interface CustomerShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  activeStoreId?: string;
  themeMode?: 'midnight' | 'monochrome';
  onNavigate?: (view: 'customer' | 'merchant_login' | 'staff_clockin' | 'rider' | 'admin', storeId?: string) => void;
}

type TabType = 'customer' | 'merchant' | 'staff' | 'all';

export const CustomerShareModal: React.FC<CustomerShareModalProps> = ({
  isOpen,
  onClose,
  stores,
  activeStoreId,
  onNavigate,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('customer');
  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => activeStoreId || stores[0]?.id || 'store-1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Base URL mode: 'public' (for phone scanning & external sharing) vs 'preview' (for local test)
  const [usePublicUrl, setUsePublicUrl] = useState<boolean>(true);
  const [customBaseInput, setCustomBaseInput] = useState<string>(() => getShareableBaseUrl());
  const [isEditingBaseUrl, setIsEditingBaseUrl] = useState<boolean>(false);

  // QR Code Modal State
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

  if (!isOpen) return null;

  const currentStore = stores.find((s) => s.id === selectedStoreId) || stores[0];
  const effectiveBaseUrl = usePublicUrl ? customBaseInput : getLocalPreviewBaseUrl();

  const marketplaceUrl = buildCustomerMarketplaceUrl(effectiveBaseUrl);
  const storeCustomerUrl = currentStore ? buildCustomerStoreUrl(currentStore.id, effectiveBaseUrl) : marketplaceUrl;
  const merchantControlsUrl = currentStore ? buildMerchantLoginUrl(currentStore.id, effectiveBaseUrl) : '';
  const staffClockInUrl = currentStore ? buildStaffClockInUrl(currentStore.id, effectiveBaseUrl) : '';
  const riderUrl = buildRiderPortalUrl(effectiveBaseUrl);
  const adminUrl = buildAdminPortalUrl(effectiveBaseUrl);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const openQr = (url: string, title: string, subtitle: string, badge: string, onTest?: () => void) => {
    setQrModalData({
      isOpen: true,
      url,
      title,
      subtitle,
      badge,
      onTest,
    });
  };

  const handleSaveCustomBase = () => {
    setCustomShareableBaseUrl(customBaseInput);
    setIsEditingBaseUrl(false);
  };

  const handleResetCustomBase = () => {
    setCustomBaseInput(DEFAULT_SHARED_APP_URL);
    setCustomShareableBaseUrl(DEFAULT_SHARED_APP_URL);
    setIsEditingBaseUrl(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div
          className={`max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-5 border flex flex-col max-h-[92vh] overflow-hidden transition-all ${
            isDark
              ? 'bg-[#0B0F19] text-white border-slate-800'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                <Share2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">Active Portal Links & QR Center</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    100% Tested
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Useful links with 1-click test navigation, mobile phone QR codes, and credentials.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Base URL Settings & Phone Sharing Mode */}
          <div
            className={`p-3 rounded-2xl border text-xs space-y-2 shrink-0 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Link Destination Domain:</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-700/50 text-[11px]">
                <button
                  onClick={() => setUsePublicUrl(true)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    usePublicUrl
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📱 Public Web (Phones & Customers)
                </button>
                <button
                  onClick={() => setUsePublicUrl(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    !usePublicUrl
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💻 Local Preview
                </button>
              </div>
            </div>

            {usePublicUrl && (
              <div className="flex items-center gap-2 pt-1">
                {isEditingBaseUrl ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customBaseInput}
                      onChange={(e) => setCustomBaseInput(e.target.value)}
                      placeholder="https://..."
                      className={`flex-1 px-2.5 py-1 rounded-lg text-xs font-mono border focus:outline-hidden ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                    <button
                      onClick={handleSaveCustomBase}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleResetCustomBase}
                      className="px-2 py-1 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between font-mono text-[11px] text-slate-400 overflow-hidden">
                    <span className="truncate">{customBaseInput}</span>
                    <button
                      onClick={() => setIsEditingBaseUrl(true)}
                      className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer ml-2 shrink-0"
                    >
                      Edit URL
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Store Selector (for store-specific links) */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <StoreIcon className="w-3.5 h-3.5" />
              <span>Target Store:</span>
            </label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className={`flex-1 max-w-xs px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-hidden ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className={isDark ? 'bg-slate-900 text-white' : ''}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs */}
          <div
            className={`flex items-center gap-1 p-1 rounded-2xl border text-xs font-bold shrink-0 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'customer'
                  ? isDark
                    ? 'bg-white text-slate-950 font-black shadow-xs'
                    : 'bg-slate-950 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Customer Links</span>
            </button>
            <button
              onClick={() => setActiveTab('merchant')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'merchant'
                  ? isDark
                    ? 'bg-white text-slate-950 font-black shadow-xs'
                    : 'bg-slate-950 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Merchant Controls</span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'staff'
                  ? isDark
                    ? 'bg-white text-slate-950 font-black shadow-xs'
                    : 'bg-slate-950 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Staff Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'all'
                  ? isDark
                    ? 'bg-white text-slate-950 font-black shadow-xs'
                    : 'bg-slate-950 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>All Portals</span>
            </button>
          </div>

          {/* Tab Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* 1. CUSTOMER TAB */}
            {activeTab === 'customer' && (
              <div className="space-y-4">
                {/* 1A. Direct Store Menu */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black flex items-center gap-1.5">
                        <StoreIcon className="w-3.5 h-3.5 text-orange-500" />
                        <span>Direct Menu Link: "{currentStore.name}"</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Opens directly to this store's ordering catalog with 3km delivery checkout.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold shrink-0">
                      Storefront
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={storeCustomerUrl}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl font-mono border select-all ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                    <button
                      onClick={() => handleCopy(storeCustomerUrl, 'store-cust')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      {copiedKey === 'store-cust' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'store-cust' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() =>
                        openQr(
                          storeCustomerUrl,
                          `${currentStore.name} Menu`,
                          'Scan with any phone to open direct customer order menu',
                          'Customer QR',
                          onNavigate ? () => onNavigate('customer', currentStore.id) : undefined
                        )
                      }
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      title="Show Mobile QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>QR</span>
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('customer', currentStore.id);
                        }}
                        className="px-3 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        title="Switch to this view right now"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Test In-App</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 1B. Full Marketplace Customer Link */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Customer Marketplace (All 3km Stores)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Shows all verified neighborhood merchants within 3.0 km.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                      Marketplace
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={marketplaceUrl}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl font-mono border select-all ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                    <button
                      onClick={() => handleCopy(marketplaceUrl, 'market-cust')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      {copiedKey === 'market-cust' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'market-cust' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() =>
                        openQr(
                          marketplaceUrl,
                          'Local Marketplace',
                          'Scan with any phone to browse all neighborhood stores within 3km',
                          'Marketplace QR',
                          onNavigate ? () => onNavigate('customer') : undefined
                        )
                      }
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      title="Show Mobile QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>QR</span>
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('customer');
                        }}
                        className="px-3 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        title="Switch to this view right now"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Test In-App</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. MERCHANT CONTROLS TAB */}
            {activeTab === 'merchant' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Merchant Controls Portal: "{currentStore.name}"</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Dedicated landing page where merchant enters admin password to access KDS, menu & P&L.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold shrink-0">
                      Password Protected
                    </span>
                  </div>

                  {/* Password recovery reminder */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Store Admin Password:</span>
                      <strong className="font-mono bg-black/20 px-2 py-0.5 rounded-md">
                        {currentStore.adminPassword || currentStore.managerPasswordHash || 'manager123'}
                      </strong>
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          currentStore.adminPassword || currentStore.managerPasswordHash || 'manager123',
                          'pass-val'
                        )
                      }
                      className="text-[10px] underline font-bold cursor-pointer"
                    >
                      {copiedKey === 'pass-val' ? 'Copied Password!' : 'Copy Password'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={merchantControlsUrl}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl font-mono border select-all ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                    <button
                      onClick={() => handleCopy(merchantControlsUrl, 'merch-link')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      {copiedKey === 'merch-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'merch-link' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() =>
                        openQr(
                          merchantControlsUrl,
                          `${currentStore.name} Controls`,
                          `Scan to open Merchant Login. Admin Password: ${currentStore.adminPassword || 'manager123'}`,
                          'Merchant QR',
                          onNavigate ? () => onNavigate('merchant_login', currentStore.id) : undefined
                        )
                      }
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      title="Show Mobile QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>QR</span>
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('merchant_login', currentStore.id);
                        }}
                        className="px-3 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        title="Test merchant login screen immediately"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Test In-App</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. STAFF ATTENDANCE TAB */}
            {activeTab === 'staff' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Staff Phone Clock-In (GPS & Selfie): "{currentStore.name}"</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Staff scan this QR code or open this link on their phones to punch in with latitude/longitude & camera picture.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                      Mobile Ready
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={staffClockInUrl}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl font-mono border select-all ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                    <button
                      onClick={() => handleCopy(staffClockInUrl, 'staff-link')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    >
                      {copiedKey === 'staff-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'staff-link' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() =>
                        openQr(
                          staffClockInUrl,
                          `Staff Clock-In (${currentStore.name})`,
                          'Staff can point their smartphone camera here to clock in with GPS & selfie photo',
                          'Staff QR',
                          onNavigate ? () => onNavigate('staff_clockin', currentStore.id) : undefined
                        )
                      }
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      title="Show Mobile QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>QR</span>
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('staff_clockin', currentStore.id);
                        }}
                        className="px-3 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                        title="Test staff clock in screen immediately"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Test In-App</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. ALL PORTALS TAB */}
            {activeTab === 'all' && (
              <div className="space-y-3">
                {/* Rider Courier */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Bike className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rider Courier Dispatch Queue</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono truncate">{riderUrl}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(riderUrl, 'rider-url')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {copiedKey === 'rider-url' ? 'Copied' : 'Copy'}
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('rider');
                        }}
                        className="px-2.5 py-1.5 bg-white text-slate-950 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>

                {/* Platform Creator Admin */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Platform Creator Master Hub</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono truncate">{adminUrl}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(adminUrl, 'admin-url')}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {copiedKey === 'admin-url' ? 'Copied' : 'Copy'}
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate('admin');
                        }}
                        className="px-2.5 py-1.5 bg-white text-slate-950 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-100"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400">
              Need to share links? Point phone camera at QR or copy the public web link.
            </span>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Viewer Modal */}
      <QRCodeModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData((prev) => ({ ...prev, isOpen: false }))}
        url={qrModalData.url}
        title={qrModalData.title}
        subtitle={qrModalData.subtitle}
        badge={qrModalData.badge}
        onTestInApp={qrModalData.onTest}
      />
    </>
  );
};
