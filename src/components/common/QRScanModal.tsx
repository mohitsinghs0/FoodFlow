import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { MOCK_SHOPS } from '../../data/mockData';
import { X, QrCode, ArrowRight, Sparkles, Store } from 'lucide-react';

interface QRScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScanModal: React.FC<QRScanModalProps> = ({ isOpen, onClose }) => {
  const { navigate } = useRouter();
  const [selectedTable, setSelectedTable] = useState('');

  if (!isOpen) return null;

  const handleScanShop = (shopSlug: string, tableNum?: string) => {
    onClose();
    if (tableNum) {
      sessionStorage.setItem('foodflow_prefill_table', tableNum);
    } else {
      sessionStorage.removeItem('foodflow_prefill_table');
    }
    navigate(`/shop/${shopSlug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                Stall QR Simulator
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simulate scanning a counter or table QR code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Graphic */}
        <div className="py-4">
          <div className="relative aspect-video rounded-xl bg-slate-950 flex flex-col items-center justify-center text-center p-4 overflow-hidden border border-slate-800">
            {/* Viewfinder Corners */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-orange-500 rounded-tl-sm" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-orange-500 rounded-tr-sm" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-orange-500 rounded-bl-sm" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-orange-500 rounded-br-sm" />

            <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mb-2 animate-pulse">
              <QrCode className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">
              Simulating Camera QR Scanner
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
              Direct link: <code className="text-orange-400 font-mono">foodflow.app/shop/[shopId]</code>
            </p>
          </div>
        </div>

        {/* Stall Selection List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Tap a Stall to Scan Instantly
          </p>

          {MOCK_SHOPS.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleScanShop(shop.slug)}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 truncate">
                      {shop.name}
                    </h4>
                    {shop.isOpen ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {shop.stallType} • {shop.preparationTimeMinutes} min prep
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 group-hover:text-orange-600 pl-2">
                <span className="text-[11px] font-semibold hidden sm:inline">Scan Menu</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}

          {/* Table Specific Dine-in QR Simulator */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleScanShop('college-canteen', 'Table 14')}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Scan College Canteen Table #14 QR
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pre-fills Dine-in Table 14 for instant ordering
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
