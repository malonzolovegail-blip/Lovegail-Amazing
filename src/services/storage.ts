import {
  Store,
  MenuItem,
  Order,
  Rider,
  Staff,
  Timecard,
  InventoryItem,
  InventoryMovementLog,
  PromoCode,
} from '../types';

const STORAGE_KEYS = {
  STORES: 'localserve_stores_v1',
  MENU_ITEMS: 'localserve_menu_items_v1',
  ORDERS: 'localserve_orders_v1',
  RIDERS: 'localserve_riders_v1',
  STAFF: 'localserve_staff_v1',
  TIMECARDS: 'localserve_timecards_v1',
  INVENTORY: 'localserve_inventory_v1',
  INVENTORY_LOGS: 'localserve_inventory_logs_v1',
  PROMOS: 'localserve_promos_v1',
};

const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Pepper & Sizzle Grill',
    tagline: 'Hot plate rice bowls, gourmet sizzling steaks & street burgers',
    category: 'Food',
    isOpen: true,
    distanceKm: 0.8,
    address: 'Block 4 Lot 12, Rizal Ave, Central District',
    contactNumber: '+63 917 123 4567',
    rating: 4.9,
    reviewCount: 342,
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200',
    themeColor: '#ea580c', // orange-600
    baseDeliveryFee: 35,
    perKmDeliveryFee: 10,
    minOrderAmount: 99,
    freeDeliveryThreshold: 499,
    managerPasswordHash: 'manager123',
    ownerPasswordHash: 'owner123',
    activePromos: [],
  },
  {
    id: 'store-2',
    name: 'Kape Kultura & Pastry Bar',
    tagline: 'Specialty pour-overs, iced Spanish lattes & fresh croissants',
    category: 'Beverages',
    isOpen: true,
    distanceKm: 1.3,
    address: 'Unit 201 Heritage Corner, Mabini St.',
    contactNumber: '+63 920 888 9911',
    rating: 4.8,
    reviewCount: 219,
    logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
    themeColor: '#854d0e', // amber-800
    baseDeliveryFee: 30,
    perKmDeliveryFee: 10,
    minOrderAmount: 80,
    managerPasswordHash: 'coffee2026',
    ownerPasswordHash: 'owner123',
    activePromos: [],
  },
  {
    id: 'store-3',
    name: "Nanay's Crispy Kare-Kare & Inasal",
    tagline: 'Authentic Pinoy feast, smoky chicken inasal and rich peanut stew',
    category: 'Food',
    isOpen: true,
    distanceKm: 1.9,
    address: 'Corner Luna & Bonifacio Streets',
    contactNumber: '+63 939 444 5566',
    rating: 4.7,
    reviewCount: 184,
    logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
    themeColor: '#dc2626', // red-600
    baseDeliveryFee: 40,
    perKmDeliveryFee: 12,
    minOrderAmount: 150,
    managerPasswordHash: 'nanay123',
    ownerPasswordHash: 'owner123',
    activePromos: [],
  },
  {
    id: 'store-4',
    name: 'Fresh Mart Superette & Deli',
    tagline: 'Farm-fresh organic veggies, dairy goods, eggs and snacks',
    category: 'Grocery',
    isOpen: true,
    distanceKm: 2.4,
    address: '15 Commercial Strip, Green Valley',
    contactNumber: '+63 908 777 2233',
    rating: 4.6,
    reviewCount: 95,
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200',
    themeColor: '#16a34a', // green-600
    baseDeliveryFee: 45,
    perKmDeliveryFee: 15,
    minOrderAmount: 120,
    managerPasswordHash: 'freshmart',
    ownerPasswordHash: 'owner123',
    activePromos: [],
  },
  {
    id: 'store-5',
    name: 'Sweet Delights Artisan Bakery',
    tagline: 'Ube halaya cheese rolls, ensaymada, and artisan sourdough',
    category: 'Bakery',
    isOpen: false, // Closed store demo
    distanceKm: 2.8,
    address: '7 Sunflower Way, East Village',
    contactNumber: '+63 916 333 4455',
    rating: 4.9,
    reviewCount: 310,
    logoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200',
    themeColor: '#db2777', // pink-600
    baseDeliveryFee: 35,
    perKmDeliveryFee: 10,
    minOrderAmount: 100,
    managerPasswordHash: 'sweetbread',
    ownerPasswordHash: 'owner123',
    activePromos: [],
  },
  {
    id: 'store-6',
    name: 'Metro Highway Highway Diner (Outside 3km)',
    tagline: 'Late night diner along the provincial expressway',
    category: 'Food',
    isOpen: true,
    distanceKm: 4.6, // greater than 3km
    address: 'Kilometer 18 Highway Junction',
    contactNumber: '+63 915 000 1122',
    rating: 4.3,
    reviewCount: 52,
    logoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=300',
    bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    themeColor: '#4f46e5',
    baseDeliveryFee: 65,
    perKmDeliveryFee: 20,
    minOrderAmount: 250,
    managerPasswordHash: 'metro123',
    ownerPasswordHash: 'owner123',
    activePromos: [],
  },
];

const INITIAL_PROMOS: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'LOCAL15',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 150,
    validUntil: '2026-12-31',
    description: '15% OFF for orders ₱150 and above across neighborhood stores',
  },
  {
    id: 'promo-2',
    code: 'FREE50',
    discountType: 'fixed',
    discountValue: 50,
    minOrder: 350,
    validUntil: '2026-12-31',
    description: '₱50 flat discount on feast orders over ₱350',
  },
  {
    id: 'promo-3',
    code: 'SIZZLE30',
    discountType: 'fixed',
    discountValue: 30,
    minOrder: 200,
    validUntil: '2026-12-31',
    description: '₱30 OFF special sizzling treat',
    storeId: 'store-1',
  },
  {
    id: 'promo-4',
    code: 'KAPEMORNING',
    discountType: 'percentage',
    discountValue: 20,
    minOrder: 180,
    validUntil: '2026-12-31',
    description: '20% OFF coffee & pastry combos',
    storeId: 'store-2',
  },
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Store 1: Pepper & Sizzle Grill
  {
    id: 'item-101',
    storeId: 'store-1',
    name: 'Sizzling Sisig Pepper Bowl',
    description: 'Triple-cooked crispy pork bits, white onion, chili pepper, garlic butter rice & runny egg.',
    price: 135,
    category: 'Sizzling Bowls',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-1',
        name: 'Spice Level',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Mild (Kids friendly)', priceDelta: 0 },
          { name: 'Spicy Heat', priceDelta: 0 },
          { name: 'Extra Flaming Hot (Labuyo)', priceDelta: 10 },
        ],
      },
      {
        id: 'vg-2',
        name: 'Egg Preparation',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Sunny Side Runny', priceDelta: 0 },
          { name: 'Well Done Fried', priceDelta: 0 },
          { name: 'Double Egg (+₱20)', priceDelta: 20 },
        ],
      },
      {
        id: 'vg-3',
        name: 'Delicious Add-ons',
        required: false,
        minSelections: 0,
        maxSelections: 3,
        options: [
          { name: 'Melted Cheddar Cheese Sauce', priceDelta: 25 },
          { name: 'Crispy Chicharon Crumbs', priceDelta: 15 },
          { name: 'Extra Garlic Rice', priceDelta: 20 },
        ],
      },
    ],
  },
  {
    id: 'item-102',
    storeId: 'store-1',
    name: 'Garlic Beef Pepper Rice with Corn',
    description: 'Tender marinated US beef strips, sweet Japanese corn kernels, cracked black pepper, honey brown sauce.',
    price: 165,
    category: 'Sizzling Bowls',
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-4',
        name: 'Portion Size',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Regular Solo', priceDelta: 0 },
          { name: 'Double Meat (+₱55)', priceDelta: 55 },
        ],
      },
      {
        id: 'vg-5',
        name: 'Sauce Profile',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Sweet Honey Garlic Sauce', priceDelta: 0 },
          { name: 'Spicy Teriyaki Glaze', priceDelta: 0 },
          { name: 'Truffle Mushroom Pepper', priceDelta: 25 },
        ],
      },
    ],
  },
  {
    id: 'item-103',
    storeId: 'store-1',
    name: 'Smoky Bacon Cheeseburger',
    description: 'Hand-smashed beef patty, smoked bacon, caramelized onions, melted American cheese, brioche bun.',
    price: 150,
    category: 'Burgers & Wraps',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-6',
        name: 'Fries & Drink Combo',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Burger Only (Ala Carte)', priceDelta: 0 },
          { name: 'With Fries & Iced Tea (+₱55)', priceDelta: 55 },
          { name: 'With Onion Rings & Soda (+₱70)', priceDelta: 70 },
        ],
      },
    ],
  },
  {
    id: 'item-104',
    storeId: 'store-1',
    name: 'House Blend Red Iced Tea (1L)',
    description: 'Refreshing citrus-infused brewed tea with mint and calamansi.',
    price: 65,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-7',
        name: 'Sugar / Sweetness',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: '100% Regular Sweet', priceDelta: 0 },
          { name: '50% Less Sweet', priceDelta: 0 },
          { name: '0% Unsweetened Mint', priceDelta: 0 },
        ],
      },
    ],
  },

  // Store 2: Kape Kultura & Pastry Bar
  {
    id: 'item-201',
    storeId: 'store-2',
    name: 'Signature Iced Spanish Latte',
    description: 'Double espresso pulled over condensed sweet milk and fresh steamed milk.',
    price: 120,
    category: 'Espresso Bar',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-21',
        name: 'Size',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: '16oz Regular', priceDelta: 0 },
          { name: '22oz Large (+₱25)', priceDelta: 25 },
        ],
      },
      {
        id: 'vg-22',
        name: 'Milk Choice',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Fresh Whole Dairy', priceDelta: 0 },
          { name: 'Oat Milk Barista (+₱30)', priceDelta: 30 },
          { name: 'Soy Milk (+₱20)', priceDelta: 20 },
        ],
      },
    ],
  },
  {
    id: 'item-202',
    storeId: 'store-2',
    name: 'Golden Butter Flaky Croissant',
    description: 'French butter laminated croissant baked fresh every morning.',
    price: 85,
    category: 'Bakery & Pastries',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-23',
        name: 'Serving Style',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Warm / Toasted', priceDelta: 0 },
          { name: 'Room Temperature', priceDelta: 0 },
          { name: 'With Nutella Dip (+₱25)', priceDelta: 25 },
        ],
      },
    ],
  },

  // Store 3: Nanay's Crispy Kare-Kare
  {
    id: 'item-301',
    storeId: 'store-3',
    name: 'Crispy Pork Belly Kare-Kare',
    description: 'Golden pork lechon kawali, thick roasted peanut sauce, bok choy, eggplant, string beans & sauteed bagoong.',
    price: 240,
    category: 'Filipino Classics',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-31',
        name: 'Serving Size',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Solo with Rice', priceDelta: 0 },
          { name: 'Sharing Platter (2-3 Pax, no rice) (+₱150)', priceDelta: 150 },
        ],
      },
      {
        id: 'vg-32',
        name: 'Bagoong Alamang',
        required: true,
        minSelections: 1,
        maxSelections: 1,
        options: [
          { name: 'Sweet Savory Alamang', priceDelta: 0 },
          { name: 'Spicy Chili Alamang', priceDelta: 0 },
        ],
      },
    ],
  },

  // Store 4: Fresh Mart Superette
  {
    id: 'item-401',
    storeId: 'store-4',
    name: 'Farm Veggie Salad Basket (750g)',
    description: 'Crisp green romaine lettuce, cherry tomatoes, cucumbers, carrots, and sweet bell peppers.',
    price: 145,
    category: 'Fresh Produce',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    available: true,
    variantGroups: [
      {
        id: 'vg-41',
        name: 'Dressing Pack',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        options: [
          { name: 'Roasted Sesame Dressing (+₱35)', priceDelta: 35 },
          { name: 'Balsamic Vinaigrette (+₱35)', priceDelta: 35 },
        ],
      },
    ],
  },
];

const INITIAL_RIDERS: Rider[] = [
  {
    id: 'rider-1',
    name: 'Mark Angelo B.',
    phone: '+63 917 890 1234',
    vehicleType: 'Motorcycle',
    plateNumber: 'ABC-1234',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    isClockedIn: true,
    clockInTime: '08:30 AM',
    rotationIndex: 1,
    completedDeliveries: 28,
    totalEarnings: 1400,
    totalPlatformFeesPaid: 140, // 28 * 5 pesos
    rating: 4.95,
  },
  {
    id: 'rider-2',
    name: 'Jerome Santos',
    phone: '+63 928 345 6789',
    vehicleType: 'Bicycle',
    plateNumber: 'BIKE-042',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    isClockedIn: true,
    clockInTime: '09:00 AM',
    rotationIndex: 2,
    completedDeliveries: 19,
    totalEarnings: 950,
    totalPlatformFeesPaid: 95,
    rating: 4.88,
  },
  {
    id: 'rider-3',
    name: 'Christian Reyes',
    phone: '+63 935 678 9012',
    vehicleType: 'E-Bike',
    plateNumber: 'EBIKE-88',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    isClockedIn: false,
    rotationIndex: 3,
    completedDeliveries: 12,
    totalEarnings: 600,
    totalPlatformFeesPaid: 60,
    rating: 4.75,
  },
  {
    id: 'rider-4',
    name: 'Alden Cruz',
    phone: '+63 945 111 2233',
    vehicleType: 'Motorcycle',
    plateNumber: 'XYZ-9876',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
    isClockedIn: true,
    clockInTime: '10:15 AM',
    rotationIndex: 4,
    completedDeliveries: 34,
    totalEarnings: 1700,
    totalPlatformFeesPaid: 170,
    rating: 4.92,
  },
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    storeId: 'store-1',
    name: 'Kuya Lito (Head Cook)',
    role: 'Cook / Kitchen Staff',
    hourlyRate: 75,
    dailyRate: 600,
    contact: '+63 918 333 1122',
    avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200',
  },
  {
    id: 'staff-2',
    storeId: 'store-1',
    name: 'Grace Mendoza (Cashier)',
    role: 'Cashier',
    hourlyRate: 65,
    dailyRate: 520,
    contact: '+63 927 444 8899',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
  },
  {
    id: 'staff-3',
    storeId: 'store-1',
    name: 'Rowell Bautista (Store Manager)',
    role: 'Store Manager',
    hourlyRate: 95,
    dailyRate: 760,
    contact: '+63 999 555 7711',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
  },
];

const INITIAL_TIMECARDS: Timecard[] = [
  {
    id: 'tc-1',
    staffId: 'staff-1',
    staffName: 'Kuya Lito (Head Cook)',
    storeId: 'store-1',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:00 AM',
    clockOut: '05:00 PM',
    regularHours: 8,
    overtimeHours: 1,
    isCompleted: true,
  },
  {
    id: 'tc-2',
    staffId: 'staff-2',
    staffName: 'Grace Mendoza (Cashier)',
    storeId: 'store-1',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00 AM',
    regularHours: 6.5,
    overtimeHours: 0,
    isCompleted: false, // currently on duty
  },
  {
    id: 'tc-3',
    staffId: 'staff-3',
    staffName: 'Rowell Bautista (Store Manager)',
    storeId: 'store-1',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:30 AM',
    regularHours: 7,
    overtimeHours: 0,
    isCompleted: false,
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    storeId: 'store-1',
    sku: 'SKU-PORK-01',
    name: 'Pork Belly Sisig Cut (kg)',
    category: 'Meat & Poultry',
    unit: 'kg',
    beginningStock: 45,
    stockIn: 30,
    stockOut: 22,
    currentStock: 53,
    minReorderLevel: 20,
    unitCost: 280,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-2',
    storeId: 'store-1',
    sku: 'SKU-RICE-01',
    name: 'Sinandomeng Rice Sacks (25kg)',
    category: 'Grains & Dry Goods',
    unit: 'sacks',
    beginningStock: 12,
    stockIn: 10,
    stockOut: 4,
    currentStock: 18,
    minReorderLevel: 5,
    unitCost: 1250,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    storeId: 'store-1',
    sku: 'SKU-EGG-01',
    name: 'Fresh Farm Eggs (Tray of 30)',
    category: 'Dairy & Eggs',
    unit: 'trays',
    beginningStock: 25,
    stockIn: 20,
    stockOut: 28,
    currentStock: 17,
    minReorderLevel: 10,
    unitCost: 240,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-4',
    storeId: 'store-1',
    sku: 'SKU-BUTTER-01',
    name: 'Garlic Butter Spread (Tubs)',
    category: 'Sauces & Spices',
    unit: 'tubs',
    beginningStock: 8,
    stockIn: 5,
    stockOut: 10,
    currentStock: 3, // LOW STOCK ALERT
    minReorderLevel: 5,
    unitCost: 190,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'inv-5',
    storeId: 'store-1',
    sku: 'SKU-CHILI-01',
    name: 'Siling Labuyo Fresh (kg)',
    category: 'Produce',
    unit: 'kg',
    beginningStock: 6,
    stockIn: 5,
    stockOut: 4,
    currentStock: 7,
    minReorderLevel: 3,
    unitCost: 350,
    lastUpdated: new Date().toISOString(),
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8801',
    storeId: 'store-1',
    storeName: 'Pepper & Sizzle Grill',
    type: 'online_delivery',
    customerName: 'Maria Santos',
    customerPhone: '+63 917 555 4321',
    deliveryAddress: 'Apt 304 Sunrise Condo, 0.9km away',
    distanceKm: 0.9,
    items: [
      {
        id: 'cart-1',
        menuItem: INITIAL_MENU_ITEMS[0],
        quantity: 2,
        selectedVariants: [
          { groupName: 'Spice Level', optionName: 'Spicy Heat', priceDelta: 0 },
          { groupName: 'Egg Preparation', optionName: 'Sunny Side Runny', priceDelta: 0 },
          { groupName: 'Delicious Add-ons', optionName: 'Melted Cheddar Cheese Sauce', priceDelta: 25 },
        ],
        specialInstructions: 'Please make it extra sizzling with plenty of calamansi!',
        unitPrice: 160,
        totalPrice: 320,
      },
      {
        id: 'cart-2',
        menuItem: INITIAL_MENU_ITEMS[3],
        quantity: 1,
        selectedVariants: [
          { groupName: 'Sugar / Sweetness', optionName: '50% Less Sweet', priceDelta: 0 },
        ],
        unitPrice: 65,
        totalPrice: 65,
      },
    ],
    subtotal: 385,
    deliveryFee: 35,
    promoDiscount: 50,
    appliedPromoCode: 'FREE50',
    platformFee: 5, // 5 PESO PLATFORM FEE AS SPECIFIED
    riderFee: 5,
    grandTotal: 375, // 385 + 35 - 50 + 5
    paymentMethod: 'GCash',
    status: 'Preparing', // in kitchen!
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    estimatedMinutes: 20,
    assignedRiderId: 'rider-1',
    assignedRiderName: 'Mark Angelo B.',
    itemImageThumbnail: INITIAL_MENU_ITEMS[0].imageUrl,
    kitchenNotes: 'Order with cheese sauce and runny eggs. Prepare sizzling plate!',
  },
  {
    id: 'ORD-8802',
    storeId: 'store-1',
    storeName: 'Pepper & Sizzle Grill',
    type: 'walk_in',
    customerName: 'Walk-in Table #4 (Juan D.)',
    customerPhone: 'N/A',
    deliveryAddress: 'Dine-In / Counter Walk-in',
    distanceKm: 0,
    items: [
      {
        id: 'cart-3',
        menuItem: INITIAL_MENU_ITEMS[1],
        quantity: 1,
        selectedVariants: [
          { groupName: 'Portion Size', optionName: 'Double Meat (+₱55)', priceDelta: 55 },
          { groupName: 'Sauce Profile', optionName: 'Sweet Honey Garlic Sauce', priceDelta: 0 },
        ],
        unitPrice: 220,
        totalPrice: 220,
      },
    ],
    subtotal: 220,
    deliveryFee: 0,
    promoDiscount: 0,
    platformFee: 5, // 5 pesos transaction fee
    riderFee: 0,
    grandTotal: 225,
    paymentMethod: 'Cash (Walk-in)',
    status: 'Ready',
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    estimatedMinutes: 5,
    itemImageThumbnail: INITIAL_MENU_ITEMS[1].imageUrl,
    kitchenNotes: 'Dine-in counter order with double meat.',
  },
  {
    id: 'ORD-8803',
    storeId: 'store-1',
    storeName: 'Pepper & Sizzle Grill',
    type: 'online_delivery',
    customerName: 'Carla Gomez',
    customerPhone: '+63 922 888 1290',
    deliveryAddress: 'Phase 2 Block 5, Villa Teresa, 1.4km away',
    distanceKm: 1.4,
    items: [
      {
        id: 'cart-4',
        menuItem: INITIAL_MENU_ITEMS[2],
        quantity: 1,
        selectedVariants: [
          { groupName: 'Fries & Drink Combo', optionName: 'With Fries & Iced Tea (+₱55)', priceDelta: 55 },
        ],
        unitPrice: 205,
        totalPrice: 205,
      },
    ],
    subtotal: 205,
    deliveryFee: 40,
    promoDiscount: 30,
    appliedPromoCode: 'SIZZLE30',
    platformFee: 5,
    riderFee: 5,
    grandTotal: 220,
    paymentMethod: 'Cash on Delivery',
    status: 'New', // just arrived!
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    estimatedMinutes: 25,
    itemImageThumbnail: INITIAL_MENU_ITEMS[2].imageUrl,
    kitchenNotes: 'NEW ORDER: Toast brioche well, crisp bacon.',
  },
];

// Helper functions for LocalStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Initializers & Getters
export function getInitialStores(): Store[] {
  const loaded = loadFromStorage<Store[]>(STORAGE_KEYS.STORES, INITIAL_STORES);
  return loaded.map((store, idx) => ({
    ...store,
    adminPassword:
      store.adminPassword || store.managerPasswordHash || (store as any).ownerPasswordHash || `merchant${idx + 1}pass`,
    latitude: store.latitude || 14.5995 + idx * 0.004,
    longitude: store.longitude || 120.9842 + idx * 0.004,
  }));
}

export function getInitialMenuItems(): MenuItem[] {
  return loadFromStorage(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
}

export function getInitialOrders(): Order[] {
  return loadFromStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export function getInitialRiders(): Rider[] {
  return loadFromStorage(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
}

export function getInitialStaff(): Staff[] {
  const loaded = loadFromStorage<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  return loaded.map((staff, idx) => ({
    ...staff,
    pin: staff.pin || (idx === 0 ? '1234' : idx === 1 ? '5678' : '9900'),
  }));
}

export function getInitialTimecards(): Timecard[] {
  return loadFromStorage(STORAGE_KEYS.TIMECARDS, INITIAL_TIMECARDS);
}

export function getInitialInventory(): InventoryItem[] {
  return loadFromStorage(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
}

export function getInitialPromos(): PromoCode[] {
  return loadFromStorage(STORAGE_KEYS.PROMOS, INITIAL_PROMOS);
}

export { STORAGE_KEYS };
