import React, { useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bike,
  Sparkles,
  Search,
  Bell,
  Utensils,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Order, OrderStatus, Store, Rider } from '../../types';

interface KitchenDisplayProps {
  store: Store;
  orders: Order[];
  riders: Rider[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAssignRider: (orderId: string, riderId: string) => void;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  store,
  orders,
  riders,
  onUpdateOrderStatus,
  onAssignRider,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('active'); // active, all, new, preparing, ready
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter orders for this specific store
  const storeOrders = orders.filter((o) => o.storeId === store.id);

  const displayedOrders = storeOrders.filter((order) => {
    if (filterStatus === 'active') {
      return order.status === 'New' || order.status === 'Preparing' || order.status === 'Ready';
    }
    if (filterStatus === 'all') return true;
    return order.status.toLowerCase() === filterStatus.toLowerCase();
  });

  // Count active orders
  const newCount = storeOrders.filter((o) => o.status === 'New').length;
  const preparingCount = storeOrders.filter((o) => o.status === 'Preparing').length;
  const readyCount = storeOrders.filter((o) => o.status === 'Ready').length;

  const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
    New: 'Preparing',
    Preparing: 'Ready',
    Ready: 'OutForDelivery',
    OutForDelivery: 'Delivered',
    Delivered: null,
    Cancelled: null,
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-red-500 text-white animate-pulse';
      case 'Preparing':
        return 'bg-amber-500 text-white';
      case 'Ready':
        return 'bg-emerald-600 text-white';
      case 'OutForDelivery':
        return 'bg-blue-600 text-white';
      case 'Delivered':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Kitchen Display System (KDS) Header */}
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
            <ChefHat className="w-4 h-4" />
            <span>Visual Kitchen Display System (KDS)</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Live Kitchen Order Screen
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Displays item photos & detailed modifications so cook staff makes <strong>zero order mistakes</strong>.
            Click status button to progress ticket.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 bg-gray-800/80 p-2 rounded-2xl border border-gray-700">
          <button
            onClick={() => setFilterStatus('new')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterStatus === 'new' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span>New: {newCount}</span>
          </button>

          <button
            onClick={() => setFilterStatus('preparing')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterStatus === 'preparing' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>Cooking: {preparingCount}</span>
          </button>

          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterStatus === 'ready' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>Ready: {readyCount}</span>
          </button>

          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'active' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Active
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">Kitchen Queue is Clear!</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            All customer and walk-in orders have been completed or there are no new orders right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedOrders.map((order) => {
            const nextStatus = nextStatusMap[order.status];
            const isWalkIn = order.type === 'walk_in';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  order.status === 'New'
                    ? 'border-red-400 shadow-red-500/10'
                    : order.status === 'Preparing'
                    ? 'border-amber-400'
                    : 'border-emerald-400'
                }`}
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                      #{order.id}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Customer & Type Badge */}
                <div className="px-4 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{order.customerName}</span>
                    <span className="block text-[11px] text-gray-400">
                      {isWalkIn ? '🍽️ Dine-in / Walk-in Order' : `🛵 Online Delivery (${order.distanceKm} km)`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isWalkIn
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {isWalkIn ? 'Walk-in POS' : 'Online Order'}
                  </span>
                </div>

                {/* VISUAL KITCHEN ITEMS LIST WITH FOOD PHOTOS */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-80">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                    Visual Recipe & Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                  </div>

                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex gap-3 items-start"
                    >
                      {/* CRITICAL: FOOD PHOTO FOR ACCURACY */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-300 shadow-2xs">
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-black text-gray-900">
                            <span className="text-orange-600 font-extrabold text-sm mr-1">
                              {item.quantity}×
                            </span>
                            {item.menuItem.name}
                          </h4>
                        </div>

                        {/* Selected Variants / Recipe Choices */}
                        {item.selectedVariants.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.selectedVariants.map((v, vIdx) => (
                              <span
                                key={vIdx}
                                className="text-[10px] bg-white border border-gray-300 text-gray-800 font-bold px-1.5 py-0.5 rounded-md shadow-2xs"
                              >
                                {v.groupName}: <span className="text-orange-700">{v.optionName}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Special Instructions */}
                        {item.specialInstructions && (
                          <div className="mt-1.5 text-[11px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-200">
                            ⚠️ Cook Note: {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* General Kitchen Notes */}
                  {order.kitchenNotes && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                      <strong>Special Request:</strong> {order.kitchenNotes}
                    </div>
                  )}
                </div>

                {/* Rider Assignment Info */}
                {!isWalkIn && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5 text-orange-600" />
                      <span>Rider:</span>
                    </span>
                    <select
                      value={order.assignedRiderId || ''}
                      onChange={(e) => onAssignRider(order.id, e.target.value)}
                      className="text-xs font-bold text-gray-800 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                    >
                      <option value="">Auto-Assign (Rotation)</option>
                      {riders
                        .filter((r) => r.isClockedIn)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.vehicleType})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Status Progression Click Button */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  {nextStatus ? (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                      className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                        order.status === 'New'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : order.status === 'Preparing'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>
                        {order.status === 'New' && 'Start Cooking (Preparing)'}
                        {order.status === 'Preparing' && 'Mark Food Ready for Pickup'}
                        {order.status === 'Ready' && (isWalkIn ? 'Complete Walk-in Order' : 'Hand Over to Rider')}
                        {order.status === 'OutForDelivery' && 'Confirm Delivery Completed'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-center text-xs font-bold text-emerald-600 py-1.5 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
