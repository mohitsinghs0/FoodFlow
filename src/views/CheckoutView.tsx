import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from '../context/RouterContext';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';
import { paymentService } from '../services/paymentService';
import { OrderType, PaymentMethod } from '../types';
import { 
  ArrowLeft, 
  UtensilsCrossed, 
  ShoppingBag, 
  Banknote, 
  CreditCard, 
  Sparkles, 
  Check, 
  Info,
  Store,
  Clock
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { items, shopId, shopName, shopImage, subtotal, clearCart } = useCart();
  const { navigate, goBack } = useRouter();

  const [orderType, setOrderType] = useState<OrderType>('TAKEAWAY');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_AT_COUNTER');
  const [customerName, setCustomerName] = useState('Mohit');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if a table was pre-filled from Table QR scan
  useEffect(() => {
    const prefill = sessionStorage.getItem('foodflow_prefill_table');
    if (prefill) {
      setOrderType('DINE_IN');
      setTableNumber(prefill);
    }
  }, []);

  // Preload customer profile info if saved
  useEffect(() => {
    customerService.getProfile().then((profile) => {
      if (profile.name) setCustomerName(profile.name);
      if (profile.phone) setCustomerPhone(profile.phone.replace(/[^0-9]/g, ''));
    });
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <h3 className="text-base font-bold text-slate-900">Your cart is empty</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Add some items before heading to checkout.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
        >
          Browse Stalls
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setErrorMsg('Please specify your table or seat number for Dine-in.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Payment handshake
      const paymentRes = await paymentService.createPaymentSession(
        'temp-order',
        subtotal,
        paymentMethod
      );

      // 2. Create order record
      const newOrder = await orderService.createOrder({
        shopId: shopId || 'unknown-stall',
        shopName: shopName || 'Local Counter',
        shopImage: shopImage || undefined,
        shopLocation: 'Local Street Food Counter',
        customerName: customerName.trim() || 'Guest Customer',
        customerPhone: customerPhone.trim() || '+91 98765 00000',
        orderType,
        tableNumber: orderType === 'DINE_IN' ? tableNumber.trim() : undefined,
        paymentMethod,
        items: items.map((i) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
          isVeg: i.menuItem.isVeg,
        })),
        subtotal,
        total: subtotal,
        estimatedPreparationMinutes: '8–12',
        instructions: cookingInstructions.trim() || undefined,
      });

      // 3. Clear cart and navigate directly to live order tracking page
      clearCart();
      sessionStorage.removeItem('foodflow_prefill_table');
      navigate(`/order/${newOrder.id}`);
    } catch {
      setErrorMsg('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-5 animate-in fade-in duration-200">
      {/* Top back */}
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ordering at <span className="font-bold text-slate-800">{shopName}</span>
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
          {items.length}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-shake">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: ORDER TYPE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            1. Order Type
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">No delivery charges</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Takeaway Option */}
          <button
            id="order-type-takeaway"
            type="button"
            onClick={() => setOrderType('TAKEAWAY')}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              orderType === 'TAKEAWAY'
                ? 'border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <ShoppingBag
                className={`w-5 h-5 ${
                  orderType === 'TAKEAWAY' ? 'text-orange-600' : 'text-slate-500'
                }`}
              />
              {orderType === 'TAKEAWAY' && (
                <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-slate-900">Takeaway</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pack & collect from counter
            </p>
          </button>

          {/* Dine-in Option */}
          <button
            id="order-type-dine-in"
            type="button"
            onClick={() => setOrderType('DINE_IN')}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              orderType === 'DINE_IN'
                ? 'border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <UtensilsCrossed
                className={`w-5 h-5 ${
                  orderType === 'DINE_IN' ? 'text-orange-600' : 'text-slate-500'
                }`}
              />
              {orderType === 'DINE_IN' && (
                <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-slate-900">Dine-in</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Eat at stall bench / table
            </p>
          </button>
        </div>

        {/* Dine-in Table Identifier input */}
        {orderType === 'DINE_IN' && (
          <div className="pt-2 animate-in fade-in duration-150">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Table / Seat Number:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="table-number-input"
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. Table 12, Bench 3, or Front Counter"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              {/* Quick pills */}
              <button
                type="button"
                onClick={() => setTableNumber('Table 12')}
                className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
              >
                Table 12
              </button>
              <button
                type="button"
                onClick={() => setTableNumber('Counter')}
                className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
              >
                Standing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PAYMENT METHOD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          2. Payment Method
        </h3>

        <div className="space-y-2.5">
          {/* Cash at Counter */}
          <label
            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              paymentMethod === 'CASH_AT_COUNTER'
                ? 'border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="CASH_AT_COUNTER"
              checked={paymentMethod === 'CASH_AT_COUNTER'}
              onChange={() => setPaymentMethod('CASH_AT_COUNTER')}
              className="mt-0.5 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Cash at Counter
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Most Popular
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                "Pay at the counter when collecting your order."
              </p>
            </div>
          </label>

          {/* Pay Online */}
          <label
            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              paymentMethod === 'PAY_ONLINE'
                ? 'border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="PAY_ONLINE"
              checked={paymentMethod === 'PAY_ONLINE'}
              onChange={() => setPaymentMethod('PAY_ONLINE')}
              className="mt-0.5 text-orange-600 focus:ring-orange-500"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Pay Online (UPI / Card / NetBanking)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                "Pay securely online."
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* SECTION 3: TOKEN CALLOUT DETAILS (Simple Guest Friendly) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            3. Token Details
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            For counter announcement
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Your Name
            </label>
            <input
              id="customer-name-input"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Mohit"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Phone Number (For SMS / Token)
            </label>
            <input
              id="customer-phone-input"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Special Stall Instructions (Optional)
          </label>
          <input
            id="cooking-instructions-input"
            type="text"
            value={cookingInstructions}
            onChange={(e) => setCookingInstructions(e.target.value)}
            placeholder="e.g. Extra spicy thecha, less butter, no onions..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* SECTION 4: ORDER SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          4. Order Summary
        </h3>

        <div className="divide-y divide-slate-100">
          {items.map((cartItem) => (
            <div
              key={cartItem.menuItem.id}
              className="py-2 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  {cartItem.quantity}x
                </span>
                <span className="font-semibold text-slate-800">
                  {cartItem.menuItem.name}
                </span>
              </div>
              <span className="font-bold text-slate-900">
                ₹{cartItem.menuItem.price * cartItem.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Total Payable</span>
          <span className="text-lg font-black text-slate-900">₹{subtotal}</span>
        </div>
      </div>

      {/* PLACE ORDER BUTTON */}
      <div className="pt-2">
        <button
          id="place-order-submit-btn"
          disabled={isSubmitting}
          onClick={handlePlaceOrder}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-slate-400 cursor-wait'
              : 'bg-orange-600 hover:bg-orange-700 active:scale-98 shadow-orange-600/30'
          }`}
        >
          {isSubmitting ? (
            <span>Generating Counter Token...</span>
          ) : (
            <>
              <span>Place Order • ₹{subtotal}</span>
              <Sparkles className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-500 mt-2.5">
          By placing your order, your token is generated immediately and placed in the stall queue.
        </p>
      </div>
    </div>
  );
};
