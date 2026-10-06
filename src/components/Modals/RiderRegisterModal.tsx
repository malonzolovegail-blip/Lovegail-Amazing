import React, { useState } from 'react';
import { X, Bike, CheckCircle2, Shield } from 'lucide-react';
import { Rider } from '../../types';

interface RiderRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterRider: (newRider: Rider) => void;
  totalRidersCount: number;
}

export const RiderRegisterModal: React.FC<RiderRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterRider,
  totalRidersCount,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+63 9');
  const [vehicleType, setVehicleType] = useState<Rider['vehicleType']>('Motorcycle');
  const [plateNumber, setPlateNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRider: Rider = {
      id: `rider-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      vehicleType,
      plateNumber: plateNumber.trim() || 'NEW-REG',
      photoUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=200`,
      isClockedIn: true, // starts clocked in and ready in rotation!
      clockInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rotationIndex: totalRidersCount + 1,
      completedDeliveries: 0,
      totalEarnings: 0,
      totalPlatformFeesPaid: 0,
      rating: 5.0,
    };

    onRegisterRider(newRider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gray-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Register as Rider</h2>
              <p className="text-xs text-gray-400">
                Join the neighborhood 3km rotation dispatch fleet
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Carlos Cruz"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Mobile Contact *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as Rider['vehicleType'])}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option>Motorcycle</option>
                <option>Bicycle</option>
                <option>E-Bike</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Plate / ID Number</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. ABC-5678"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <Shield className="w-3.5 h-3.5 text-orange-600" />
              <span>Rotation Queue Rules</span>
            </div>
            <p>
              Riders are automatically ordered by fair rotation. Deliveries are assigned to the next available clocked-in courier nearest to the 3km merchant pickup point. ₱5 platform fee is accounted per delivered order.
            </p>
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
              Register & Clock In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
