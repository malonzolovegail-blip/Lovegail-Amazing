import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { Order } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border flex flex-col max-h-[92vh] transition-colors ${
          isDark
            ? 'bg-[#0E1422] text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Receipt Top Header */}
        <div
          className={`p-6 text-center relative shrink-0 transition-colors ${
            isDark ? 'bg-slate-900 border-b border-slate-800 text-white' : 'bg-slate-950 text-white'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black">Order Placed Successfully!</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your order was transmitted to the kitchen & entered the rider rotation queue.
          </p>
        </div>

        {/* Scrollable Printable Receipt Content */}
        <div
          id="printable-receipt"
          className={`p-6 overflow-y-auto flex-1 space-y-5 ${
            isDark ? 'text-slate-300' : 'text-gray-800'
          }`}
        >
          {/* Receipt Header Info */}
          <div
            className={`text-center pb-4 border-b border-dashed ${
              isDark ? 'border-slate-800' : 'border-gray-300'
            }`}
          >
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.storeName}</h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Official Hyperlocal Digital Receipt</p>
            <div
              className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-800'
              }`}
            >
              <span>Receipt #{order.id}</span>
              <span>•</span>
              <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div
            className={`grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl border ${
              isDark
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div>
              <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Customer</span>
              <strong className={isDark ? 'text-white' : 'text-gray-900'}>{order.customerName}</strong>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{order.customerPhone}</p>
            </div>
            <div>
              <span className={`block text-[10px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Delivery Address</span>
              <p className={`font-medium line-clamp-2 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{order.deliveryAddress}</p>
              <p className="text-emerald-400 font-bold text-[11px] font-mono">{order.distanceKm} km away (3km zone)</p>
            </div>
          </div>

          {/* Kitchen Order Status Banner */}
          <div
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <div>
                <span className="font-bold">Current Status: {order.status}</span>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-amber-700'}`}>Estimated delivery: {order.estimatedMinutes} mins</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 font-bold rounded-lg text-[10px] uppercase border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-amber-200 border-amber-300 text-amber-900'
              }`}
            >
              In Kitchen
            </span>
          </div>

          {/* Itemized Order Breakdown */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              Order Items ({order.items.length})
            </h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start justify-between gap-3 text-xs pb-3 border-b last:border-0 ${
                    isDark ? 'border-slate-800' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Item Thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity}× {item.menuItem.name}
                      </span>
                      {item.selectedVariants.length > 0 && (
                        <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {item.selectedVariants.map((v) => `${v.groupName}: ${v.optionName}`).join(' • ')}
                        </div>
                      )}
                      {item.specialInstructions && (
                        <div className="text-[10px] text-amber-400 italic mt-0.5">
                          Note: {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`font-mono font-bold shrink-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>₱{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className={`space-y-1.5 text-xs pt-2 border-t border-dashed ${isDark ? 'border-slate-800' : 'border-gray-300'}`}>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <span>Subtotal</span>
              <span className="font-mono">₱{order.subtotal}</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <span>Delivery Fee ({order.distanceKm} km)</span>
              <span className="font-mono">₱{order.deliveryFee}</span>
            </div>
            {order.promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium font-mono">
                <span>Voucher Discount ({order.appliedPromoCode})</span>
                <span>-₱{order.promoDiscount}</span>
              </div>
            )}
            {/* 5 PESO PLATFORM FEE AS SPECIFIED */}
            <div
              className={`flex justify-between items-center p-2 rounded-xl border font-semibold ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
                <span>Platform Processing Fee</span>
              </span>
              <span className="font-mono">₱{order.platformFee}</span>
            </div>
            <div
              className={`flex justify-between text-base font-black pt-2 border-t ${
                isDark ? 'border-slate-800 text-white' : 'border-gray-200 text-gray-900'
              }`}
            >
              <span>Total Paid ({order.paymentMethod})</span>
              <span className="font-mono text-xl">₱{order.grandTotal}</span>
            </div>
          </div>

          {/* Rider Rotation & Dispatch Notice */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              isDark
                ? 'bg-slate-900/60 border-slate-800'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-900'
                }`}
              >
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <span className={`font-bold block ${isDark ? 'text-white' : 'text-gray-900'}`}>Rider Rotation Dispatch</span>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {order.assignedRiderName ? `Assigned: ${order.assignedRiderName}` : 'Fair rotation dispatching nearest biker...'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
                Near 3km Zone
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          className={`p-4 border-t flex items-center gap-3 shrink-0 transition-colors ${
            isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <button
            onClick={handlePrint}
            className={`flex-1 py-3 px-4 border rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700 shadow-2xs'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-colors cursor-pointer ${
              isDark
                ? 'bg-white text-slate-950 hover:bg-slate-200'
                : 'bg-slate-950 text-white hover:bg-slate-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
