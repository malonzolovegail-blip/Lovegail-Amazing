import * as XLSX from 'xlsx';
import { InventoryItem, MenuItem, Order } from '../types';

/**
 * Export Inventory items to Excel (.xlsx)
 */
export function exportInventoryToExcel(items: InventoryItem[], storeName: string) {
  const rows = items.map((item) => ({
    SKU: item.sku,
    'Item Name': item.name,
    Category: item.category,
    Unit: item.unit,
    'Beginning Stock': item.beginningStock,
    'Stock In': item.stockIn,
    'Stock Out': item.stockOut,
    'Current Stock': item.currentStock,
    'Min Reorder Level': item.minReorderLevel,
    'Unit Cost (PHP)': item.unitCost,
    'Total Value (PHP)': item.currentStock * item.unitCost,
    'Last Updated': new Date(item.lastUpdated).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Inventory');

  const fileName = `${storeName.replace(/\s+/g, '_')}_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Import Inventory from file (Excel or CSV)
 */
export async function importInventoryFromFile(file: File): Promise<Partial<InventoryItem>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const items: Partial<InventoryItem>[] = rawJson.map((row, idx) => ({
          sku: String(row['SKU'] || row['sku'] || `SKU-${1000 + idx}`),
          name: String(row['Item Name'] || row['name'] || row['Item'] || `Item ${idx + 1}`),
          category: String(row['Category'] || row['category'] || 'General Ingredients'),
          unit: String(row['Unit'] || row['unit'] || 'pcs'),
          beginningStock: Number(row['Beginning Stock'] || row['beginningStock'] || 0),
          stockIn: Number(row['Stock In'] || row['stockIn'] || 0),
          stockOut: Number(row['Stock Out'] || row['stockOut'] || 0),
          currentStock: Number(row['Current Stock'] || row['currentStock'] || row['Stock'] || 0),
          minReorderLevel: Number(row['Min Reorder Level'] || row['minReorderLevel'] || 10),
          unitCost: Number(row['Unit Cost (PHP)'] || row['unitCost'] || row['Cost'] || 0),
          lastUpdated: new Date().toISOString(),
        }));

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export Menu items to Excel (.xlsx)
 */
export function exportMenuToExcel(items: MenuItem[], storeName: string) {
  const rows = items.map((item) => ({
    ID: item.id,
    Name: item.name,
    Category: item.category,
    'Price (PHP)': item.price,
    Description: item.description,
    Available: item.available ? 'YES' : 'NO',
    'Variant Groups': item.variantGroups.map((g) => `${g.name} (${g.options.map(o => o.name).join(', ')})`).join(' | '),
    'Image URL': item.imageUrl,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Menu Catalog');

  const fileName = `${storeName.replace(/\s+/g, '_')}_Menu_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Import Menu items from file
 */
export async function importMenuFromFile(file: File, storeId: string): Promise<MenuItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

        const items: MenuItem[] = rawJson.map((row, idx) => ({
          id: String(row['ID'] || `menu-${Date.now()}-${idx}`),
          storeId,
          name: String(row['Name'] || row['Item Name'] || `Dish ${idx + 1}`),
          category: String(row['Category'] || 'Main Dish'),
          price: Number(row['Price (PHP)'] || row['Price'] || 99),
          description: String(row['Description'] || ''),
          imageUrl: String(row['Image URL'] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'),
          available: String(row['Available']).toUpperCase() !== 'NO',
          variantGroups: [],
        }));

        resolve(items);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export Sales & Fee Reports
 */
export function exportOrdersReport(orders: Order[], storeName: string) {
  const rows = orders.map((o) => ({
    'Order ID': o.id,
    Date: new Date(o.createdAt).toLocaleString(),
    Type: o.type,
    Customer: o.customerName,
    Phone: o.customerPhone,
    'Distance (km)': o.distanceKm,
    Items: o.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join('; '),
    'Subtotal (PHP)': o.subtotal,
    'Delivery Fee (PHP)': o.deliveryFee,
    'Promo Discount (PHP)': o.promoDiscount,
    'Platform Fee (PHP)': o.platformFee, // 5 pesos
    'Grand Total (PHP)': o.grandTotal,
    'Payment Method': o.paymentMethod,
    Status: o.status,
    Rider: o.assignedRiderName || 'Unassigned',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

  const fileName = `${storeName.replace(/\s+/g, '_')}_Sales_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
