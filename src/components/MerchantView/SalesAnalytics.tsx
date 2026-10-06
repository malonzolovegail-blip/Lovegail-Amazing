import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Store, Order } from '../../types';
import { exportOrdersReport } from '../../services/excelService';

interface SalesAnalyticsProps {
  store: Store;
  orders: Order[];
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  store,
  orders,
}) => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'all'>('today');

  const storeOrders = orders.filter((o) => o.storeId === store.id);

  // Compute metrics
  const totalOrdersCount = storeOrders.length;
  const walkInOrders = storeOrders.filter((o) => o.type === 'walk_in');
  const onlineOrders = storeOrders.filter((o) => o.type === 'online_delivery');

  const grossSales = storeOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalDeliveryCollected = storeOrders.reduce((sum, o) => sum + o.deliveryFee, 0);
  const totalPromosDeducted = storeOrders.reduce((sum, o) => sum + o.promoDiscount, 0);

  // 5 PESO PLATFORM FEE ACCUMULATION
  const totalPlatformFees = storeOrders.reduce((sum, o) => sum + (o.platformFee || 5), 0);
  const netMerchantSales = grossSales - totalDeliveryCollected - totalPlatformFees;

  const avgOrderValue = totalOrdersCount > 0 ? Math.round(grossSales / totalOrdersCount) : 0;

  // Best selling dishes calculation
  const dishSalesMap: Record<string, { name: string; count: number; revenue: number; img: string }> = {};
  storeOrders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.menuItem.id;
      if (!dishSalesMap[id]) {
        dishSalesMap[id] = {
          name: item.menuItem.name,
          count: 0,
          revenue: 0,
          img: item.menuItem.imageUrl,
        };
      }
      dishSalesMap[id].count += item.quantity;
      dishSalesMap[id].revenue += item.totalPrice;
    });
  });

  const topDishes = Object.values(dishSalesMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const handleExportSales = () => {
    exportOrdersReport(storeOrders, store.name);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Real-Time Business Intelligence</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sales & Revenue Analytics Dashboard
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Live omnichannel performance tracking across counter walk-in and 3km online delivery orders.
          </p>
        </div>

        <button
          onClick={handleExportSales}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales Excel (.xlsx)</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Gross Sales Revenue
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">
            ₱{grossSales.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            ↑ Includes walk-in & online
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Total Orders Processed
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">
            {totalOrdersCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex gap-2">
            <span>🛵 {onlineOrders.length} Online</span>
            <span>•</span>
            <span>🍽️ {walkInOrders.length} Walk-in</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Average Order Value (AOV)
          </span>
          <div className="text-2xl font-black text-orange-600 mt-1">
            ₱{avgOrderValue}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Per customer ticket
          </span>
        </div>

        {/* 5 PESO PLATFORM FEE ACCUMULATION DISPLAY */}
        <div className="bg-linear-to-br from-orange-50 to-amber-50 p-5 rounded-3xl border border-orange-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-800 font-bold uppercase tracking-wider block">
              Platform Service Fees
            </span>
            <ShieldCheck className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-700 mt-1">
            ₱{totalPlatformFees}
          </div>
          <span className="text-[11px] text-orange-600 font-medium mt-1 block">
            {totalOrdersCount} orders × ₱5 flat rate fee
          </span>
        </div>
      </div>

      {/* Omnichannel Breakdown: Walk-in vs Online */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Walk-in vs Online Channel Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
            Omnichannel Sales Channel Distribution
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-orange-600" />
                  <span>3-Km Online Delivery Orders</span>
                </span>
                <span className="text-gray-900">
                  {onlineOrders.length} orders (₱
                  {onlineOrders.reduce((s, o) => s + o.grandTotal, 0).toLocaleString()})
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full"
                  style={{
                    width: `${
                      totalOrdersCount > 0 ? (onlineOrders.length / totalOrdersCount) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-700 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-purple-600" />
                  <span>Counter Dine-in / Walk-in Orders</span>
                </span>
                <span className="text-gray-900">
                  {walkInOrders.length} orders (₱
                  {walkInOrders.reduce((s, o) => s + o.grandTotal, 0).toLocaleString()})
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${
                      totalOrdersCount > 0 ? (walkInOrders.length / totalOrdersCount) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">
                Delivery Collected
              </span>
              <strong className="text-sm text-gray-900">₱{totalDeliveryCollected}</strong>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-gray-400 block text-[10px] font-bold uppercase">
                Promo Discounts Given
              </span>
              <strong className="text-sm text-gray-900">₱{totalPromosDeducted}</strong>
            </div>
          </div>
        </div>

        {/* Top Selling Dishes Leaderboard */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">
            Top-Selling Menu Items
          </h3>

          <div className="space-y-3">
            {topDishes.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No dish sales recorded yet.
              </div>
            ) : (
              topDishes.map((dish, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 w-4">
                      #{idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={dish.img}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <strong className="text-xs text-gray-900 block">{dish.name}</strong>
                      <span className="text-[11px] text-gray-500">
                        {dish.count} orders fulfilled
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-orange-600">
                    ₱{dish.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Log Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            All Processed Transactions & ₱5 Fee Ledger
          </h3>
          <span className="text-xs text-gray-400">{storeOrders.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">Ticket</th>
                <th className="p-4">Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Items</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-right text-orange-600">Platform Fee</th>
                <th className="p-4 text-right font-black text-gray-900">Grand Total</th>
                <th className="p-4 text-center">Payment</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {storeOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80">
                  <td className="p-4 font-mono font-bold text-gray-900">#{order.id}</td>
                  <td className="p-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{order.customerName}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        order.type === 'walk_in'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {order.type === 'walk_in' ? 'Walk-in' : '3km Delivery'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-700">
                    {order.items.reduce((s, i) => s + i.quantity, 0)}
                  </td>
                  <td className="p-4 text-right text-gray-600">₱{order.subtotal}</td>
                  <td className="p-4 text-right font-bold text-orange-600">₱{order.platformFee}</td>
                  <td className="p-4 text-right font-black text-gray-900">₱{order.grandTotal}</td>
                  <td className="p-4 text-center text-gray-500">{order.paymentMethod}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-md text-[10px]">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
