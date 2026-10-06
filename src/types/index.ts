export type UserRole = 'customer' | 'staff' | 'manager' | 'owner' | 'rider' | 'platform';

export interface VariantOption {
  name: string;
  priceDelta: number; // e.g. +15, 0
}

export interface VariantGroup {
  id: string;
  name: string; // e.g. "Spice Level", "Drink Size", "Add-on Toppings"
  required: boolean;
  minSelections: number;
  maxSelections: number; // 1 for radio, >1 for checkboxes
  options: VariantOption[];
}

export interface MenuItem {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  variantGroups: VariantGroup[];
}

export interface Store {
  id: string;
  name: string;
  tagline: string;
  category: 'Food' | 'Beverages' | 'Grocery' | 'Bakery' | 'Snacks';
  isOpen: boolean;
  distanceKm: number; // distance relative to customer (within 3km)
  address: string;
  contactNumber: string;
  rating: number;
  reviewCount: number;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string; // hex or tailwind accent e.g. #f97316 (orange)
  baseDeliveryFee: number; // e.g. 35
  perKmDeliveryFee: number; // e.g. 10
  minOrderAmount: number; // e.g. 99
  freeDeliveryThreshold?: number; // e.g. 500
  adminPassword?: string; // Readable by platform creator for recovery if merchant forgets!
  managerPasswordHash?: string; // only owner can change!
  ownerPasswordHash?: string;
  latitude?: number;
  longitude?: number;
  activePromos: PromoCode[];
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 15 for 15% or 50 for 50 pesos
  minOrder: number;
  validUntil: string;
  description: string;
  storeId?: string; // empty means platform-wide
}

export interface CartSelectedVariant {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique cart line item id
  menuItem: MenuItem;
  quantity: number;
  selectedVariants: CartSelectedVariant[];
  specialInstructions?: string;
  unitPrice: number; // menuItem.price + variants sum
  totalPrice: number;
}

export type OrderType = 'online_delivery' | 'online_pickup' | 'walk_in';
export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'OutForDelivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  type: OrderType;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  distanceKm: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  appliedPromoCode?: string;
  platformFee: number; // 5 pesos per transaction
  riderFee: number; // e.g. 5 pesos platform fee or rider delivery earnings
  grandTotal: number;
  paymentMethod: 'GCash' | 'Cash on Delivery' | 'Maya' | 'Cash (Walk-in)';
  status: OrderStatus;
  createdAt: string;
  estimatedMinutes: number;
  assignedRiderId?: string;
  assignedRiderName?: string;
  kitchenNotes?: string;
  itemImageThumbnail: string; // for instant visual kitchen inspection
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Bicycle' | 'Motorcycle' | 'E-Bike';
  plateNumber: string;
  photoUrl: string;
  isClockedIn: boolean;
  clockInTime?: string;
  rotationIndex: number;
  completedDeliveries: number;
  totalEarnings: number;
  totalPlatformFeesPaid: number; // 5 pesos per delivered order
  currentOrderId?: string;
  rating: number;
}

export interface Staff {
  id: string;
  storeId: string;
  name: string;
  role: 'Cook / Kitchen Staff' | 'Cashier' | 'Store Manager' | 'Crew';
  hourlyRate: number; // e.g. 65 PHP / hour
  dailyRate: number; // e.g. 500 PHP / day
  contact: string;
  avatarUrl: string;
  pin?: string; // 4-digit staff terminal login & clock-in PIN
}

export interface Timecard {
  id: string;
  staffId: string;
  staffName: string;
  storeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  regularHours: number;
  overtimeHours: number;
  isCompleted: boolean;
  clockInLat?: number;
  clockInLng?: number;
  clockInPhoto?: string;
  clockInAddress?: string;
  clockOutLat?: number;
  clockOutLng?: number;
  clockOutPhoto?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  periodStart: string;
  periodEnd: string;
  totalRegularHours: number;
  totalOvertimeHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Paid';
}

export interface InventoryItem {
  id: string;
  storeId: string;
  sku: string;
  name: string;
  category: string;
  unit: string; // e.g. kg, pcs, packs, cans, liters
  beginningStock: number;
  stockIn: number;
  stockOut: number;
  spoilageStock?: number; // damaged / expired / wasted stock
  currentStock: number;
  minReorderLevel: number;
  unitCost: number; // Cost in PHP per unit
  lastUpdated: string;
}

export interface InventoryMovementLog {
  id: string;
  itemId: string;
  itemName: string;
  storeId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  unitCost?: number;
  reason: 'Daily Kitchen Prep' | 'Cooked Orders Usage' | 'Spoilage / Waste / Expired' | 'Damaged in Storage' | 'Staff Meal' | 'Supplier Restock' | 'Emergency Purchase' | string;
  isLossOrWaste?: boolean; // flags direct loss for merchant admin financial monitoring
  costImpact?: number; // total PHP value of this movement
  timestamp: string;
  performedBy: string;
}

export interface StoreFinancialSummary {
  grossRevenue: number;
  cogsExpenses: number; // kitchen usage cost
  spoilageLosses: number; // direct losses from spoiled / damaged ingredients
  laborExpenses: number; // computed from staff timecards
  platformFeeExpenses: number; // 5 pesos per transaction
  restockExpenses: number; // cost of stock-in purchases
  netProfit: number;
  netMarginPercentage: number;
}

export interface GoogleDriveBackupStatus {
  isConnected: boolean;
  userEmail?: string;
  lastBackupDate?: string;
  lastBackupFileId?: string;
  autoSync: boolean;
  isSyncing: boolean;
  error?: string;
}
