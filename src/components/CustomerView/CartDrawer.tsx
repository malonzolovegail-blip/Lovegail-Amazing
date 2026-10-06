import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  MapPin,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { CartItem, Store, PromoCode, Order } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentStore: Store | null;
  promos: PromoCode[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  selectedPromoCode?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentStore,
  promos,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  selectedPromoCode,
}) => {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('Maria Clara Santos');
  const [customerPhone, setCustomerPhone] = useState('+63 917 888 1234');
  const [deliveryAddress, setDeliveryAddress] = useState('Unit 4B Grand Towers, 1.2km away');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Cash on Delivery' | 'Maya'>('GCash');
  const [promoInput, setPromoInput] = useState(selectedPromoCode || '');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(() => {
    if (selectedPromoCode) {
      return promos.find((p) => p.code === selectedPromoCode) || null;
    }
    return null;
  });
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Delivery fee calculation based on merchant's adjustable settings
  const storeDistance = currentStore ? currentStore.distanceKm : 1.2;
  const baseFee = currentStore ? currentStore.baseDeliveryFee : 35;
  const perKmFee = currentStore ? currentStore.perKmDeliveryFee : 10;
  const rawDeliveryFee = baseFee + Math.round(storeDistance * perKmFee);

  // Free delivery threshold check
  const deliveryFee =
    currentStore?.freeDeliveryThreshold && subtotal >= currentStore.freeDeliveryThreshold
      ? 0
      : rawDeliveryFee;

  // Promo discount calculation
  let promoDiscount = 0;
  if (appliedPromo) {
    if (subtotal >= appliedPromo.minOrder) {
      if (appliedPromo.discountType === 'percentage') {
        promoDiscount = Math.round((subtotal * appliedPromo.discountValue) / 100);
      } else {
        promoDiscount = appliedPromo.discountValue;
      }
    }
  }

  // 5 PESO PLATFORM FEE AS REQUIRED BY USER SPECIFICATION
  const PLATFORM_FEE = 5;
  const grandTotal = Math.max(0, subtotal + deliveryFee - promoDiscount + PLATFORM_FEE);

  const handleApplyPromo = () => {
    setPromoMessage(null);
    const code = promoInput.trim().toUpperCase();
    const found = promos.find((p) => p.code.toUpperCase() === code);

    if (!found) {
      setPromoMessage('Invalid voucher code.');
      setAppliedPromo(null);
      return;
    }

    if (found.storeId && currentStore && found.storeId !== currentStore.id) {
      setPromoMessage('This voucher is only valid for another merchant.');
      setAppliedPromo(null);
      return;
    }

    if (subtotal < found.minOrder) {
      setPromoMessage(`Minimum order of ₱${found.minOrder} required for this promo.`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
    setPromoMessage(`Applied! You saved ${found.discountType === 'percentage' ? `${found.discountValue}%` : `₱${found.discountValue}`}`);
  };

  const handleCheckout = () => {
    if (!currentStore || cart.length === 0) return;
    if (!customerName.trim() || !customerAddressValid()) return;

    const newOrder: Order = {
      id: `LS-${Math.floor(1000 + Math.random() * 9000)}`,
      storeId: currentStore.id,
      storeName: currentStore.name,
      type: 'online_delivery',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      distanceKm: storeDistance,
      items: [...cart],
      subtotal,
      deliveryFee,
      promoDiscount,
      appliedPromoCode: appliedPromo?.code,
      platformFee: PLATFORM_FEE, // ₱5 platform fee
      riderFee: PLATFORM_FEE, // ₱5 rider fee
      grandTotal,
      paymentMethod,
      status: 'New', // dispatched to kitchen!
      createdAt: new Date().toISOString(),
      estimatedMinutes: 20 + Math.round(storeDistance * 4),
      itemImageThumbnail: cart[0].menuItem.imageUrl,
      kitchenNotes: cart.map((i) => i.specialInstructions).filter(Boolean).join('; ') || undefined,
    };

    onPlaceOrder(newOrder);
    onClearCart();
    onClose();
  };

  const customerAddressValid = () => deliveryAddress.trim().length > 3;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end">
      <div
        className={`w-full max-w-md h-full shadow-2xl flex flex-col transition-colors border-l ${
          isDark
            ? 'bg-[#0E1422] text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 transition-colors ${
            isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Your Order Cart</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentStore ? currentStore.name : 'LocalServe Marketplace'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold mb-1">Your cart is empty</h3>
              <p className={`text-xs max-w-xs mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Explore nearby stores within 3 kilometers and add delicious meals to your cart.
              </p>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-white text-slate-950 hover:bg-slate-200'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
                }`}
              >
                Browse Nearby Stores
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <span>Selected Items ({cart.length})</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-500 hover:text-rose-400 font-semibold cursor-pointer lowercase"
                  >
                    clear all
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border flex gap-3 items-center justify-between transition-colors ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Item Photo */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black truncate">
                        {item.menuItem.name}
                      </h4>

                      {item.selectedVariants.length > 0 && (
                        <div className={`text-[11px] line-clamp-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.selectedVariants.map((v) => v.optionName).join(', ')}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <div className="text-[10px] text-amber-400 italic line-clamp-1 mt-0.5">
                          Note: {item.specialInstructions}
                        </div>
                      )}

                      <div className="text-xs font-mono font-bold mt-1">
                        ₱{item.totalPrice}
                      </div>
                    </div>

                    {/* Quantity Modifier */}
                    <div
                      className={`flex items-center rounded-xl p-0.5 border ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer ${
                          isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer ${
                          isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Address & Contact */}
              <div className={`border-t pt-4 space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  <MapPin className="w-3.5 h-3.5 opacity-70" />
                  <span>3-Km Delivery Info</span>
                </h3>

                <div className="space-y-2">
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Receiver Full Name"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-hidden border transition-colors ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Mobile Number"
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-hidden border transition-colors ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Delivery street, landmark, floor/unit number..."
                      className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-hidden border transition-colors ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <label className={`block text-xs font-bold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  <Tag className="w-3.5 h-3.5 opacity-70" />
                  <span>Promo Code Voucher</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code (e.g. LOCAL15, FREE50)"
                    className={`flex-1 px-3 py-2 text-xs uppercase font-mono rounded-xl focus:outline-hidden border transition-colors ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-white text-slate-950 hover:bg-slate-200'
                        : 'bg-slate-950 text-white hover:bg-slate-800'
                    }`}
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] mt-1 font-semibold ${
                      appliedPromo ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <label className={`block text-xs font-bold mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  <CreditCard className="w-3.5 h-3.5 opacity-70" />
                  <span>Payment Method</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GCash', 'Cash on Delivery', 'Maya'] as const).map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-2 rounded-xl border text-center transition-all text-[11px] font-bold cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'border-white bg-slate-800 text-white font-black'
                              : 'border-slate-950 bg-slate-950 text-white font-black'
                            : isDark
                            ? 'border-slate-800 text-slate-400 hover:text-white bg-slate-900/60'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Cost Breakdown with 5 Peso Platform Fee */}
              <div className={`border-t pt-4 space-y-2 text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Items Subtotal</span>
                  <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₱{subtotal}
                  </span>
                </div>

                <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="flex items-center gap-1">
                    <span>Adjustable Delivery Fee</span>
                    <span className="text-[10px] opacity-60 font-mono">({storeDistance} km)</span>
                  </span>
                  <span className={`font-mono font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `₱${deliveryFee}`
                    )}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium font-mono">
                    <span>Promo Discount ({appliedPromo?.code})</span>
                    <span>-₱{promoDiscount}</span>
                  </div>
                )}

                {/* 5 PESO PLATFORM FEE DISPLAY */}
                <div
                  className={`flex justify-between items-center p-2.5 rounded-xl border font-medium ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 opacity-70" />
                    <span>Platform Service Fee</span>
                  </div>
                  <span className="font-mono font-bold">₱{PLATFORM_FEE}</span>
                </div>

                <div className={`pt-2 border-t flex justify-between items-baseline text-sm ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <span className="font-black">Grand Total</span>
                  <span className="text-xl font-black font-mono">₱{grandTotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Checkout Button */}
        {cart.length > 0 && (
          <div
            className={`p-4 sm:p-5 border-t shrink-0 transition-colors ${
              isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <button
              onClick={handleCheckout}
              disabled={!customerAddressValid()}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-between shadow-lg transition-all cursor-pointer ${
                isDark
                  ? 'bg-white hover:bg-slate-200 text-slate-950 shadow-white/10 disabled:opacity-40'
                  : 'bg-slate-950 hover:bg-slate-800 text-white shadow-slate-950/20 disabled:opacity-40'
              }`}
            >
              <span>Place Order with Rider Rotation</span>
              <span className="font-mono">₱{grandTotal}</span>
            </button>
            <p className="text-[10px] text-center opacity-60 mt-2">
              Includes ₱5 platform fee • Dispatched to nearest clocked-in biker
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
