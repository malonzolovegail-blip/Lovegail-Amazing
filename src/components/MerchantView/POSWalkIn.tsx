import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  CreditCard,
  User,
  ShoppingBag,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Store, MenuItem, CartItem, Order } from '../../types';
import { ProductModal } from '../CustomerView/ProductModal';

interface POSWalkInProps {
  store: Store;
  menuItems: MenuItem[];
  onPlaceWalkInOrder: (order: Order) => void;
}

export const POSWalkIn: React.FC<POSWalkInProps> = ({
  store,
  menuItems,
  onPlaceWalkInOrder,
}) => {
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [customerName, setCustomerName] = useState('Table 1 / Walk-in');
  const [paymentMethod, setPaymentMethod] = useState<'Cash (Walk-in)' | 'GCash' | 'Maya'>('Cash (Walk-in)');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchDish, setSearchDish] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems = menuItems.filter((i) => {
    const matchesCat = categoryFilter === 'All' || i.category === categoryFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchDish.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const subtotal = posCart.reduce((s, i) => s + i.totalPrice, 0);
  const PLATFORM_FEE = 5; // 5 pesos transaction fee
  const grandTotal = subtotal + (subtotal > 0 ? PLATFORM_FEE : 0);

  const handleAddToCart = (item: CartItem) => {
    setPosCart((prev) => [...prev, item]);
  };

  const handleQuickAdd = (menuItem: MenuItem) => {
    if (menuItem.variantGroups.length > 0) {
      setSelectedItemForModal(menuItem);
    } else {
      const lineItem: CartItem = {
        id: `pos-${Date.now()}-${Math.random()}`,
        menuItem,
        quantity: 1,
        selectedVariants: [],
        unitPrice: menuItem.price,
        totalPrice: menuItem.price,
      };
      setPosCart((prev) => [...prev, lineItem]);
    }
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setPosCart((prev) =>
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

  const handleCheckoutWalkIn = () => {
    if (posCart.length === 0) return;

    const newOrder: Order = {
      id: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      storeId: store.id,
      storeName: store.name,
      type: 'walk_in',
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: 'Walk-in Counter',
      deliveryAddress: 'Counter Dine-in / Takeout',
      distanceKm: 0,
      items: [...posCart],
      subtotal,
      deliveryFee: 0,
      promoDiscount: 0,
      platformFee: PLATFORM_FEE,
      riderFee: 0,
      grandTotal,
      paymentMethod,
      status: 'Preparing', // straight to kitchen
      createdAt: new Date().toISOString(),
      estimatedMinutes: 12,
      itemImageThumbnail: posCart[0].menuItem.imageUrl,
      kitchenNotes: 'Dine-in / counter walk-in order',
    };

    onPlaceWalkInOrder(newOrder);
    setPosCart([]);
    setOrderSuccess(true);
    setTimeout(() => setOrderSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selection Grid (2 columns on large screen) */}
      <div className="lg:col-span-2 space-y-4">
        {/* POS Search & Category Filter */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDish}
              onChange={(e) => setSearchDish(e.target.value)}
              placeholder="Search POS dish..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Touch Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleQuickAdd(item)}
              className="group bg-white p-3 rounded-2xl border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.variantGroups.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                      Variants
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-black text-gray-900 group-hover:text-orange-600 line-clamp-1">
                  {item.name}
                </h4>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-black text-gray-900">₱{item.price}</span>
                <span className="p-1 rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POS Order Register Drawer / Column */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between h-[80vh] sticky top-20">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-black text-gray-900">Walk-in Order POS</h3>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {posCart.length} item(s)
            </span>
          </div>

          {orderSuccess && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Walk-in Order sent directly to Kitchen Screen!</span>
            </div>
          )}

          {/* Customer / Table Identifier */}
          <div className="mt-3">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Table / Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Table 4 or Walk-in Takeout"
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Cart Line Items */}
          <div className="mt-3 space-y-2 overflow-y-auto max-h-60 pr-1">
            {posCart.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Tap items on the left to add to this walk-in order ticket.
              </div>
            ) : (
              posCart.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-gray-900 truncate block">
                      {item.menuItem.name}
                    </span>
                    {item.selectedVariants.length > 0 && (
                      <span className="text-[10px] text-gray-500 block truncate">
                        {item.selectedVariants.map((v) => v.optionName).join(', ')}
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-gray-700">
                      ₱{item.totalPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                    <button
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-sm cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* POS Footer: Payment & Total */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {/* Payment Method Selector */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
              {(['Cash (Walk-in)', 'GCash', 'Maya'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {method === 'Cash (Walk-in)' ? 'Cash' : method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₱{subtotal}</span>
            </div>
            {subtotal > 0 && (
              <div className="flex justify-between text-orange-600 font-semibold">
                <span>Platform Fee (POS)</span>
                <span>₱{PLATFORM_FEE}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 pt-1 border-t border-gray-200">
              <span>Total Due</span>
              <span className="text-orange-600">₱{grandTotal}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutWalkIn}
            disabled={posCart.length === 0}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Walk-in & Send to Kitchen</span>
          </button>
        </div>
      </div>

      {/* Product Customization Modal if item has variant groups */}
      <ProductModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
