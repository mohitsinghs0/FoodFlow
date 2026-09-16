import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useCart } from '../../context/CartContext';
import { QrCode, MapPin, ShoppingBag, Search, ChevronRight, Heart } from 'lucide-react';

interface HeaderProps {
  onOpenQRScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQRScanner }) => {
  const { route, navigate } = useRouter();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo & Slogan */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-link"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="tracking-tighter">FF</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  Food<span className="text-orange-600">Flow</span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/60">
                  Counter Orders
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block leading-tight font-medium mt-0.5">
                Order. Skip the Queue. Collect.
              </p>
            </div>
          </button>
        </div>

        {/* Location selector / Counter info */}
        <button
          id="location-selector-btn"
          onClick={() => navigate('/shops')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors text-xs font-semibold text-slate-700 border border-slate-200/70"
          title="Current Ordering Zone"
        >
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span className="truncate max-w-[160px]">Mithibai College, Vile Parle</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Scan Shop QR */}
          <button
            id="scan-stall-qr-btn"
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100/80 active:scale-95 text-orange-700 border border-orange-200 text-xs font-bold transition-all shadow-xs"
            title="Scan Shop or Table QR Code"
          >
            <QrCode className="w-4 h-4 text-orange-600" />
            <span className="hidden xs:inline font-semibold">Scan Stall QR</span>
            <span className="xs:hidden font-semibold">Scan</span>
          </button>

          {/* Search Shortcut */}
          <button
            id="quick-search-btn"
            onClick={() => navigate('/search')}
            className={`p-2 rounded-xl border text-slate-600 hover:text-slate-900 transition-colors ${
              route.name === 'search'
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
            aria-label="Search food or shops"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Saved Shops */}
          <button
            id="quick-saved-btn"
            onClick={() => navigate('/saved')}
            className={`hidden sm:flex p-2 rounded-xl border text-slate-600 hover:text-slate-900 transition-colors ${
              route.name === 'saved'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
            aria-label="Saved shops"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Cart button */}
          <button
            id="quick-cart-btn"
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 transition-all"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
