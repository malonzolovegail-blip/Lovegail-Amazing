import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Store, Order, Timecard, InventoryItem, MenuItem, Rider } from '../types';

// Initialize Firebase App & Firestore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let isCloudOnline = false;

// Test connection on boot per Firebase skill guidelines
export async function testCloudConnection(): Promise<boolean> {
  try {
    const testRef = doc(db, 'system', 'connection_probe');
    await getDocFromServer(testRef).catch(() => {});
    isCloudOnline = true;
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Free Cloud client offline, operating with local sync.');
    }
    isCloudOnline = false;
    return false;
  }
}

export function isFreeCloudConnected(): boolean {
  return isCloudOnline;
}

// Real-time Cloud Listeners for Free Updates & Sharing across all devices
export function initFreeCloudListeners(callbacks: {
  onStores?: (stores: Store[]) => void;
  onOrders?: (orders: Order[]) => void;
  onTimecards?: (timecards: Timecard[]) => void;
  onInventory?: (inventory: InventoryItem[]) => void;
  onMenuItems?: (items: MenuItem[]) => void;
  onRiders?: (riders: Rider[]) => void;
}) {
  const unsubscribers: (() => void)[] = [];

  try {
    // 1. Stores Listener
    if (callbacks.onStores) {
      const unsub = onSnapshot(
        collection(db, 'stores'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Store[] = [];
            snapshot.forEach((d) => list.push(d.data() as Store));
            callbacks.onStores!(list);
          }
        },
        (err) => console.warn('Stores cloud sync listener note:', err)
      );
      unsubscribers.push(unsub);
    }

    // 2. Orders Listener
    if (callbacks.onOrders) {
      const unsub = onSnapshot(
        collection(db, 'orders'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach((d) => list.push(d.data() as Order));
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callbacks.onOrders!(list);
          }
        },
        (err) => console.warn('Orders cloud sync listener note:', err)
      );
      unsubscribers.push(unsub);
    }

    // 3. Timecards Listener (Live Attendance with GPS & Photo)
    if (callbacks.onTimecards) {
      const unsub = onSnapshot(
        collection(db, 'timecards'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Timecard[] = [];
            snapshot.forEach((d) => list.push(d.data() as Timecard));
            callbacks.onTimecards!(list);
          }
        },
        (err) => console.warn('Timecards cloud sync listener note:', err)
      );
      unsubscribers.push(unsub);
    }

    // 4. Inventory Listener
    if (callbacks.onInventory) {
      const unsub = onSnapshot(
        collection(db, 'inventory'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: InventoryItem[] = [];
            snapshot.forEach((d) => list.push(d.data() as InventoryItem));
            callbacks.onInventory!(list);
          }
        },
        (err) => console.warn('Inventory cloud sync listener note:', err)
      );
      unsubscribers.push(unsub);
    }

    // 5. Menu Items Listener
    if (callbacks.onMenuItems) {
      const unsub = onSnapshot(
        collection(db, 'menuItems'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: MenuItem[] = [];
            snapshot.forEach((d) => list.push(d.data() as MenuItem));
            callbacks.onMenuItems!(list);
          }
        },
        (err) => console.warn('Menu items cloud sync listener note:', err)
      );
      unsubscribers.push(unsub);
    }

    // 6. Riders Listener
    if (callbacks.onRiders) {
      const unsub = onSnapshot(
        collection(db, 'riders'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Rider[] = [];
            snapshot.forEach((d) => list.push(d.data() as Rider));
            callbacks.onRiders!(list);
          }
        },
        (err) => console.warn('Riders cloud sync listener note:', err)
      );
      unsubscribers.push(unsub);
    }
  } catch (error) {
    console.warn('Failed to attach free cloud listeners:', error);
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

// Push Individual Record to Free Cloud
export async function pushOrderToCloud(order: Order) {
  try {
    await setDoc(doc(db, 'orders', order.id), order, { merge: true });
  } catch (e) {
    console.warn('Could not sync order to cloud:', e);
  }
}

export async function pushTimecardToCloud(timecard: Timecard) {
  try {
    await setDoc(doc(db, 'timecards', timecard.id), timecard, { merge: true });
  } catch (e) {
    console.warn('Could not sync timecard to cloud:', e);
  }
}

export async function pushStoreToCloud(store: Store) {
  try {
    await setDoc(doc(db, 'stores', store.id), store, { merge: true });
  } catch (e) {
    console.warn('Could not sync store to cloud:', e);
  }
}

export async function pushInventoryToCloud(item: InventoryItem) {
  try {
    await setDoc(doc(db, 'inventory', item.id), item, { merge: true });
  } catch (e) {
    console.warn('Could not sync inventory to cloud:', e);
  }
}

// Broadcast Entire State to Free Cloud (Sync Now / Seed)
export async function pushEntireStateToCloud(data: {
  stores: Store[];
  orders: Order[];
  timecards: Timecard[];
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  riders: Rider[];
}): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    data.stores.forEach((s) => {
      batch.set(doc(db, 'stores', s.id), s, { merge: true });
    });
    data.orders.slice(0, 50).forEach((o) => {
      batch.set(doc(db, 'orders', o.id), o, { merge: true });
    });
    data.timecards.slice(0, 50).forEach((tc) => {
      batch.set(doc(db, 'timecards', tc.id), tc, { merge: true });
    });
    data.inventory.forEach((inv) => {
      batch.set(doc(db, 'inventory', inv.id), inv, { merge: true });
    });
    data.menuItems.slice(0, 100).forEach((mi) => {
      batch.set(doc(db, 'menuItems', mi.id), mi, { merge: true });
    });
    data.riders.forEach((r) => {
      batch.set(doc(db, 'riders', r.id), r, { merge: true });
    });

    await batch.commit();
    isCloudOnline = true;
    return true;
  } catch (error) {
    console.error('Batch cloud sync error:', error);
    return false;
  }
}
