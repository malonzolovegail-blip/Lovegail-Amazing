import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  UtensilsCrossed,
  Boxes,
  Users,
  TrendingUp,
  Palette,
  Cloud,
  FileSpreadsheet,
  Store as StoreIcon,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  AlertOctagon,
  Lock,
  Smartphone,
  LogOut,
  KeyRound,
  User,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import {
  Store,
  MenuItem,
  Order,
  OrderStatus,
  Rider,
  Staff,
  Timecard,
  InventoryItem,
  InventoryMovementLog,
  PromoCode,
  UserRole,
} from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  buildCustomerStoreUrl,
  buildStaffClockInUrl,
  buildMerchantLoginUrl,
} from '../../utils/urlHelper';
import { QRCodeModal } from '../Modals/QRCodeModal';
import { KitchenDisplay } from './KitchenDisplay';
import { POSWalkIn } from './POSWalkIn';
import { MenuManager } from './MenuManager';
import { InventoryManager } from './InventoryManager';
import { StaffPayroll } from './StaffPayroll';
import { SalesAnalytics } from './SalesAnalytics';
import { StoreSettings } from './StoreSettings';
import { LossesExpensesMonitor } from './LossesExpensesMonitor';

interface MerchantLayoutProps {
  store: Store;
  allStores: Store[];
  currentRole: UserRole;
  orders: Order[];
  riders: Rider[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  inventoryLogs: InventoryMovementLog[];
  staffList: Staff[];
  timecards: Timecard[];
  promos: PromoCode[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAssignRider: (orderId: string, riderId: string) => void;
  onPlaceWalkInOrder: (order: Order) => void;
  onUpdateMenuItems: (items: MenuItem[]) => void;
  onUpdateInventory: (items: InventoryItem[]) => void;
  onAddInventoryLog: (log: InventoryMovementLog) => void;
  onUpdateTimecards: (timecards: Timecard[]) => void;
  onUpdateStaffList: (staff: Staff[]) => void;
  onUpdateStore: (updatedStore: Store) => void;
  onUpdatePromos: (updatedPromos: PromoCode[]) => void;
  onOpenGoogleDriveModal: () => void;
  onSwitchToCustomerView: () => void;
  onOpenStaffClockIn?: () => void;
}

export type MerchantTab =
  | 'kitchen'
  | 'inventory'
  | 'staff'
  | 'pos'
  | 'losses'
  | 'sales'
  | 'menu'
  | 'settings';

export const MerchantLayout: React.FC<MerchantLayoutProps> = ({
  store,
  allStores,
  currentRole,
  orders,
  riders,
  menuItems,
  inventory,
  inventoryLogs,
  staffList,
  timecards,
  promos,
  onUpdateOrderStatus,
  onAssignRider,
  onPlaceWalkInOrder,
  onUpdateMenuItems,
  onUpdateInventory,
  onAddInventoryLog,
  onUpdateTimecards,
  onUpdateStaffList,
  onUpdateStore,
  onUpdatePromos,
  onOpenGoogleDriveModal,
  onSwitchToCustomerView,
  onOpenStaffClockIn,
}) => {
  const isStaffMode = currentRole === 'staff';
  const { isDark } = useTheme();
  const storeStaff = staffList.filter((s) => s.storeId === store.id);

  // Staff Terminal Login State
  const [authenticatedStaff, setAuthenticatedStaff] = useState<Staff | null>(null);
  const [staffSelectId, setStaffSelectId] = useState<string>(() => storeStaff[0]?.id || '');
  const [staffPin, setStaffPin] = useState<string>('');
  const [staffPinError, setStaffPinError] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
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

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  // Default tab based on role: Staff defaults to Kitchen; Merchant Admin defaults to Losses/Expenses
  const [activeTab, setActiveTab] = useState<MerchantTab>(() => (isStaffMode ? 'kitchen' : 'losses'));

  useEffect(() => {
    if (isStaffMode && !['kitchen', 'inventory', 'staff', 'pos'].includes(activeTab)) {
      setActiveTab('kitchen');
    }
  }, [isStaffMode]);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = storeStaff.find((s) => s.id === staffSelectId) || storeStaff[0];
    if (!staff) return;
    const expectedPin = staff.pin || '1234';
    if (staffPin.trim() === expectedPin || staffPin.trim() === '1234') {
      setAuthenticatedStaff(staff);
      setStaffPinError(null);
    } else {
      setStaffPinError('Incorrect 4-digit staff PIN. (Demo default: 1234)');
    }
  };

  const pendingKitchenOrdersCount = orders.filter(
    (o) => o.storeId === store.id && (o.status === 'New' || o.status === 'Preparing')
  ).length;

  const lowStockCount = inventory.filter(
    (i) => i.storeId === store.id && i.currentStock <= i.minReorderLevel
  ).length;

  // Tabs for STAFF ONLY: KDS, Daily Inventory In/Out, Clock In/Out, POS
  const staffNavItems = [
    {
      id: 'kitchen' as MerchantTab,
      label: 'Kitchen Display (KDS)',
      sub: 'Order Photos & Cooking Status',
      icon: ChefHat,
      badge: pendingKitchenOrdersCount > 0 ? `${pendingKitchenOrdersCount} active` : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'inventory' as MerchantTab,
      label: 'Daily Inventory (In & Out)',
      sub: 'Editable Stock IN/OUT & Spoilage',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'staff' as MerchantTab,
      label: 'Staff Clock In / Out',
      sub: 'Daily Punch Card Terminal',
      icon: Clock,
    },
    {
      id: 'pos' as MerchantTab,
      label: 'Walk-in Counter POS',
      sub: 'Take Dine-in & Takeout Tickets',
      icon: UtensilsCrossed,
    },
  ];

  // Tabs for MERCHANT ADMIN: Financials, Losses & Expenses, Sales, Payroll, Menu, Inventory, Theme & Security
  const adminNavItems = [
    {
      id: 'losses' as MerchantTab,
      label: 'Losses & Expenses Monitor',
      sub: 'Connected to Spoilage & COGS',
      icon: AlertOctagon,
      highlight: true,
    },
    {
      id: 'sales' as MerchantTab,
      label: 'Sales & Real-Time Analytics',
      sub: 'Omnichannel & ₱5 Fee Ledger',
      icon: TrendingUp,
    },
    {
      id: 'inventory' as MerchantTab,
      label: 'Daily Inventory & Supplies',
      sub: 'Editable IN/OUT & Excel Import',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'staff' as MerchantTab,
      label: 'Staff Payroll & Salaries',
      sub: 'Wage Rates & Payslip Generator',
      icon: Users,
    },
    {
      id: 'menu' as MerchantTab,
      label: 'Menu & Food Photos',
      sub: 'Dishes, Pricing & Variants',
      icon: StoreIcon,
    },
    {
      id: 'kitchen' as MerchantTab,
      label: 'Kitchen Display (KDS)',
      sub: 'Order Photos & Status Oversight',
      icon: ChefHat,
      badge: pendingKitchenOrdersCount > 0 ? `${pendingKitchenOrdersCount} active` : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'pos' as MerchantTab,
      label: 'Walk-in Order POS',
      sub: 'Counter Order Terminal',
      icon: UtensilsCrossed,
    },
    {
      id: 'settings' as MerchantTab,
      label: 'Theme & Owner Security',
      sub: 'Manager Password & 3km Rules',
      icon: Palette,
    },
  ];

  const currentNavItems = isStaffMode ? staffNavItems : adminNavItems;

  if (isStaffMode && !authenticatedStaff) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div
          className={`rounded-3xl border shadow-xl overflow-hidden transition-colors ${
            isDark ? 'bg-[#0E1422] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white text-center border-b border-slate-700">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-black">{store.name}</h2>
            <p className="text-xs text-slate-300">Staff Kitchen & Terminal Log-In</p>
          </div>

          <form onSubmit={handleStaffLogin} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Select Staff Profile</span>
              </label>
              <select
                value={staffSelectId}
                onChange={(e) => setStaffSelectId(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold focus:outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {storeStaff.map((staff) => (
                  <option key={staff.id} value={staff.id} className={isDark ? 'bg-slate-900 text-white' : ''}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                <span>4-Digit Staff Terminal PIN</span>
              </label>
              <input
                type="password"
                maxLength={6}
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                placeholder="Enter 4-digit staff PIN..."
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono text-center tracking-widest focus:outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              <span className={`text-[10px] block text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Demo default staff PIN: <strong className="font-mono">1234</strong>
              </span>
            </div>

            {staffPinError && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs font-medium">
                {staffPinError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Log In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenStaffClockIn && (
              <button
                type="button"
                onClick={onOpenStaffClockIn}
                className={`w-full py-2.5 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-800/50 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>📱 Staff Phone Clock-In (GPS & Photo)</span>
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <span>✓</span>
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Role Banner Indicator */}
      <div
        className={`p-3 rounded-2xl mb-4 flex items-center justify-between text-xs font-bold border transition-colors ${
          isStaffMode
            ? isDark
              ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
            : isDark
            ? 'bg-[#0E1422] border-slate-800 text-white'
            : 'bg-slate-900 border-slate-800 text-white shadow-md'
        }`}
      >
        <div className="flex items-center gap-2">
          {isStaffMode ? (
            <ChefHat className="w-4 h-4 text-amber-400" />
          ) : (
            <Shield className="w-4 h-4 text-amber-400" />
          )}
          <span>
            {isStaffMode
              ? '👨‍🍳 Staff Operational Terminal (Kitchen KDS, Editable Inventory In/Out, Clock In/Out Only)'
              : '🏪 Merchant Admin Console (Manager & Owner Access: Losses & Expenses Monitor, Financial P&L, Payroll, Store Settings)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white/20 text-current">
            {isStaffMode ? 'Staff Role' : 'Merchant Admin'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar (3 columns) */}
        <aside
          className={`lg:col-span-3 rounded-3xl border shadow-xs p-4 space-y-4 sticky top-24 transition-colors ${
            isDark ? 'bg-[#0E1422] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Store Identification Card */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{store.name}</h3>
              <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{store.category} • {store.distanceKm} km zone</span>
              <span
                className={`inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  store.isOpen
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                    : 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
                }`}
              >
                {store.isOpen ? '● Open for Orders' : '○ Closed'}
              </span>
            </div>
          </div>

          {/* Active Logged-in Staff Member (Staff Terminal) */}
          {isStaffMode && authenticatedStaff && (
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                  {authenticatedStaff.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate max-w-[130px]">{authenticatedStaff.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{authenticatedStaff.role}</span>
                </div>
              </div>
              <button
                onClick={() => setAuthenticatedStaff(null)}
                title="Log out of staff terminal"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                    isActive
                      ? isDark
                        ? 'bg-white text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-950 text-white font-bold shadow-xs'
                      : (item as any).highlight
                      ? isDark
                        ? 'bg-rose-950/30 text-rose-300 font-bold border border-rose-900/40 hover:bg-rose-900/30'
                        : 'bg-rose-50 text-rose-900 font-bold border border-rose-200 hover:bg-rose-100'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-xl ${
                        isActive
                          ? isDark
                            ? 'bg-slate-950/10 text-slate-950'
                            : 'bg-white/20 text-white'
                          : (item as any).highlight
                          ? 'bg-rose-600 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate leading-tight">
                        {item.label}
                      </span>
                      <span
                        className={`text-[10px] truncate block ${
                          isActive
                            ? isDark
                              ? 'text-slate-600'
                              : 'text-slate-300'
                            : (item as any).highlight
                            ? 'text-rose-400 font-semibold'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.sub}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {/* Quick Share Store Customer Link */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const storeLink = buildCustomerStoreUrl(store.id);
                  navigator.clipboard.writeText(storeLink);
                  showToast(`Customer link for ${store.name} copied!`);
                }}
                className={`flex-1 p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Customer Store Link</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              <button
                onClick={() =>
                  setQrModalData({
                    isOpen: true,
                    url: buildCustomerStoreUrl(store.id),
                    title: `${store.name} Customer Menu`,
                    subtitle: 'Scan with smartphone camera to view menu & order',
                    badge: 'Menu QR',
                    onTest: onSwitchToCustomerView,
                  })
                }
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-amber-400'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-amber-700'
                }`}
                title="Show Customer Menu QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Share Staff Phone Clock-In Link */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const clockInLink = buildStaffClockInUrl(store.id);
                  navigator.clipboard.writeText(clockInLink);
                  showToast('Staff Phone Clock-In Link (GPS + Selfie) copied!');
                }}
                className={`flex-1 p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-800/40 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Staff Phone Clock-In</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              <button
                onClick={() =>
                  setQrModalData({
                    isOpen: true,
                    url: buildStaffClockInUrl(store.id),
                    title: `${store.name} Staff Clock-In`,
                    subtitle: 'Staff scan to open GPS & selfie clock-in station on phone',
                    badge: 'Staff QR',
                    onTest: onOpenStaffClockIn,
                  })
                }
                className={`p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-800/40 text-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
                title="Show Staff Clock-In QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Share Merchant Controls Link (Manager only) */}
            {!isStaffMode && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const merchLink = buildMerchantLoginUrl(store.id);
                    navigator.clipboard.writeText(merchLink);
                    showToast(`Merchant Controls Link copied! Password: ${store.adminPassword || 'manager123'}`);
                  }}
                  className={`flex-1 p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    <span>Controls Link (Pass: {store.adminPassword || 'manager123'})</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  onClick={() =>
                    setQrModalData({
                      isOpen: true,
                      url: buildMerchantLoginUrl(store.id),
                      title: `${store.name} Controls`,
                      subtitle: `Merchant Login portal. Admin Password: ${store.adminPassword || 'manager123'}`,
                      badge: 'Merchant QR',
                    })
                  }
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                  title="Show Merchant Login QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isStaffMode && (
              <button
                onClick={onOpenGoogleDriveModal}
                className={`w-full p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-cyan-400" />
                  <span>Google Drive Backups</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}

            <button
              onClick={onSwitchToCustomerView}
              className={`w-full p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 opacity-60" />
                <span>View Customer Storefront</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </aside>

        {/* Dynamic Main Workspace Content (9 columns) */}
        <main className="lg:col-span-9">
          {/* 1. KITCHEN DISPLAY SYSTEM */}
          {activeTab === 'kitchen' && (
            <KitchenDisplay
              store={store}
              orders={orders}
              riders={riders}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onAssignRider={onAssignRider}
            />
          )}

          {/* 2. DAILY INVENTORY IN & OUT (DIRECTLY EDITABLE) */}
          {activeTab === 'inventory' && (
            <InventoryManager
              store={store}
              inventory={inventory}
              inventoryLogs={inventoryLogs}
              onUpdateInventory={onUpdateInventory}
              onAddInventoryLog={onAddInventoryLog}
              isStaffOnlyView={isStaffMode}
            />
          )}

          {/* 3. STAFF CLOCK IN/OUT & PAYROLL */}
          {activeTab === 'staff' && (
            <StaffPayroll
              store={store}
              staffList={staffList}
              timecards={timecards}
              onUpdateTimecards={onUpdateTimecards}
              onUpdateStaffList={onUpdateStaffList}
              isStaffOnlyView={isStaffMode}
              onOpenMobileClockIn={onOpenStaffClockIn}
            />
          )}

          {/* 4. WALK-IN COUNTER POS */}
          {activeTab === 'pos' && (
            <POSWalkIn
              store={store}
              menuItems={menuItems}
              onPlaceWalkInOrder={onPlaceWalkInOrder}
            />
          )}

          {/* 5. LOSSES & EXPENSES MONITOR (MERCHANT ADMIN ONLY) */}
          {activeTab === 'losses' && !isStaffMode && (
            <LossesExpensesMonitor
              store={store}
              orders={orders}
              inventory={inventory}
              inventoryLogs={inventoryLogs}
              timecards={timecards}
              staffList={staffList}
            />
          )}

          {/* 6. SALES & REVENUE ANALYTICS (MERCHANT ADMIN ONLY) */}
          {activeTab === 'sales' && !isStaffMode && (
            <SalesAnalytics store={store} orders={orders} />
          )}

          {/* 7. MENU & PHOTO UPLOADS (MERCHANT ADMIN ONLY) */}
          {activeTab === 'menu' && !isStaffMode && (
            <MenuManager
              store={store}
              menuItems={menuItems}
              onUpdateMenuItems={onUpdateMenuItems}
            />
          )}

          {/* 8. STORE SETTINGS, THEME & OWNER MANAGER PASSWORD (MERCHANT ADMIN ONLY) */}
          {activeTab === 'settings' && !isStaffMode && (
            <StoreSettings
              store={store}
              allStores={allStores}
              promos={promos}
              onUpdateStore={onUpdateStore}
              onUpdatePromos={onUpdatePromos}
            />
          )}
        </main>
      </div>

      {/* QR Code Modal for Merchant Sidebar Actions */}
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
