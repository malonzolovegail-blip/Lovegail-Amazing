import React, { useState } from 'react';
import { X, Store as StoreIcon, MapPin, Upload, DollarSign, CheckCircle2 } from 'lucide-react';
import { Store } from '../../types';

interface StoreRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterStore: (newStore: Store) => void;
}

export const StoreRegisterModal: React.FC<StoreRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterStore,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<Store['category']>('Food');
  const [distanceKm, setDistanceKm] = useState(1.1);
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(35);
  const [perKmDeliveryFee, setPerKmDeliveryFee] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(99);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || 'Neighborhood favorite kitchen',
      category,
      isOpen: true,
      distanceKm,
      address: address.trim() || 'Local neighborhood market area',
      contactNumber: contactNumber.trim() || '+63 900 123 4567',
      rating: 5.0,
      reviewCount: 1,
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
      bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200',
      themeColor: '#ea580c',
      baseDeliveryFee,
      perKmDeliveryFee,
      minOrderAmount,
      managerPasswordHash: 'manager123',
      ownerPasswordHash: 'owner123',
      activePromos: [],
    };

    onRegisterStore(newStore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <StoreIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Register Merchant Store</h2>
              <p className="text-xs text-orange-100">
                Join the 3-km hyperlocal delivery network
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kuya J Kitchen & Grill"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Store['category'])}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
            >
              <option>Food</option>
              <option>Beverages</option>
              <option>Grocery</option>
              <option>Bakery</option>
              <option>Snacks</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Distance from Center (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="3.0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1.0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Max 3.0 km radius</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Base Delivery Fee</label>
              <input
                type="number"
                value={baseDeliveryFee}
                onChange={(e) => setBaseDeliveryFee(parseInt(e.target.value) || 35)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Store Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building, street, barangay"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
          </div>

          <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-orange-900 text-[11px]">
            <strong>Security Notice:</strong> Default manager passkey will be set to <code>manager123</code>. Only the store Owner passkey (<code>owner123</code>) can modify it later.
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black transition-colors shadow-xs cursor-pointer"
            >
              Register & Launch Store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
