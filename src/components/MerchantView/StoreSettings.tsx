import React, { useState, useRef } from 'react';
import {
  Palette,
  Upload,
  Lock,
  ShieldCheck,
  CheckCircle,
  Tag,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Store, PromoCode } from '../../types';
import { PromocodeBanner } from '../CustomerView/PromocodeBanner';

interface StoreSettingsProps {
  store: Store;
  allStores: Store[];
  promos: PromoCode[];
  onUpdateStore: (updatedStore: Store) => void;
  onUpdatePromos: (updatedPromos: PromoCode[]) => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  store,
  allStores,
  promos,
  onUpdateStore,
  onUpdatePromos,
}) => {
  const [formData, setFormData] = useState<Store>({ ...store });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Owner security password change state
  const [ownerKeyInput, setOwnerKeyInput] = useState('');
  const [newManagerPassword, setNewManagerPassword] = useState('');
  const [confirmManagerPassword, setConfirmManagerPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [showManagerPassword, setShowManagerPassword] = useState(false);

  // New promo state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscountType, setNewPromoDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState(15);
  const [newPromoMinOrder, setNewPromoMinOrder] = useState(200);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  const logoUploadRef = useRef<HTMLInputElement>(null);
  const bannerUploadRef = useRef<HTMLInputElement>(null);

  const storePromos = promos.filter((p) => p.storeId === store.id || !p.storeId);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, bannerUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreSettings = () => {
    onUpdateStore(formData);
    setStatusMessage('Store branding and delivery rules updated!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // OWNER-ONLY PASSWORD MANAGEMENT FOR MANAGER SECURITY
  const handleChangeManagerPassword = () => {
    setPasswordChangeError(null);
    setPasswordChangeSuccess(false);

    // Verify Owner authorization credentials
    const currentOwnerPass = store.ownerPasswordHash || 'owner123';
    if (ownerKeyInput.trim() !== currentOwnerPass) {
      setPasswordChangeError('Authentication Failed: Invalid Owner Security Passkey. Only the store Owner is authorized to change Manager credentials.');
      return;
    }

    if (!newManagerPassword.trim() || newManagerPassword.length < 5) {
      setPasswordChangeError('New Manager Password must be at least 5 characters long.');
      return;
    }

    if (newManagerPassword !== confirmManagerPassword) {
      setPasswordChangeError('New password and confirmation do not match.');
      return;
    }

    // Save updated password in store record
    const updatedStore = {
      ...store,
      managerPasswordHash: newManagerPassword.trim(),
    };
    onUpdateStore(updatedStore);
    setFormData(updatedStore);

    setOwnerKeyInput('');
    setNewManagerPassword('');
    setConfirmManagerPassword('');
    setPasswordChangeSuccess(true);
    setTimeout(() => setPasswordChangeSuccess(false), 4000);
  };

  // Promo code actions
  const handleAddPromo = () => {
    if (!newPromoCode.trim()) return;

    const promo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoDiscountType,
      discountValue: newPromoValue,
      minOrder: newPromoMinOrder,
      validUntil: '2026-12-31',
      description: newPromoDesc.trim() || `${newPromoDiscountType === 'percentage' ? `${newPromoValue}%` : `₱${newPromoValue}`} OFF`,
      storeId: store.id,
    };

    onUpdatePromos([...promos, promo]);
    setNewPromoCode('');
    setNewPromoDesc('');
    setStatusMessage(`Promo code ${promo.code} created for your store!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDeletePromo = (id: string) => {
    onUpdatePromos(promos.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
            <Palette className="w-4 h-4" />
            <span>Theme, Branding & Owner Security</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Store Customization & Access Control
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload custom store logo, banner images, adjust 3km delivery rates, and securely manage manager passwords as owner.
          </p>
        </div>

        <button
          onClick={handleSaveStoreSettings}
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
        >
          Save All Store Settings
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Grid: Theme Branding & Delivery Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Theme & Photo Uploads */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-orange-600" />
            <span>Store Theme & Visual Assets</span>
          </h3>

          {/* Logo Upload */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Store Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={logoUploadRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoUploadRef.current?.click()}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo Image</span>
                </button>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="Or paste logo URL"
                  className="w-full px-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Store Cover Banner
            </label>
            <div className="space-y-2">
              <div className="h-28 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={formData.bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={bannerUploadRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerUploadRef.current?.click()}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Banner Photo</span>
                </button>
                <input
                  type="text"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="Or banner URL"
                  className="flex-1 px-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Theme Color Picker */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Store Theme Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.themeColor}
                onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-gray-700">
                {formData.themeColor}
              </span>
            </div>
          </div>

          {/* Store Open/Close Toggle */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-gray-900 block">Store Status</span>
              <span className="text-[11px] text-gray-500">
                {formData.isOpen
                  ? 'Store is currently OPEN and accepting orders.'
                  : 'Store is currently CLOSED.'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                formData.isOpen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {formData.isOpen ? 'OPEN' : 'CLOSED'}
            </button>
          </div>
        </div>

        {/* 3-Km Adjustable Delivery Rules */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <span>Adjustable 3-Km Delivery Rules</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Base Delivery Fee (PHP)
              </label>
              <input
                type="number"
                value={formData.baseDeliveryFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    baseDeliveryFee: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Per-Km Charge (PHP)
              </label>
              <input
                type="number"
                value={formData.perKmDeliveryFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    perKmDeliveryFee: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Minimum Order (PHP)
              </label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderAmount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Free Delivery Above (PHP)
              </label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold || 500}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeDeliveryThreshold: parseInt(e.target.value) || 500,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-orange-900 font-medium">
            <strong>Platform Rule:</strong> Delivery radius is locked to the 3.0 kilometer neighborhood radius. ₱5 platform processing fee is automatically reflected to the customer and platform ledger.
          </div>
        </div>
      </div>

      {/* STRICT OWNER ACCESS: MANAGER LOGIN PASSWORD CONTROL */}
      <div className="bg-linear-to-br from-gray-900 to-gray-800 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                Owner Access Control — Manager Password Security
              </h3>
              <p className="text-xs text-gray-400">
                Security Rule: <strong>Only the verified Owner can change or reset the Manager's login password.</strong>
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono bg-amber-400 text-gray-900 font-black px-2 py-0.5 rounded-full uppercase">
            Owner Only
          </span>
        </div>

        {passwordChangeSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Success: Store Manager login password has been securely updated!</span>
          </div>
        )}

        {passwordChangeError && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs font-bold text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{passwordChangeError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
              Owner Security Passkey
            </label>
            <input
              type="password"
              value={ownerKeyInput}
              onChange={(e) => setOwnerKeyInput(e.target.value)}
              placeholder="Enter Owner master passkey"
              className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-amber-400"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Default: owner123</span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
              New Manager Password
            </label>
            <div className="relative">
              <input
                type={showManagerPassword ? 'text' : 'password'}
                value={newManagerPassword}
                onChange={(e) => setNewManagerPassword(e.target.value)}
                placeholder="Set new manager password"
                className="w-full px-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowManagerPassword(!showManagerPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showManagerPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1">
              Confirm New Password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={confirmManagerPassword}
                onChange={(e) => setConfirmManagerPassword(e.target.value)}
                placeholder="Re-type new password"
                className="flex-1 px-3 py-2 text-xs bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={handleChangeManagerPassword}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                Authorize & Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Code Management Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                Store Promo Codes & Vouchers
              </h3>
              <p className="text-xs text-gray-500">
                Live customer banner display — this is how your deals appear inside your store to shoppers.
              </p>
            </div>
          </div>
        </div>

        {/* Live Deals & Vouchers Banner as attached by user */}
        <PromocodeBanner
          promos={promos}
          stores={allStores}
          currentStore={store}
          isMerchantView={true}
          onDeletePromo={handleDeletePromo}
        />

        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Voucher Code</label>
            <input
              type="text"
              value={newPromoCode}
              onChange={(e) => setNewPromoCode(e.target.value)}
              placeholder="e.g. SIZZLE20"
              className="w-full px-3 py-1.5 text-xs uppercase font-mono font-bold bg-white border border-gray-300 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Discount Type</label>
            <select
              value={newPromoDiscountType}
              onChange={(e) =>
                setNewPromoDiscountType(e.target.value as 'percentage' | 'fixed')
              }
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Pesos (₱)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              Value ({newPromoDiscountType === 'percentage' ? '%' : '₱'})
            </label>
            <input
              type="number"
              value={newPromoValue}
              onChange={(e) => setNewPromoValue(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-bold"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-gray-600 block mb-1">Min. Order</label>
              <input
                type="number"
                value={newPromoMinOrder}
                onChange={(e) => setNewPromoMinOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-bold"
              />
            </div>
            <button
              onClick={handleAddPromo}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Create
            </button>
          </div>
        </div>

        {/* Existing Promos Table */}
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
          {storePromos.map((promo) => (
            <div key={promo.id} className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                  {promo.code}
                </span>
                <span className="font-bold text-orange-600">
                  {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₱${promo.discountValue} OFF`}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">Min. order ₱{promo.minOrder}</span>
              </div>

              <button
                onClick={() => handleDeletePromo(promo.id)}
                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
