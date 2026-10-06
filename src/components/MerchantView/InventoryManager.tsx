import React, { useState, useRef } from 'react';
import {
  Boxes,
  Plus,
  Minus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Save,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { InventoryItem, InventoryMovementLog, Store } from '../../types';
import { exportInventoryToExcel, importInventoryFromFile } from '../../services/excelService';

interface InventoryManagerProps {
  store: Store;
  inventory: InventoryItem[];
  inventoryLogs: InventoryMovementLog[];
  onUpdateInventory: (items: InventoryItem[]) => void;
  onAddInventoryLog: (log: InventoryMovementLog) => void;
  isStaffOnlyView?: boolean;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  store,
  inventory,
  inventoryLogs,
  onUpdateInventory,
  onAddInventoryLog,
  isStaffOnlyView = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'movement'>('stock');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Spoilage / Loss Record Modal
  const [spoilageModalItem, setSpoilageModalItem] = useState<InventoryItem | null>(null);
  const [spoilageQty, setSpoilageQty] = useState<number>(1);
  const [spoilageReason, setSpoilageReason] = useState<string>('Spoilage / Expired in Chiller');

  // Add Item Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Meat & Poultry');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemBeginning, setNewItemBeginning] = useState(10);
  const [newItemUnitCost, setNewItemUnitCost] = useState(150);
  const [newItemMinReorder, setNewItemMinReorder] = useState(5);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const storeInventory = inventory.filter((i) => i.storeId === store.id);

  const filteredItems = storeInventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = storeInventory.filter((i) => i.currentStock <= i.minReorderLevel).length;

  // Real-time metric calculations
  const totalStockInCost = storeInventory.reduce((sum, item) => sum + item.stockIn * item.unitCost, 0);
  const totalStockOutUsageCost = storeInventory.reduce((sum, item) => sum + item.stockOut * item.unitCost, 0);
  const totalInventoryValue = storeInventory.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0);

  // Direct Inline Field Editor for Stock IN, Stock OUT, Beginning Stock, and Unit Cost
  const handleInlineChange = (
    itemId: string,
    field: 'stockIn' | 'stockOut' | 'beginningStock' | 'unitCost',
    rawVal: string
  ) => {
    const val = Math.max(0, parseFloat(rawVal) || 0);

    const updated = storeInventory.map((item) => {
      if (item.id === itemId) {
        const beginning = field === 'beginningStock' ? val : item.beginningStock;
        const stockIn = field === 'stockIn' ? val : item.stockIn;
        const stockOut = field === 'stockOut' ? val : item.stockOut;
        const unitCost = field === 'unitCost' ? val : item.unitCost;

        // Automatically recompute current stock
        const currentStock = Math.max(0, beginning + stockIn - stockOut);

        return {
          ...item,
          [field]: val,
          currentStock,
          unitCost,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });

    onUpdateInventory(updated);
  };

  // Record Dedicated Spoilage / Wastage Loss
  const handleConfirmSpoilage = () => {
    if (!spoilageModalItem || spoilageQty <= 0) return;

    const costImpact = Math.round(spoilageQty * spoilageModalItem.unitCost);

    const updated = storeInventory.map((item) => {
      if (item.id === spoilageModalItem.id) {
        const newStockOut = item.stockOut + spoilageQty;
        const newCurrent = Math.max(0, item.currentStock - spoilageQty);
        return {
          ...item,
          stockOut: newStockOut,
          currentStock: newCurrent,
          spoilageStock: (item.spoilageStock || 0) + spoilageQty,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    });

    onUpdateInventory(updated);

    // Create connected Loss / Waste log for Merchant Admin monitor
    const lossLog: InventoryMovementLog = {
      id: `log-waste-${Date.now()}`,
      itemId: spoilageModalItem.id,
      itemName: spoilageModalItem.name,
      storeId: store.id,
      type: 'OUT',
      quantity: spoilageQty,
      unitCost: spoilageModalItem.unitCost,
      costImpact,
      isLossOrWaste: true, // FLAGGED DIRECT LOSS
      reason: spoilageReason,
      timestamp: new Date().toISOString(),
      performedBy: isStaffOnlyView ? 'Kitchen Staff' : 'Store Manager',
    };

    onAddInventoryLog(lossLog);

    setSpoilageModalItem(null);
    setSpoilageQty(1);
    setStatusMessage(
      `Spoilage of ${spoilageQty} ${spoilageModalItem.unit} recorded (-₱${costImpact.toLocaleString()}). Transmitted to Merchant Admin Loss Monitor.`
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Add new inventory item
  const handleAddNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      storeId: store.id,
      sku: `SKU-${newItemName.slice(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`,
      name: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      beginningStock: newItemBeginning,
      stockIn: 0,
      stockOut: 0,
      currentStock: newItemBeginning,
      minReorderLevel: newItemMinReorder,
      unitCost: newItemUnitCost,
      lastUpdated: new Date().toISOString(),
    };

    onUpdateInventory([...storeInventory, newItem]);
    setIsAddItemModalOpen(false);
    setNewItemName('');
    setStatusMessage(`Item "${newItem.name}" added to inventory.`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleExportExcel = () => {
    exportInventoryToExcel(storeInventory, store.name);
    setStatusMessage('Inventory exported to Excel (.xlsx) successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importInventoryFromFile(file);
      const merged: InventoryItem[] = [...storeInventory];

      imported.forEach((newItem, idx) => {
        const existingIdx = merged.findIndex((m) => m.sku === newItem.sku || m.name === newItem.name);
        if (existingIdx >= 0) {
          merged[existingIdx] = {
            ...merged[existingIdx],
            ...newItem,
            currentStock: newItem.currentStock ?? merged[existingIdx].currentStock,
            lastUpdated: new Date().toISOString(),
          } as InventoryItem;
        } else {
          merged.push({
            id: `inv-${Date.now()}-${idx}`,
            storeId: store.id,
            sku: newItem.sku || `SKU-${1000 + idx}`,
            name: newItem.name || 'New Item',
            category: newItem.category || 'Kitchen Supplies',
            unit: newItem.unit || 'pcs',
            beginningStock: newItem.beginningStock || 0,
            stockIn: newItem.stockIn || 0,
            stockOut: newItem.stockOut || 0,
            currentStock: newItem.currentStock || 0,
            minReorderLevel: newItem.minReorderLevel || 10,
            unitCost: newItem.unitCost || 50,
            lastUpdated: new Date().toISOString(),
          });
        }
      });

      onUpdateInventory(merged);
      setStatusMessage(`Successfully imported ${imported.length} inventory items!`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error reading Excel/CSV file. Please check format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
            <Boxes className="w-4 h-4" />
            <span>Daily Editable Stock IN & OUT System</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Daily Inventory & Kitchen Supplies
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Directly edit <strong>Stock IN</strong> and <strong>Stock OUT</strong> in the table. Connected automatically to Merchant Admin to track <strong>losses, expenses, and wastage</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Supply Item</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-gray-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export (.xlsx)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metrics Cards: Connected Financial Impact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
            Current Stock Value
          </span>
          <div className="text-2xl font-black text-gray-900 mt-1">
            ₱{totalInventoryValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            {storeInventory.length} items cataloged
          </span>
        </div>

        <div className="bg-blue-50/70 p-5 rounded-3xl border border-blue-200 shadow-xs">
          <span className="text-[11px] text-blue-800 font-bold uppercase tracking-wider block">
            Stock IN Expenses (Restock)
          </span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            ₱{totalStockInCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-blue-600 mt-1 block">
            Transmitted to Merchant Expenses
          </span>
        </div>

        <div className="bg-orange-50/70 p-5 rounded-3xl border border-orange-200 shadow-xs">
          <span className="text-[11px] text-orange-800 font-bold uppercase tracking-wider block">
            Stock OUT Usage (Kitchen COGS)
          </span>
          <div className="text-2xl font-black text-orange-700 mt-1">
            ₱{totalStockOutUsageCost.toLocaleString()}
          </div>
          <span className="text-[11px] text-orange-600 mt-1 block">
            Calculated from recipe portions
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">
              Low Stock Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {lowStockCount} items
          </div>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Below safety reorder threshold
          </span>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Directly Editable Daily Stock Table
          </button>
          <button
            onClick={() => setActiveTab('movement')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'movement'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Connected In/Out & Loss Logs ({inventoryLogs.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU or ingredient..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Directly Editable Stock Table */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-orange-50/80 border-b border-orange-100 flex items-center justify-between text-xs text-orange-950 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                <strong>Live Inline Editing Mode:</strong> Edit Stock IN, Stock OUT, and Cost directly in the cells below. Changes save instantly and recalculate current balances.
              </span>
            </div>
            <span className="text-[11px] font-bold text-orange-800 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
              Synced with Admin P&L
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5">SKU / Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-center">Unit Cost (₱)</th>
                  <th className="p-3.5 text-center">Beginning</th>
                  <th className="p-3.5 text-center bg-emerald-50/60 text-emerald-800 font-black">
                    EDIT Stock IN (+)
                  </th>
                  <th className="p-3.5 text-center bg-red-50/60 text-red-800 font-black">
                    EDIT Stock OUT (-)
                  </th>
                  <th className="p-3.5 text-center font-black text-gray-900">Current Stock</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Loss / Spoilage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minReorderLevel;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name & SKU */}
                      <td className="p-3.5">
                        <strong className="text-gray-900 block font-black">{item.name}</strong>
                        <span className="text-[10px] font-mono text-gray-400">{item.sku}</span>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-gray-600">{item.category}</td>

                      {/* Editable Unit Cost */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                          <span className="text-gray-400 font-bold">₱</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleInlineChange(item.id, 'unitCost', e.target.value)}
                            className="w-16 text-center text-xs font-bold text-gray-900 bg-transparent focus:outline-hidden"
                          />
                        </div>
                      </td>

                      {/* Editable Beginning Stock */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                          <input
                            type="number"
                            min="0"
                            value={item.beginningStock}
                            onChange={(e) => handleInlineChange(item.id, 'beginningStock', e.target.value)}
                            className="w-14 text-center text-xs font-semibold text-gray-800 bg-transparent focus:outline-hidden"
                          />
                          <span className="text-[10px] text-gray-400 font-medium">{item.unit}</span>
                        </div>
                      </td>

                      {/* DIRECTLY EDITABLE STOCK IN (GREEN) */}
                      <td className="p-3.5 text-center bg-emerald-50/40">
                        <div className="inline-flex items-center gap-1 bg-white border-2 border-emerald-300 rounded-xl px-2.5 py-1 shadow-2xs">
                          <span className="text-emerald-600 font-black">+</span>
                          <input
                            type="number"
                            min="0"
                            value={item.stockIn}
                            onChange={(e) => handleInlineChange(item.id, 'stockIn', e.target.value)}
                            className="w-14 text-center text-xs font-black text-emerald-700 bg-transparent focus:outline-hidden"
                          />
                          <span className="text-[10px] text-emerald-600 font-bold">{item.unit}</span>
                        </div>
                      </td>

                      {/* DIRECTLY EDITABLE STOCK OUT (RED) */}
                      <td className="p-3.5 text-center bg-red-50/40">
                        <div className="inline-flex items-center gap-1 bg-white border-2 border-red-300 rounded-xl px-2.5 py-1 shadow-2xs">
                          <span className="text-red-600 font-black">-</span>
                          <input
                            type="number"
                            min="0"
                            value={item.stockOut}
                            onChange={(e) => handleInlineChange(item.id, 'stockOut', e.target.value)}
                            className="w-14 text-center text-xs font-black text-red-700 bg-transparent focus:outline-hidden"
                          />
                          <span className="text-[10px] text-red-600 font-bold">{item.unit}</span>
                        </div>
                      </td>

                      {/* Computed Current Stock Balance */}
                      <td className="p-3.5 text-center">
                        <div className="font-black text-sm text-gray-900">
                          {item.currentStock} <span className="text-xs text-gray-500 font-normal">{item.unit}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block">
                          Min: {item.minReorderLevel}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            <span>REORDER</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span>OK</span>
                          </span>
                        )}
                      </td>

                      {/* Log Loss / Spoilage Action Button */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSpoilageModalItem(item)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Report Loss / Spoilage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement Audit Logs Tab */}
      {activeTab === 'movement' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Connected Inventory Movement & Loss Audit Log
              </h3>
              <p className="text-[11px] text-gray-500">
                All Stock IN restocks, kitchen usage, and spoilage losses flow directly to Merchant Admin.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500">{inventoryLogs.length} events logged</span>
          </div>

          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {inventoryLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No stock in / stock out movements recorded today yet.
              </div>
            ) : (
              inventoryLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                        log.isLossOrWaste
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : log.type === 'IN'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {log.type === 'IN' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <strong className="text-gray-900 block">{log.itemName}</strong>
                      <span className="text-[11px] text-gray-500">
                        Reason: <strong className={log.isLossOrWaste ? 'text-rose-600 font-bold' : 'text-gray-700'}>{log.reason}</strong> • By {log.performedBy}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        log.isLossOrWaste
                          ? 'text-rose-600'
                          : log.type === 'IN'
                          ? 'text-emerald-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {log.type === 'IN' ? `+${log.quantity}` : `-${log.quantity}`} units
                    </span>
                    {log.costImpact && (
                      <span className={`block text-[10px] font-bold ${log.isLossOrWaste ? 'text-rose-600' : 'text-gray-400'}`}>
                        {log.isLossOrWaste ? `Loss: -₱${log.costImpact.toLocaleString()}` : `₱${log.costImpact.toLocaleString()}`}
                      </span>
                    )}
                    <span className="block text-[10px] text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Record Spoilage / Wastage Loss Modal */}
      {spoilageModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-black text-gray-900">
                Record Spoilage / Wastage Loss: {spoilageModalItem.name}
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Current stock: <strong>{spoilageModalItem.currentStock} {spoilageModalItem.unit}</strong> • Unit Cost: <strong>₱{spoilageModalItem.unitCost}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Quantity Lost / Damaged ({spoilageModalItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={spoilageModalItem.currentStock}
                  value={spoilageQty}
                  onChange={(e) => setSpoilageQty(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
                <span className="text-[11px] text-rose-600 font-bold mt-1 block">
                  Estimated financial loss: -₱{(spoilageQty * spoilageModalItem.unitCost).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Specific Spoilage Reason
                </label>
                <select
                  value={spoilageReason}
                  onChange={(e) => setSpoilageReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option>Spoilage / Expired in Chiller</option>
                  <option>Damaged in Storage / Dropped</option>
                  <option>Overcooked / Burnt Order Mistake</option>
                  <option>Power Outage / Temperature Failure</option>
                  <option>Supplier Defective / Rotten on Arrival</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-[11px] text-rose-900">
              <strong>Merchant Admin Notice:</strong> This entry will deduct from current inventory and immediately record as a direct business loss in the Merchant Admin P&L report.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSpoilageModalItem(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSpoilage}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Loss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-gray-900">Add New Inventory Item</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Fresh Garlic Butter (Tub)"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="kg, pcs, sacks, tubs"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Beginning Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemBeginning}
                    onChange={(e) => setNewItemBeginning(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Unit Cost (PHP)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Minimum Reorder Level</label>
                <input
                  type="number"
                  min="1"
                  value={newItemMinReorder}
                  onChange={(e) => setNewItemMinReorder(parseFloat(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewItem}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
