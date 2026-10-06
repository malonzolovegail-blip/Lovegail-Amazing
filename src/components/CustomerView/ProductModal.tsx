import React, { useState } from 'react';
import { X, Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { MenuItem, CartItem, CartSelectedVariant, VariantGroup, VariantOption } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ProductModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const { isDark } = useTheme();
  if (!isOpen || !item) return null;

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  // Track selected options per group: { [groupId]: VariantOption[] }
  const [selectedGroupOptions, setSelectedGroupOptions] = useState<Record<string, VariantOption[]>>(() => {
    const initial: Record<string, VariantOption[]> = {};
    item.variantGroups.forEach((group) => {
      if (group.required && group.options.length > 0) {
        // default select first option for required groups
        initial[group.id] = [group.options[0]];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Toggle or select option in a group
  const handleOptionToggle = (group: VariantGroup, option: VariantOption) => {
    setValidationError(null);
    setSelectedGroupOptions((prev) => {
      const current = prev[group.id] || [];

      if (group.maxSelections === 1) {
        // Radio / single selection behavior
        return { ...prev, [group.id]: [option] };
      } else {
        // Multi-select / checkbox behavior
        const exists = current.some((o) => o.name === option.name);
        if (exists) {
          return {
            ...prev,
            [group.id]: current.filter((o) => o.name !== option.name),
          };
        } else {
          if (current.length >= group.maxSelections) {
            return prev; // reached maximum selections
          }
          return {
            ...prev,
            [group.id]: [...current, option],
          };
        }
      }
    });
  };

  // Calculate price delta from selected variants
  const variantsDelta = Object.values(selectedGroupOptions)
    .flat()
    .reduce((sum, opt) => sum + opt.priceDelta, 0);

  const unitPrice = item.price + variantsDelta;
  const totalPrice = unitPrice * quantity;

  const handleConfirmAddToCart = () => {
    // Validate required groups
    for (const group of item.variantGroups) {
      const selections = selectedGroupOptions[group.id] || [];
      if (group.required && selections.length < (group.minSelections || 1)) {
        setValidationError(`Please select an option for "${group.name}".`);
        return;
      }
    }

    const flatSelectedVariants: CartSelectedVariant[] = [];
    item.variantGroups.forEach((group) => {
      const options = selectedGroupOptions[group.id] || [];
      options.forEach((opt) => {
        flatSelectedVariants.push({
          groupName: group.name,
          optionName: opt.name,
          priceDelta: opt.priceDelta,
        });
      });
    });

    const newCartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      menuItem: item,
      quantity,
      selectedVariants: flatSelectedVariants,
      specialInstructions: specialInstructions.trim() || undefined,
      unitPrice,
      totalPrice,
    };

    onAddToCart(newCartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] transition-colors ${
          isDark
            ? 'bg-[#0E1422] text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header Image with Close Button */}
        <div className="relative h-52 sm:h-60 w-full bg-slate-950 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md inline-block mb-1.5 shadow-xs">
              {item.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-xs">
              {item.name}
            </h2>
            <div className="text-lg font-black text-amber-300 mt-0.5 font-mono">
              ₱{item.price}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {item.description}
          </p>

          {/* Validation Banner if missing required variant */}
          {validationError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customizable Variant Groups */}
          {item.variantGroups.map((group) => {
            const currentSelected = selectedGroupOptions[group.id] || [];

            return (
              <div
                key={group.id}
                className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <span>{group.name}</span>
                      {group.required ? (
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                          Required
                        </span>
                      ) : (
                        <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Optional (Up to {group.maxSelections})
                        </span>
                      )}
                    </h3>
                  </div>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {group.maxSelections === 1 ? 'Choose 1' : `Choose up to ${group.maxSelections}`}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isSelected = currentSelected.some((o) => o.name === option.name);

                    return (
                      <div
                        key={option.name}
                        onClick={() => handleOptionToggle(group, option)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'border-white bg-slate-800 text-white'
                              : 'border-slate-900 bg-slate-100 text-slate-900'
                            : isDark
                            ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-${
                              group.maxSelections === 1 ? 'full' : 'lg'
                            } border flex items-center justify-center transition-colors ${
                              isSelected
                                ? isDark
                                  ? 'bg-white border-white text-slate-950'
                                  : 'bg-slate-950 border-slate-950 text-white'
                                : isDark
                                ? 'border-slate-700 bg-slate-800'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs sm:text-sm font-semibold ${
                              isSelected ? 'font-bold' : ''
                            }`}
                          >
                            {option.name}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-mono font-bold ${
                            option.priceDelta > 0
                              ? isDark
                                ? 'text-amber-300'
                                : 'text-slate-900'
                              : isDark
                              ? 'text-slate-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {option.priceDelta > 0 ? `+₱${option.priceDelta}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Kitchen / Special Cooking Instructions */}
          <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <label className="block text-xs font-bold mb-2">
              Kitchen Instructions / Cooking Preferences (Optional)
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less oil, extra calamansi, sauce separated, utensils needed..."
              className={`w-full p-3 text-xs rounded-xl focus:outline-hidden border transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Modal Footer: Quantity Selector & Add to Cart Button */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between gap-4 shrink-0 transition-colors ${
            isDark
              ? 'bg-[#0B0F19] border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Quantity Controls */}
          <div
            className={`flex items-center rounded-2xl p-1 border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
            }`}
          >
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 disabled:opacity-30'
                  : 'hover:bg-slate-100 disabled:opacity-30'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-mono font-black">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit */}
          <button
            onClick={handleConfirmAddToCart}
            className={`flex-1 py-3 px-6 rounded-2xl font-black text-sm flex items-center justify-between shadow-lg transition-all cursor-pointer ${
              isDark
                ? 'bg-white hover:bg-slate-200 text-slate-950 shadow-white/10'
                : 'bg-slate-950 hover:bg-slate-800 text-white shadow-slate-950/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </div>
            <span className="font-mono">₱{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
