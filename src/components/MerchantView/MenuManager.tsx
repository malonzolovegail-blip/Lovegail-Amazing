import React, { useState, useRef } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Edit,
  Upload,
  Download,
  Image as ImageIcon,
  CheckCircle,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { MenuItem, Store, VariantGroup, VariantOption } from '../../types';
import { exportMenuToExcel, importMenuFromFile } from '../../services/excelService';

interface MenuManagerProps {
  store: Store;
  menuItems: MenuItem[];
  onUpdateMenuItems: (items: MenuItem[]) => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  store,
  menuItems,
  onUpdateMenuItems,
}) => {
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoUploadRef = useRef<HTMLInputElement>(null);

  const storeItems = menuItems.filter((i) => i.storeId === store.id);

  const handleExportMenu = () => {
    exportMenuToExcel(storeItems, store.name);
    setStatusMessage('Menu exported to Excel (.xlsx) successfully!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleImportMenu = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importMenuFromFile(file, store.id);
      onUpdateMenuItems([...menuItems, ...imported]);
      setStatusMessage(`Imported ${imported.length} new dishes to menu!`);
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err) {
      console.error(err);
      setStatusMessage('Error parsing menu file. Please ensure Excel format.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingItem) {
        setEditingItem({ ...editingItem, imageUrl: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: `item-${Date.now()}`,
      storeId: store.id,
      name: '',
      description: '',
      price: 120,
      category: 'Main Dish',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      available: true,
      variantGroups: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateMenuItems(menuItems.filter((i) => i.id !== id));
    setStatusMessage('Dish removed from menu.');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    const updated = menuItems.map((i) =>
      i.id === item.id ? { ...i, available: !i.available } : i
    );
    onUpdateMenuItems(updated);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.name?.trim()) return;

    const exists = menuItems.some((i) => i.id === editingItem.id);
    if (exists) {
      onUpdateMenuItems(
        menuItems.map((i) => (i.id === editingItem.id ? (editingItem as MenuItem) : i))
      );
    } else {
      onUpdateMenuItems([...menuItems, editingItem as MenuItem]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setStatusMessage('Dish saved successfully!');
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Helper to add variant group to editing dish
  const handleAddVariantGroup = () => {
    if (!editingItem) return;
    const newGroup: VariantGroup = {
      id: `vg-${Date.now()}`,
      name: 'Spice Level',
      required: true,
      minSelections: 1,
      maxSelections: 1,
      options: [
        { name: 'Regular', priceDelta: 0 },
        { name: 'Spicy', priceDelta: 10 },
      ],
    };
    setEditingItem({
      ...editingItem,
      variantGroups: [...(editingItem.variantGroups || []), newGroup],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
            <Utensils className="w-4 h-4" />
            <span>Storefront Catalog & Custom Variants</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Menu Management & Food Photo Uploads
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Upload custom food photos, configure customizable recipe options (sizes, add-ons), and import/export via Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportMenu}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Menu Excel</span>
          </button>

          <button
            onClick={handleExportMenu}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Menu Dish</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-4 border border-gray-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Photo & Badge */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-gray-100 mb-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base font-black text-gray-900">{item.name}</h3>
                <span className="text-base font-black text-orange-600">₱{item.price}</span>
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>

              {/* Variant groups summary */}
              {item.variantGroups.length > 0 && (
                <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl mb-3">
                  <span className="font-bold text-gray-800 block mb-0.5">Custom Variant Groups:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.variantGroups.map((g) => (
                      <span key={g.id} className="bg-white border border-gray-200 px-1.5 py-0.5 rounded-md text-[10px]">
                        {g.name} ({g.options.length} options)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleAvailability(item)}
                className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  item.available ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <span>{item.available ? 'Available' : 'Sold Out'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-black text-gray-900">
              {editingItem.id ? 'Edit Menu Dish' : 'Add New Menu Dish'}
            </h3>

            {/* Photo Preview & Upload */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Dish Photo (Upload or URL)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img
                    src={editingItem.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={photoUploadRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoUploadRef.current?.click()}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </button>
                  <input
                    type="text"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    placeholder="Or paste image URL"
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Dish Name</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Sizzling Sisig Pepper Bowl"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price (PHP)</label>
                  <input
                    type="number"
                    value={editingItem.price || 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="e.g. Rice Bowls"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  placeholder="Appetizing description of ingredients, cooking style..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Variant Groups Config */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Customizable Options & Variants
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariantGroup}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    + Add Variant Group
                  </button>
                </div>

                <div className="space-y-2">
                  {editingItem.variantGroups?.map((group, gIdx) => (
                    <div key={gIdx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => {
                            const updatedGroups = [...(editingItem.variantGroups || [])];
                            updatedGroups[gIdx].name = e.target.value;
                            setEditingItem({ ...editingItem, variantGroups: updatedGroups });
                          }}
                          className="font-bold bg-white px-2 py-1 rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedGroups = editingItem.variantGroups?.filter((_, i) => i !== gIdx);
                            setEditingItem({ ...editingItem, variantGroups: updatedGroups });
                          }}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500 flex flex-wrap gap-2">
                        {group.options.map((opt, oIdx) => (
                          <span key={oIdx} className="bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            {opt.name} (+₱{opt.priceDelta})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Save Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
