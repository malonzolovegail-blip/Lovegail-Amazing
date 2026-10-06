import React, { useState } from 'react';
import {
  TrendingDown,
  AlertOctagon,
  Boxes,
  DollarSign,
  Users,
  ShieldCheck,
  Calendar,
  Download,
  AlertTriangle,
  ArrowDownRight,
  Sparkles,
  PieChart,
  CheckCircle,
} from 'lucide-react';
import { Store, Order, InventoryItem, InventoryMovementLog, Timecard, Staff } from '../../types';
import * as XLSX from 'xlsx';

interface LossesExpensesMonitorProps {
  store: Store;
  orders: Order[];
  inventory: InventoryItem[];
  inventoryLogs: InventoryMovementLog[];
  timecards: Timecard[];
  staffList: Staff[];
}

export const LossesExpensesMonitor: React.FC<LossesExpensesMonitorProps> = ({
  store,
  orders,
  inventory,
  inventoryLogs,
  timecards,
  staffList,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today');

  const storeOrders = orders.filter((o) => o.storeId === store.id);
  const storeInventory = inventory.filter((i) => i.storeId === store.id);
  const storeLogs = inventoryLogs.filter((l) => l.storeId === store.id);
  const storeTimecards = timecards.filter((t) => t.storeId === store.id);
  const storeStaff = staffList.filter((s) => s.storeId === store.id);

  // 1. REVENUE
  const grossSales = storeOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // 2. INVENTORY STOCK IN EXPENSES (Restocking purchases)
  const restockExpenses = storeInventory.reduce((sum, item) => sum + item.stockIn * item.unitCost, 0);

  // 3. KITCHEN INVENTORY USAGE EXPENSES (Cost of Goods Sold - COGS)
  // Stock OUT items used for regular prep and orders
  const normalUsageLogs = storeLogs.filter(
    (l) => l.type === 'OUT' && !l.isLossOrWaste && !l.reason.toLowerCase().includes('spoilage') && !l.reason.toLowerCase().includes('waste')
  );
  const cogsExpenses = storeInventory.reduce((sum, item) => sum + item.stockOut * item.unitCost, 0);

  // 4. DIRECT INVENTORY LOSSES & WASTAGE (Spoilage, Expired, Damaged)
  const wastageLogs = storeLogs.filter(
    (l) => l.isLossOrWaste || l.reason.toLowerCase().includes('spoilage') || l.reason.toLowerCase().includes('waste') || l.reason.toLowerCase().includes('damage') || l.reason.toLowerCase().includes('expired')
  );
  
  // Calculate total spoilage loss from logs and items
  const totalSpoilageLosses = wastageLogs.reduce((sum, log) => {
    if (log.costImpact) return sum + log.costImpact;
    const item = storeInventory.find((i) => i.id === log.itemId);
    return sum + log.quantity * (item?.unitCost || log.unitCost || 100);
  }, 0);

  // 5. LABOR / PAYROLL EXPENSES (from active timecards & hourly rate)
  const laborExpenses = storeStaff.reduce((sum, staff) => {
    const cards = storeTimecards.filter((t) => t.staffId === staff.id);
    const regHours = cards.reduce((s, c) => s + (c.regularHours || 0), 0);
    const otHours = cards.reduce((s, c) => s + (c.overtimeHours || 0), 0);
    const regPay = regHours * staff.hourlyRate;
    const otPay = otHours * staff.hourlyRate * 1.25;
    return sum + regPay + otPay;
  }, 0);

  // 6. PLATFORM SERVICE FEES (₱5 per transaction)
  const platformFeeExpenses = storeOrders.reduce((sum, o) => sum + (o.platformFee || 5), 0);

  // 7. TOTAL OPERATING EXPENSES & NET PROFIT
  const totalExpensesAndLosses = cogsExpenses + totalSpoilageLosses + laborExpenses + platformFeeExpenses;
  const netOperatingProfit = grossSales - totalExpensesAndLosses;
  const netMarginPercent = grossSales > 0 ? Math.round((netOperatingProfit / grossSales) * 100) : 0;

  // Export Financial Loss & Expense Report
  const handleExportFinancialReport = () => {
    const summaryRows = [
      { Metric: 'Gross Sales Revenue', Amount_PHP: grossSales, Category: 'Income' },
      { Metric: 'Cost of Goods Sold (Kitchen Usage)', Amount_PHP: -cogsExpenses, Category: 'Direct Expense' },
      { Metric: 'Inventory Spoilage & Wastage Losses', Amount_PHP: -totalSpoilageLosses, Category: 'Loss / Waste' },
      { Metric: 'Staff Labor & Payroll', Amount_PHP: -laborExpenses, Category: 'Operating Expense' },
      { Metric: 'Platform Transaction Fees (₱5/order)', Amount_PHP: -platformFeeExpenses, Category: 'Platform Fee' },
      { Metric: 'NET OPERATING PROFIT / (LOSS)', Amount_PHP: netOperatingProfit, Category: 'Bottom Line' },
    ];

    const lossDetailRows = wastageLogs.map((log) => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      'Ingredient / Item': log.itemName,
      'Wasted Quantity': log.quantity,
      'Reason / Cause': log.reason,
      'Financial Loss (PHP)': log.costImpact || log.quantity * (storeInventory.find((i) => i.id === log.itemId)?.unitCost || 0),
      'Reported By': log.performedBy,
    }));

    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    const detailsSheet = XLSX.utils.json_to_sheet(lossDetailRows);

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Financial P&L Overview');
    XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Wastage & Losses Audit');

    XLSX.writeFile(
      workbook,
      `${store.name.replace(/\s+/g, '_')}_Financial_Losses_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-gray-950 via-gray-900 to-rose-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>Connected Store Controller</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Losses, Expenses & Financial P&L Monitor
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-xl">
            Directly connected to daily staff Inventory IN/OUT entries, kitchen wastage logs, and staff timecards to safeguard merchant profit margins.
          </p>
        </div>

        <button
          onClick={handleExportFinancialReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export P&L Report (.xlsx)</span>
        </button>
      </div>

      {/* Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
            1. Gross Sales Revenue
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">
            ₱{grossSales.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {storeOrders.length} transactions total
          </span>
        </div>

        {/* Spoilage & Wastage Losses */}
        <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-rose-800 font-bold uppercase tracking-wider block">
              2. Spoilage & Waste Losses
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            -₱{totalSpoilageLosses.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">
            {wastageLogs.length} wastage incidents recorded
          </span>
        </div>

        {/* Operating Expenses (COGS + Labor + ₱5 Fees) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
            3. Total Operating Costs
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            -₱{(cogsExpenses + laborExpenses + platformFeeExpenses).toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Food cost + Labor + ₱5 platform fee
          </span>
        </div>

        {/* Net Operating Profit / Margin */}
        <div
          className={`p-5 rounded-3xl border shadow-xs ${
            netOperatingProfit >= 0
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            4. Net Profit / (Loss)
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            ₱{netOperatingProfit.toLocaleString()}
          </div>
          <span className="text-[11px] font-bold mt-1 block">
            {netMarginPercent}% net profit margin
          </span>
        </div>
      </div>

      {/* Detailed Expense & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown Table */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Store Expense Structure Breakdown
            </h3>
            <span className="text-[11px] font-bold text-gray-400">Real-Time Sync</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div>
                <strong className="text-gray-900 block">Kitchen Ingredients Used (COGS)</strong>
                <span className="text-[11px] text-gray-500">Calculated from daily stock-out usage</span>
              </div>
              <span className="font-black text-sm text-gray-900">₱{cogsExpenses.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-50/80 rounded-2xl border border-rose-100">
              <div>
                <strong className="text-rose-950 block">Spoilage & Wastage Losses</strong>
                <span className="text-[11px] text-rose-700">Expired, dropped, or spoiled ingredients</span>
              </div>
              <span className="font-black text-sm text-rose-600">-₱{totalSpoilageLosses.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
              <div>
                <strong className="text-gray-900 block">Staff Labor & Wages</strong>
                <span className="text-[11px] text-gray-500">Regular hours + overtime from clock in/out</span>
              </div>
              <span className="font-black text-sm text-gray-900">₱{laborExpenses.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50/80 rounded-2xl border border-orange-100">
              <div>
                <strong className="text-orange-950 block">Platform Processing Fees</strong>
                <span className="text-[11px] text-orange-800">{storeOrders.length} orders × ₱5 per transaction</span>
              </div>
              <span className="font-black text-sm text-orange-600">₱{platformFeeExpenses}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
              <div>
                <strong className="text-blue-950 block">Inventory Restocking Purchases</strong>
                <span className="text-[11px] text-blue-800">Total new stock bought (Stock IN)</span>
              </div>
              <span className="font-black text-sm text-blue-700">₱{restockExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Loss Prevention & Top Spoilage Incidents */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Ingredient Loss & Wastage Audit</span>
            </h3>
            <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
              {wastageLogs.length} logs
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {wastageLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p>No ingredient spoilage or wastage reported today! Kitchen running at optimal efficiency.</p>
              </div>
            ) : (
              wastageLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-gray-900 block">{log.itemName}</strong>
                      <span className="text-[11px] text-rose-600 font-semibold">
                        Cause: {log.reason}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Logged by {log.performedBy} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 block">
                      -₱{log.costImpact || log.quantity * 100}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {log.quantity} units lost
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
            <strong>Manager Action:</strong> Staff entering daily stock out can tag items as "Spoilage / Waste / Expired". These entries instantly flow into this dashboard for inventory shrinkage monitoring.
          </div>
        </div>
      </div>
    </div>
  );
};
