import React, { useState } from 'react';
import {
  Bike,
  Clock,
  MapPin,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  RotateCw,
  Phone,
  Navigation,
  AlertCircle,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { Rider, Order, OrderStatus } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface RiderDashboardProps {
  riders: Rider[];
  orders: Order[];
  onUpdateRider: (updatedRider: Rider) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onOpenRiderRegisterModal: () => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({
  riders,
  orders,
  onUpdateRider,
  onUpdateOrderStatus,
  onOpenRiderRegisterModal,
}) => {
  const { isDark } = useTheme();
  const [selectedRiderId, setSelectedRiderId] = useState<string>(riders[0]?.id || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeRider = riders.find((r) => r.id === selectedRiderId) || riders[0];

  // Active delivery orders waiting for pickup or delivery
  const readyOrders = orders.filter((o) => o.status === 'Ready' && !o.assignedRiderId);
  const activeDelivery = orders.find(
    (o) =>
      o.assignedRiderId === activeRider.id &&
      (o.status === 'Ready' || o.status === 'OutForDelivery')
  );

  // Clock in / Clock out toggle
  const handleToggleClock = () => {
    const newStatus = !activeRider.isClockedIn;
    const updated: Rider = {
      ...activeRider,
      isClockedIn: newStatus,
      clockInTime: newStatus
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : undefined,
    };

    onUpdateRider(updated);
    setStatusMessage(
      newStatus
        ? `Clocked In! You have entered the fair rotation dispatch queue.`
        : `Clocked Out. Shift ended and removed from active rotation.`
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Accept ready order
  const handleAcceptDelivery = (orderId: string) => {
    if (!activeRider.isClockedIn) {
      setStatusMessage('Please Clock In first before accepting deliveries!');
      setTimeout(() => setStatusMessage(null), 2500);
      return;
    }

    onUpdateOrderStatus(orderId, 'OutForDelivery');
    const updatedRider: Rider = {
      ...activeRider,
      currentOrderId: orderId,
    };
    onUpdateRider(updatedRider);
    setStatusMessage(`Order #${orderId} accepted! Proceed to store for pickup.`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Complete delivery
  const handleCompleteDelivery = (order: Order) => {
    onUpdateOrderStatus(order.id, 'Delivered');

    // 5 PESO PLATFORM FEE DEDUCTED FROM DELIVERED ORDER
    const deliveryIncome = order.deliveryFee;
    const platformFee = 5;
    const netEarnings = deliveryIncome; // Rider gets delivery earnings; ₱5 fee is accounted

    const updatedRider: Rider = {
      ...activeRider,
      completedDeliveries: activeRider.completedDeliveries + 1,
      totalEarnings: activeRider.totalEarnings + netEarnings,
      totalPlatformFeesPaid: activeRider.totalPlatformFeesPaid + platformFee,
      currentOrderId: undefined,
      rotationIndex: activeRider.rotationIndex + 1, // moves forward in rotation queue
    };

    onUpdateRider(updatedRider);
    setStatusMessage(
      `Delivery #${order.id} marked as DELIVERED! +₱${netEarnings} added to earnings (₱5 platform fee accounted).`
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Order all clocked-in riders by rotation queue
  const clockedInRiders = riders.filter((r) => r.isClockedIn);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Rider Switcher */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
            <Bike className="w-4 h-4" />
            <span>Grab / Foodpanda Style Biker Dispatch</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Rider Rotation Dispatch & Delivery Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Fair rotation queue for bikers & motorcycle couriers within the 3km store service area.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Rider Selector */}
          <div className="bg-gray-800 p-1.5 rounded-2xl border border-gray-700 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 pl-2">Active Rider:</span>
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              className="bg-gray-900 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 border border-gray-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.vehicleType} • {r.isClockedIn ? 'ON DUTY' : 'OFF'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenRiderRegisterModal}
            className="px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-black transition-colors cursor-pointer"
          >
            + Register Rider
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Rider Status & Clock In Card */}
      <div
        className={`p-6 rounded-3xl border shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6 items-center transition-colors ${
          isDark
            ? 'bg-[#0E1422] border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Rider Profile & Vehicle */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-md shrink-0">
            <img
              src={activeRider.photoUrl}
              alt={activeRider.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeRider.name}</h3>
            <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {activeRider.vehicleType} • {activeRider.plateNumber}
            </span>
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mt-0.5">
              ⭐ {activeRider.rating.toFixed(2)} rating
            </span>
          </div>
        </div>

        {/* Clock In / Out Toggle & Duty Status */}
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Duty Status</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                activeRider.isClockedIn
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {activeRider.isClockedIn ? '● ON DUTY' : 'OFF DUTY'}
            </span>
          </div>
          <button
            onClick={handleToggleClock}
            className={`w-full py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
              activeRider.isClockedIn
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {activeRider.isClockedIn ? 'Clock OUT (End Shift)' : 'Clock IN (Enter Rotation)'}
          </button>
        </div>

        {/* Rotation Process Queue Metric */}
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className={`text-xs font-bold uppercase block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Rotation Dispatch Position
          </span>
          <div className={`text-2xl font-black font-mono flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-950'}`}>
            <RotateCw className="w-5 h-5 opacity-70" />
            <span>#{activeRider.rotationIndex} in Queue</span>
          </div>
          <span className={`text-[10px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {clockedInRiders.length} clocked-in riders rotating
          </span>
        </div>

        {/* Shift Earnings & 5 Peso Platform Fee Tracking */}
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className={`text-xs font-bold uppercase block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Delivery Earnings
          </span>
          <div className={`text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            ₱{activeRider.totalEarnings.toLocaleString()}
          </div>
          <div className={`text-[11px] mt-1 flex justify-between ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <span>{activeRider.completedDeliveries} completed</span>
            <span className="font-mono">₱{activeRider.totalPlatformFeesPaid} fee paid</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Trip & Delivery Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Ongoing Delivery Trip */}
        <div
          className={`p-6 rounded-3xl border shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 opacity-70" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Active Delivery Trip
                </h3>
              </div>
              {activeDelivery && (
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                      : 'bg-sky-100 text-sky-800 border-sky-200'
                  }`}
                >
                  {activeDelivery.status === 'Ready' ? 'Heading to Store' : 'On the Way to Customer'}
                </span>
              )}
            </div>

            {!activeDelivery ? (
              <div className={`text-center py-16 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                <Bike className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-slate-700' : 'text-gray-300'}`} />
                <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>No Active Delivery</h4>
                <p className="text-xs max-w-xs mx-auto">
                  {activeRider.isClockedIn
                    ? 'You are active in the rotation queue. Accept an order from the queue on the right when ready.'
                    : 'Please Clock In to receive delivery dispatches.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Store Pickup Location */}
                <div
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase text-[10px] opacity-70">
                      1. Store Pickup
                    </span>
                    <span className="font-mono text-[11px] opacity-70">
                      Ticket #{activeDelivery.id}
                    </span>
                  </div>
                  <strong className={`text-sm block ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeDelivery.storeName}</strong>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Pick up freshly packed order at kitchen counter</p>
                </div>

                {/* Customer Drop-off */}
                <div
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">
                      2. Customer Drop-off (3km Zone)
                    </span>
                    <span className="font-mono font-bold text-xs opacity-80">
                      {activeDelivery.distanceKm} km away
                    </span>
                  </div>
                  <strong className={`text-sm block ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeDelivery.customerName}
                  </strong>
                  <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                    {activeDelivery.deliveryAddress}
                  </p>
                  <p className={`text-xs mt-0.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    <Phone className="w-3 h-3" />
                    <span>{activeDelivery.customerPhone}</span>
                  </p>
                </div>

                {/* Items & Payment Summary */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>Order Items:</span>
                    <span>{activeDelivery.items.reduce((s, i) => s + i.quantity, 0)} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Earnings:</span>
                    <span className="font-bold text-emerald-400 font-mono">₱{activeDelivery.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collect from Customer:</span>
                    <span className="font-black font-mono">
                      ₱{activeDelivery.grandTotal} ({activeDelivery.paymentMethod})
                    </span>
                  </div>
                  <div className={`flex justify-between text-[11px] pt-1 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                    <span>Platform Transaction Fee:</span>
                    <span className="font-mono">₱{activeDelivery.platformFee} accounted</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {activeDelivery && (
            <div className={`pt-4 mt-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
              <button
                onClick={() => handleCompleteDelivery(activeDelivery)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Delivered to Customer</span>
              </button>
            </div>
          )}
        </div>

        {/* Ready Orders Rotation Queue */}
        <div
          className={`p-6 rounded-3xl border shadow-xs flex flex-col justify-between transition-colors ${
            isDark
              ? 'bg-[#0E1422] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <RotateCw className="w-5 h-5 opacity-70" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Available Delivery Queue (3km Area)
                </h3>
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                {readyOrders.length} ready for pickup
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-96 pr-1">
              {readyOrders.length === 0 ? (
                <div className={`text-center py-16 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  All kitchen orders have riders assigned or are currently cooking.
                </div>
              ) : (
                readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        <img
                          src={order.itemImageThumbnail}
                          alt="Order"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-black">
                            #{order.id} • {order.storeName}
                          </strong>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border ${
                              isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300'
                                : 'bg-slate-200 border-slate-300 text-slate-800'
                            }`}
                          >
                            {order.distanceKm} km
                          </span>
                        </div>
                        <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          To: {order.customerName} ({order.deliveryAddress})
                        </p>
                        <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">
                          Delivery Pay: ₱{order.deliveryFee}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptDelivery(order.id)}
                      disabled={!activeRider.isClockedIn || !!activeDelivery}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer ${
                        isDark
                          ? 'bg-white hover:bg-slate-200 text-slate-950 disabled:opacity-30'
                          : 'bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-30'
                      }`}
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Clocked-in Rotation Queue List */}
          <div className={`pt-4 mt-4 border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Clocked-in Riders in Fair Rotation:
            </span>
            <div className="flex flex-wrap gap-2">
              {clockedInRiders.map((r, idx) => (
                <div
                  key={r.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                    r.id === activeRider.id
                      ? isDark
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-slate-200 border-slate-300 text-slate-900'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>
                    #{idx + 1} {r.name}
                  </span>
                  <span className="text-[10px] opacity-70">({r.vehicleType})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
