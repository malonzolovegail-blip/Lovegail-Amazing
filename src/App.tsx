import React, { useState, useEffect } from 'react';
import {
  UserRole,
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
  CartItem,
} from './types';
import {
  getInitialStores,
  getInitialMenuItems,
  getInitialOrders,
  getInitialRiders,
  getInitialStaff,
  getInitialTimecards,
  getInitialInventory,
  getInitialPromos,
  saveToStorage,
  STORAGE_KEYS,
  loadFromStorage,
} from './services/storage';
import { initAuth } from './services/firebaseAuth';
import { Navbar } from './components/Navbar';
import { StoreListing } from './components/CustomerView/StoreListing';
import { StoreDetail } from './components/CustomerView/StoreDetail';
import { ProductModal } from './components/CustomerView/ProductModal';
import { CartDrawer } from './components/CustomerView/CartDrawer';
import { ReceiptModal } from './components/CustomerView/ReceiptModal';
import { MerchantLayout } from './components/MerchantView/MerchantLayout';
import { RiderDashboard } from './components/RiderView/RiderDashboard';
import { PlatformAdmin } from './components/PlatformView/PlatformAdmin';
import { GoogleDriveBackupModal } from './components/MerchantView/GoogleDriveBackupModal';
import { StoreRegisterModal } from './components/Modals/StoreRegisterModal';
import { RiderRegisterModal } from './components/Modals/RiderRegisterModal';
import { CustomerShareModal } from './components/Modals/CustomerShareModal';
import { MerchantLoginLanding } from './components/MerchantView/MerchantLoginLanding';
import { StaffMobileClockIn } from './components/StaffView/StaffMobileClockIn';
import { FreeCloudModal } from './components/Modals/FreeCloudModal';
import {
  testCloudConnection,
  initFreeCloudListeners,
  pushOrderToCloud,
  pushEntireStateToCloud,
} from './services/freeCloudSync';
import { useTheme } from './context/ThemeContext';
import { syncAddressBar } from './utils/urlHelper';

export default function App() {
  // Theme state from ThemeContext: 2-shade Midnight or Monochrome
  const { themeMode, setThemeMode, toggleTheme, isDark } = useTheme();
  const [isFreeCloudModalOpen, setIsFreeCloudModalOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Main Navigation / Persona Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [isCustomerOnlyMode, setIsCustomerOnlyMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'customer' || params.get('mode') === 'customer';
  });
  const [isStaffClockInMode, setIsStaffClockInMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'staff_clockin' || params.get('mode') === 'staff_clockin';
  });
  const [isMerchantLoginMode, setIsMerchantLoginMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'merchant_login' || params.get('view') === 'merchant';
  });
  const [authenticatedMerchantStoreIds, setAuthenticatedMerchantStoreIds] = useState<string[]>([]);

  // Core Data States with LocalStorage Persistence
  const [stores, setStores] = useState<Store[]>(() => getInitialStores());
  const [activeStoreId, setActiveStoreId] = useState<string>(() => stores[0]?.id || 'store-1');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getInitialMenuItems());
  const [orders, setOrders] = useState<Order[]>(() => getInitialOrders());
  const [riders, setRiders] = useState<Rider[]>(() => getInitialRiders());
  const [staffList, setStaffList] = useState<Staff[]>(() => getInitialStaff());
  const [timecards, setTimecards] = useState<Timecard[]>(() => getInitialTimecards());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInitialInventory());
  const [inventoryLogs, setInventoryLogs] = useState<InventoryMovementLog[]>(() =>
    loadFromStorage<InventoryMovementLog[]>(STORAGE_KEYS.INVENTORY_LOGS, [
      {
        id: 'log-seed-1',
        itemId: 'inv-1',
        itemName: 'Pork Belly Sisig Cut (kg)',
        storeId: 'store-1',
        type: 'IN',
        quantity: 30,
        reason: 'Morning Supplier Delivery',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        performedBy: 'Kuya Lito (Head Cook)',
      },
      {
        id: 'log-seed-2',
        itemId: 'inv-1',
        itemName: 'Pork Belly Sisig Cut (kg)',
        storeId: 'store-1',
        type: 'OUT',
        quantity: 22,
        reason: 'Daily Kitchen Prep',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        performedBy: 'Kuya Lito (Head Cook)',
      },
    ])
  );
  const [promos, setPromos] = useState<PromoCode[]>(() => getInitialPromos());

  // Customer Shopping Flow State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStoreForCustomer, setSelectedStoreForCustomer] = useState<Store | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [latestReceiptOrder, setLatestReceiptOrder] = useState<Order | null>(null);
  const [prefilledPromoCode, setPrefilledPromoCode] = useState<string | undefined>(undefined);

  // Modals
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [isStoreRegisterModalOpen, setIsStoreRegisterModalOpen] = useState(false);
  const [isRiderRegisterModalOpen, setIsRiderRegisterModalOpen] = useState(false);
  const [isCustomerShareModalOpen, setIsCustomerShareModalOpen] = useState(false);

  // Unified Navigation Handler for Links, QR Codes, and Direct Testing
  const handleNavigate = (
    view: 'customer' | 'merchant_login' | 'staff_clockin' | 'rider' | 'admin',
    storeId?: string
  ) => {
    if (storeId) {
      const targetStore = stores.find((s) => s.id === storeId);
      if (targetStore) {
        setActiveStoreId(targetStore.id);
        setSelectedStoreForCustomer(targetStore);
      }
    }

    if (view === 'customer') {
      setCurrentRole('customer');
      setIsCustomerOnlyMode(true);
      setIsStaffClockInMode(false);
      setIsMerchantLoginMode(false);
      if (!storeId) {
        setSelectedStoreForCustomer(null);
      }
      syncAddressBar({ view: 'customer', store: storeId });
    } else if (view === 'merchant_login') {
      setIsMerchantLoginMode(true);
      setIsStaffClockInMode(false);
      setIsCustomerOnlyMode(false);
      syncAddressBar({ view: 'merchant_login', store: storeId });
    } else if (view === 'staff_clockin') {
      setIsStaffClockInMode(true);
      setIsMerchantLoginMode(false);
      setIsCustomerOnlyMode(false);
      syncAddressBar({ view: 'staff_clockin', store: storeId });
    } else if (view === 'rider') {
      setCurrentRole('rider');
      setIsCustomerOnlyMode(false);
      setIsStaffClockInMode(false);
      setIsMerchantLoginMode(false);
      syncAddressBar({ view: 'rider' });
    } else if (view === 'admin') {
      setCurrentRole('owner');
      setIsCustomerOnlyMode(false);
      setIsStaffClockInMode(false);
      setIsMerchantLoginMode(false);
      syncAddressBar({ view: 'admin' });
    }
  };

  // Handle URL parameters for direct Customer, Merchant Controls & Staff Clock-In landing page links + popstate
  useEffect(() => {
    const parseUrlAndApply = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('mode');
      const storeIdParam = params.get('store');

      if (storeIdParam) {
        const targetStore = stores.find((s) => s.id === storeIdParam);
        if (targetStore) {
          setSelectedStoreForCustomer(targetStore);
          setActiveStoreId(targetStore.id);
        }
      }

      if (viewParam === 'customer') {
        setCurrentRole('customer');
        setIsCustomerOnlyMode(true);
        setIsStaffClockInMode(false);
        setIsMerchantLoginMode(false);
      } else if (viewParam === 'staff_clockin') {
        setIsStaffClockInMode(true);
        setIsMerchantLoginMode(false);
        setIsCustomerOnlyMode(false);
      } else if (viewParam === 'merchant_login' || viewParam === 'merchant') {
        setIsMerchantLoginMode(true);
        setIsStaffClockInMode(false);
        setIsCustomerOnlyMode(false);
      } else if (viewParam === 'staff') {
        setCurrentRole('staff');
        setIsStaffClockInMode(false);
        setIsMerchantLoginMode(false);
        setIsCustomerOnlyMode(false);
      } else if (viewParam === 'rider') {
        setCurrentRole('rider');
        setIsStaffClockInMode(false);
        setIsMerchantLoginMode(false);
        setIsCustomerOnlyMode(false);
      } else if (viewParam === 'admin') {
        setCurrentRole('owner');
        setIsStaffClockInMode(false);
        setIsMerchantLoginMode(false);
        setIsCustomerOnlyMode(false);
      }
    };

    parseUrlAndApply();

    window.addEventListener('popstate', parseUrlAndApply);
    return () => window.removeEventListener('popstate', parseUrlAndApply);
  }, [stores]);

  // Free Cloud Firestore Real-Time Synchronization Listener
  useEffect(() => {
    testCloudConnection().then((connected) => {
      setIsCloudSynced(connected);
    });

    const unsubscribe = initFreeCloudListeners({
      onStores: (cloudStores) => {
        if (cloudStores.length > 0) setStores(cloudStores);
      },
      onOrders: (cloudOrders) => {
        if (cloudOrders.length > 0) setOrders(cloudOrders);
      },
      onTimecards: (cloudTimecards) => {
        if (cloudTimecards.length > 0) setTimecards(cloudTimecards);
      },
      onInventory: (cloudInv) => {
        if (cloudInv.length > 0) setInventory(cloudInv);
      },
      onMenuItems: (cloudItems) => {
        if (cloudItems.length > 0) setMenuItems(cloudItems);
      },
      onRiders: (cloudRiders) => {
        if (cloudRiders.length > 0) setRiders(cloudRiders);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const ok = await pushEntireStateToCloud({
        stores,
        orders,
        timecards,
        inventory,
        menuItems,
        riders,
      });
      setIsCloudSynced(ok);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Google Drive & Auth status
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  // Initialize Firebase Auth listener for Google Drive sync
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsDriveConnected(true);
        setUserEmail(user.email || undefined);
      },
      () => {
        setIsDriveConnected(false);
        setUserEmail(undefined);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync to LocalStorage on updates
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STORES, stores);
  }, [stores]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MENU_ITEMS, menuItems);
  }, [menuItems]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RIDERS, riders);
  }, [riders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STAFF, staffList);
  }, [staffList]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TIMECARDS, timecards);
  }, [timecards]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INVENTORY, inventory);
  }, [inventory]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.INVENTORY_LOGS, inventoryLogs);
  }, [inventoryLogs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROMOS, promos);
  }, [promos]);

  // Active store object
  const activeMerchantStore = stores.find((s) => s.id === activeStoreId) || stores[0];

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      // If adding from a different store, ask or reset
      if (prev.length > 0 && selectedStoreForCustomer && prev[0].menuItem.storeId !== selectedStoreForCustomer.id) {
        return [item];
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order placement & automated rider rotation dispatch
  const handlePlaceOrder = (newOrder: Order) => {
    // FAIR ROTATION DISPATCH: Assign to first available clocked-in rider
    let assignedRiderId: string | undefined = undefined;
    let assignedRiderName: string | undefined = undefined;

    const availableClockedRiders = riders.filter(
      (r) => r.isClockedIn && !r.currentOrderId
    );

    if (availableClockedRiders.length > 0) {
      // Sort by rotation index to ensure fairness (like Grab / Foodpanda)
      availableClockedRiders.sort((a, b) => a.rotationIndex - b.rotationIndex);
      const chosenRider = availableClockedRiders[0];
      assignedRiderId = chosenRider.id;
      assignedRiderName = chosenRider.name;

      // Update rider state with current order & advance rotation index
      setRiders((prev) =>
        prev.map((r) =>
          r.id === chosenRider.id
            ? {
                ...r,
                currentOrderId: newOrder.id,
                rotationIndex: r.rotationIndex + prev.length, // moves to end of rotation queue
              }
            : r
        )
      );
    }

    const finalizedOrder: Order = {
      ...newOrder,
      assignedRiderId,
      assignedRiderName,
    };

    setOrders((prev) => [finalizedOrder, ...prev]);
    setLatestReceiptOrder(finalizedOrder);
    pushOrderToCloud(finalizedOrder);
  };

  // Order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus };
          pushOrderToCloud(updated);
          return updated;
        }
        return o;
      })
    );
  };

  // Manual Rider assignment
  const handleAssignRider = (orderId: string, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated: Order = {
            ...o,
            assignedRiderId: riderId || undefined,
            assignedRiderName: rider?.name || undefined,
          };
          pushOrderToCloud(updated);
          return updated;
        }
        return o;
      })
    );
  };

  // Registration handlers
  const handleRegisterStore = (newStore: Store) => {
    setStores((prev) => [newStore, ...prev]);
    setActiveStoreId(newStore.id);
  };

  const handleRegisterRider = (newRider: Rider) => {
    setRiders((prev) => [...prev, newRider]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        themeMode === 'midnight'
          ? 'bg-[#080B12] text-white selection:bg-slate-700 selection:text-white'
          : 'bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white'
      }`}
    >
      {/* Top Main Navigation */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          if (role === 'customer') {
            setSelectedStoreForCustomer(null);
          }
        }}
        stores={stores}
        activeStoreId={activeStoreId}
        setActiveStoreId={setActiveStoreId}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        isDriveConnected={isDriveConnected}
        userEmail={userEmail}
        onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
        onOpenStoreRegisterModal={() => setIsStoreRegisterModalOpen(true)}
        onOpenRiderRegisterModal={() => setIsRiderRegisterModalOpen(true)}
        isCustomerOnlyMode={isCustomerOnlyMode}
        onExitCustomerOnlyMode={() => {
          setIsCustomerOnlyMode(false);
          setCurrentRole('manager');
        }}
        onOpenCustomerShareModal={() => setIsCustomerShareModalOpen(true)}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
        isCloudSynced={isCloudSynced}
        onOpenFreeCloudModal={() => setIsFreeCloudModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* SPECIAL DEDICATED LANDING MODES */}
        {isStaffClockInMode ? (
          <StaffMobileClockIn
            store={activeMerchantStore}
            allStores={stores}
            onSelectStore={(s) => setActiveStoreId(s.id)}
            staffList={staffList}
            timecards={timecards}
            onUpdateTimecards={setTimecards}
            onGoToStaffTerminal={() => {
              setIsStaffClockInMode(false);
              setCurrentRole('staff');
            }}
            themeMode={themeMode}
          />
        ) : isMerchantLoginMode && !authenticatedMerchantStoreIds.includes(activeMerchantStore.id) ? (
          <MerchantLoginLanding
            store={activeMerchantStore}
            allStores={stores}
            onSelectStore={(s) => setActiveStoreId(s.id)}
            onSuccessLogin={(id) => {
              setAuthenticatedMerchantStoreIds((prev) => [...prev, id]);
              setIsMerchantLoginMode(false);
              setCurrentRole('manager');
            }}
            onSwitchRole={(r) => {
              setIsMerchantLoginMode(false);
              setCurrentRole(r as any);
            }}
            themeMode={themeMode}
          />
        ) : (
          <>
            {/* 1. CUSTOMER VIEW */}
            {currentRole === 'customer' && (
              <>
                {!selectedStoreForCustomer ? (
                  <StoreListing
                    stores={stores}
                    onSelectStore={(store) => setSelectedStoreForCustomer(store)}
                  />
                ) : (
                  <StoreDetail
                    store={selectedStoreForCustomer}
                    menuItems={menuItems.filter((i) => i.storeId === selectedStoreForCustomer.id)}
                    onBack={() => setSelectedStoreForCustomer(null)}
                    onSelectItem={(item) => setSelectedItemForModal(item)}
                  />
                )}
              </>
            )}

            {/* 2. MERCHANT ADMIN & STAFF TERMINAL VIEW */}
            {(currentRole === 'staff' || currentRole === 'manager' || currentRole === 'owner') && (
              <MerchantLayout
                store={activeMerchantStore}
                allStores={stores}
                currentRole={currentRole}
                orders={orders}
                riders={riders}
                menuItems={menuItems}
                inventory={inventory}
                inventoryLogs={inventoryLogs}
                staffList={staffList}
                timecards={timecards}
                promos={promos}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onAssignRider={handleAssignRider}
                onPlaceWalkInOrder={handlePlaceOrder}
                onUpdateMenuItems={setMenuItems}
                onUpdateInventory={setInventory}
                onAddInventoryLog={(log) => setInventoryLogs((prev) => [log, ...prev])}
                onUpdateTimecards={setTimecards}
                onUpdateStaffList={setStaffList}
                onUpdateStore={(updated) =>
                  setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                }
                onUpdatePromos={setPromos}
                onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
                onSwitchToCustomerView={() => {
                  setCurrentRole('customer');
                  setSelectedStoreForCustomer(activeMerchantStore);
                }}
                onOpenStaffClockIn={() => setIsStaffClockInMode(true)}
              />
            )}

            {/* 3. RIDER VIEW (Clock in/out, Fair Rotation Queue, ₱5 Platform fee ledger) */}
            {currentRole === 'rider' && (
              <RiderDashboard
                riders={riders}
                orders={orders}
                onUpdateRider={(updated) =>
                  setRiders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
                }
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onOpenRiderRegisterModal={() => setIsRiderRegisterModalOpen(true)}
              />
            )}

            {/* 4. PLATFORM HUB ADMIN VIEW */}
            {currentRole === 'platform' && (
              <PlatformAdmin
                stores={stores}
                riders={riders}
                orders={orders}
                onOpenStoreRegisterModal={() => setIsStoreRegisterModalOpen(true)}
                onOpenRiderRegisterModal={() => setIsRiderRegisterModalOpen(true)}
                onUpdateStore={(updated) =>
                  setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                }
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals & Drawers */}

      {/* Product Customization & Variant Selection Modal */}
      <ProductModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentStore={selectedStoreForCustomer || stores.find((s) => s.id === cart[0]?.menuItem.storeId) || stores[0]}
        promos={promos}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        selectedPromoCode={prefilledPromoCode}
      />

      {/* Printable Digital Receipt Modal */}
      <ReceiptModal
        order={latestReceiptOrder}
        isOpen={!!latestReceiptOrder}
        onClose={() => setLatestReceiptOrder(null)}
      />

      {/* Google Drive Automated Backup Modal */}
      <GoogleDriveBackupModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        store={activeMerchantStore}
        allStores={stores}
        menuItems={menuItems}
        orders={orders}
        inventory={inventory}
        staffList={staffList}
        timecards={timecards}
        riders={riders}
        promos={promos}
        onRestoreData={(restored) => {
          if (restored.stores) setStores(restored.stores);
          if (restored.menuItems) setMenuItems(restored.menuItems);
          if (restored.orders) setOrders(restored.orders);
          if (restored.inventory) setInventory(restored.inventory);
          if (restored.staffList) setStaffList(restored.staffList);
          if (restored.timecards) setTimecards(restored.timecards);
          if (restored.riders) setRiders(restored.riders);
          if (restored.promos) setPromos(restored.promos);
        }}
      />

      {/* Register Store Modal */}
      <StoreRegisterModal
        isOpen={isStoreRegisterModalOpen}
        onClose={() => setIsStoreRegisterModalOpen(false)}
        onRegisterStore={handleRegisterStore}
      />

      {/* Register Rider Modal */}
      <RiderRegisterModal
        isOpen={isRiderRegisterModalOpen}
        onClose={() => setIsRiderRegisterModalOpen(false)}
        onRegisterRider={handleRegisterRider}
        totalRidersCount={riders.length}
      />

      {/* Customer Landing Page Share Modal */}
      <CustomerShareModal
        isOpen={isCustomerShareModalOpen}
        onClose={() => setIsCustomerShareModalOpen(false)}
        stores={stores}
        activeStoreId={activeMerchantStore?.id}
      />
    </div>
  );
}
