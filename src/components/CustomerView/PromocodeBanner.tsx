import React, { useState } from 'react';
import { Tag, Sparkles, Copy, Check, Plus, Trash2 } from 'lucide-react';
import { PromoCode, Store } from '../../types';

interface PromocodeBannerProps {
  promos: PromoCode[];
  stores: Store[];
  currentStore?: Store;
  onSelectPromo?: (code: string) => void;
  isMerchantView?: boolean;
  onAddNewPromo?: () => void;
  onDeletePromo?: (id: string) => void;
}

export const PromocodeBanner: React.FC<PromocodeBannerProps> = ({
  promos,
  stores,
  currentStore,
  onSelectPromo,
  isMerchantView = false,
  onAddNewPromo,
  onDeletePromo,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onSelectPromo) onSelectPromo(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // If inside a specific store, show this store's vouchers first + general community vouchers
  const displayedPromos = currentStore
    ? promos.filter((p) => !p.storeId || p.storeId === currentStore.id)
    : promos;

  return (
    <div className="bg-linear-to-r from-[#ff5500] via-[#ff7700] to-[#ff0066] rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-orange-500/15 mb-6">
      {/* Top Banner Header matching user's attached design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/25">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-xs">
                {currentStore
                  ? `${currentStore.name} Deals & Vouchers`
                  : 'Merchant & Community Deals'}
              </h2>
              <span className="text-[11px] bg-white text-orange-600 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                ACTIVE VOUCHERS
              </span>
            </div>
            <p className="text-xs text-orange-100 font-medium mt-0.5">
              Discounts customizable directly by local merchants • Copy code to apply at checkout
            </p>
          </div>
        </div>

        {isMerchantView && onAddNewPromo && (
          <button
            onClick={onAddNewPromo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-gray-900 hover:bg-amber-100 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>+ Create Merchant Voucher</span>
          </button>
        )}
      </div>

      {/* Grid of Voucher Cards (Matching attached screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {displayedPromos.map((promo) => {
          const associatedStore = stores.find((s) => s.id === promo.storeId);
          const isCopied = copiedCode === promo.code;
          const isStoreSpecific = !!promo.storeId;

          return (
            <div
              key={promo.id}
              className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-md transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-black text-xs sm:text-sm bg-white text-gray-900 px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-orange-600" />
                    <span>{promo.code}</span>
                  </span>
                  <span className="text-xs font-black text-amber-200">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `₱${promo.discountValue} OFF`}
                  </span>
                </div>

                <p className="text-xs text-orange-50 font-medium line-clamp-2 mb-3 leading-relaxed">
                  {promo.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] text-orange-100">
                <span className="truncate max-w-[130px] font-semibold">
                  {associatedStore ? associatedStore.name : 'All 3km Stores'}
                </span>

                <div className="flex items-center gap-1.5">
                  {isMerchantView && onDeletePromo && isStoreSpecific && (
                    <button
                      onClick={() => onDeletePromo(promo.id)}
                      title="Delete voucher"
                      className="p-1 hover:bg-red-500/30 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="flex items-center gap-1 bg-white text-gray-900 hover:bg-amber-100 px-3 py-1 rounded-lg text-[11px] font-black transition-colors shadow-xs cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-700" />
                        <span>Apply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
