import React from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from '../context/RouterContext';
import { EmptyState } from '../components/common/EmptyState';
import { VegBadge } from '../components/common/VegBadge';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Store, 
  ArrowRight, 
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

export const CartView: React.FC = () => {
  const { 
    items, 
    shopId, 
    shopName, 
    shopImage, 
    totalItems, 
    subtotal, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCart();
  const { navigate, goBack } = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <EmptyState
          type="cart"
          title="Your cart is empty"
          description="You haven't added any snacks or tea yet. Browse stalls to skip the counter queue."
          actionText="Discover Nearby Stalls"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-5 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (shopId ? navigate(`/shop/${shopId}`) : goBack())}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Add More Items</span>
        </button>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* SHOP BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          {shopImage ? (
            <img
              src={shopImage}
              alt={shopName || 'Shop'}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200/50">
                Counter Ordering
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              {shopName}
            </h2>
          </div>
        </div>

        <button
          onClick={() => shopId && navigate(`/shop/${shopId}`)}
          className="text-xs font-bold text-orange-600 hover:underline flex-shrink-0"
        >
          View Menu
        </button>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Selected Items ({totalItems})
          </span>
          <span className="text-xs text-slate-400 font-medium">Single stall order</span>
        </div>

        {items.map((cartItem) => {
          const itemTotal = cartItem.menuItem.price * cartItem.quantity;
          return (
            <div
              key={cartItem.menuItem.id}
              className="p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <VegBadge isVeg={cartItem.menuItem.isVeg} size="sm" />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {cartItem.menuItem.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ₹{cartItem.menuItem.price} × {cartItem.quantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Stepper */}
                <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-0.5">
                  <button
                    onClick={() => updateQuantity(cartItem.menuItem.id, -1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-700 active:scale-90 transition-all"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-extrabold text-slate-900">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(cartItem.menuItem.id, 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-700 active:scale-90 transition-all"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Total price for item */}
                <span className="font-black text-sm text-slate-900 min-w-[50px] text-right">
                  ₹{itemTotal}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* BILL SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Bill Details
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Item Subtotal</span>
            <span className="font-semibold text-slate-900">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Counter Packing / Platform Fee</span>
            <span className="font-semibold text-emerald-600">FREE (₹0)</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Taxes</span>
            <span className="text-slate-500">Included in stall prices</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              To Pay
            </span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              ₹{subtotal}
            </span>
          </div>

          <button
            id="cart-continue-checkout-btn"
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-sm transition-all shadow-md shadow-orange-600/25"
          >
            <span>Continue to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trust pill */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Direct counter token generation • Skip standing in queues</span>
      </div>
    </div>
  );
};
