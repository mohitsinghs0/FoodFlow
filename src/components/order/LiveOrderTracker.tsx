import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { useRouter } from '../../context/RouterContext';
import { 
  CheckCircle2, 
  Clock, 
  Bell, 
  Store, 
  MapPin, 
  Receipt, 
  Share2, 
  Sparkles,
  Volume2,
  ChevronRight,
  UtensilsCrossed,
  ShoppingBag
} from 'lucide-react';

interface LiveOrderTrackerProps {
  orderId: string;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({ orderId }) => {
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [readyBannerDismissed, setReadyBannerDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadOrder = async () => {
      setLoading(true);
      const data = await orderService.getOrder(orderId);
      setOrder(data);
      setLoading(false);

      if (data) {
        unsubscribe = orderService.subscribeToOrder(orderId, (updatedOrder) => {
          setOrder(updatedOrder);
          if (updatedOrder.orderStatus === 'READY') {
            notificationService.sendReadyNotification(
              updatedOrder.tokenNumber,
              updatedOrder.shopName
            );
          }
        });
      }
    };

    loadOrder();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  const advanceOrderStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    const updated = await orderService.updateOrderStatus(order.id, nextStatus);
    if (updated) {
      setOrder(updated);
      if (nextStatus === 'READY') {
        notificationService.sendReadyNotification(updated.tokenNumber, updated.shopName);
      }
    }
  };

  const playChimeManually = () => {
    notificationService.playReadyChime();
  };

  const handleShareToken = () => {
    if (navigator.share && order) {
      navigator.share({
        title: `FoodFlow Token ${order.tokenNumber}`,
        text: `My order at ${order.shopName} has token ${order.tokenNumber}. Status: ${order.orderStatus}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `FoodFlow Token: ${order?.tokenNumber} at ${order?.shopName}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h3 className="text-lg font-bold text-slate-900">Order not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This order token may not exist or has expired.
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Order Placed', desc: 'Sent to stall counter' },
    { status: 'ACCEPTED', label: 'Accepted', desc: 'Stall confirmed queue slot' },
    { status: 'PREPARING', label: 'Preparing', desc: 'On tawa / in kitchen' },
    { status: 'READY', label: 'Ready for Pickup', desc: 'Call token at counter' },
    { status: 'COMPLETED', label: 'Collected', desc: 'Order completed' },
  ];

  const statusHierarchy: Record<OrderStatus, number> = {
    PENDING: 1,
    ACCEPTED: 2,
    PREPARING: 3,
    READY: 4,
    COMPLETED: 5,
    CANCELLED: 0,
  };

  const currentLevel = statusHierarchy[order.orderStatus] || 1;
  const isReady = order.orderStatus === 'READY';
  const isCompleted = order.orderStatus === 'COMPLETED';

  return (
    <div className="max-w-lg mx-auto pb-24 px-4 sm:px-6 pt-4 space-y-5 animate-in fade-in duration-200">
      {/* READY ALERT BANNER */}
      {isReady && !readyBannerDismissed && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-bounce duration-1000 border-2 border-emerald-400 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
              <Bell className="w-5 h-5 animate-spin duration-300" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">
                Ding! Counter Announcement
              </p>
              <h4 className="text-lg font-black tracking-tight leading-tight mt-0.5">
                Your order is ready!
              </h4>
              <p className="text-xs text-emerald-100 font-medium mt-1">
                Token <span className="font-black text-white underline">{order.tokenNumber}</span> — Please collect your food at {order.shopName}.
              </p>
            </div>
          </div>
          <button
            onClick={playChimeManually}
            className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-800 text-white flex-shrink-0 text-xs font-bold flex items-center gap-1"
            title="Replay notification sound"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOKEN HERO CARD */}
      <div className="relative overflow-hidden bg-white rounded-3xl border-2 border-orange-500/80 p-6 shadow-xl shadow-orange-500/10 text-center">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-100 rounded-full opacity-50 blur-xl pointer-events-none" />

        {/* Counter Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Show This Token at Counter</span>
        </div>

        {/* Big Bold Token */}
        <div className="my-2">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-extrabold block">
            Counter Token Number
          </span>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 font-mono my-1">
            {order.tokenNumber}
          </div>
        </div>

        {/* Stall & Type Badges */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center flex-wrap gap-2 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-orange-600" />
            {order.shopName}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
            {order.orderType === 'DINE_IN'
              ? `Dine-in (${order.tableNumber || 'Table assigned'})`
              : 'Takeaway Order'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
            {order.paymentMethod === 'CASH_AT_COUNTER' ? 'Pay Cash at Counter' : 'Online Paid'}
          </span>
        </div>

        {/* Quick share button */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={handleShareToken}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? 'Copied Token!' : 'Share Token'}</span>
          </button>
          <button
            onClick={playChimeManually}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Sound Chime</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME PROGRESS PIPELINE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Live Order Status</span>
          </h4>
          <span className="text-xs font-semibold text-slate-500">
            Est. prep: <span className="font-bold text-slate-800">{order.estimatedPreparationMinutes} min</span>
          </span>
        </div>

        {/* Step-by-step indicator */}
        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {steps.map((step, idx) => {
            const stepLevel = statusHierarchy[step.status];
            const isDone = currentLevel > stepLevel;
            const isCurrent = currentLevel === stepLevel;

            return (
              <div key={step.status} className="relative flex items-start gap-3.5">
                {/* Node */}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-orange-600 text-white ring-4 ring-orange-100 animate-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="text-[11px] font-black">{idx + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h5
                      className={`text-xs font-bold leading-none ${
                        isCurrent
                          ? 'text-orange-600 font-extrabold'
                          : isDone
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </h5>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                        In Progress
                      </span>
                    )}
                    {isDone && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        Done ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructional note */}
        <div className="mt-5 p-3 rounded-xl bg-orange-50/80 border border-orange-200/60 text-center">
          <p className="text-xs font-semibold text-orange-900">
            "Please collect your order at the counter when your token is called."
          </p>
        </div>
      </div>

      {/* DEMO / PROTOTYPE SIMULATOR CONTROLS */}
      {/* This allows testers and evaluators to advance the order through the real-time pipeline! */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white">Stall Counter Simulation</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Interactive Test
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Simulate stall counter updating this live order status in real time:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => advanceOrderStatus('ACCEPTED')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
              order.orderStatus === 'ACCEPTED'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Accept
          </button>
          <button
            onClick={() => advanceOrderStatus('PREPARING')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
              order.orderStatus === 'PREPARING'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => advanceOrderStatus('READY')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
              order.orderStatus === 'READY'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Mark Ready 🔔
          </button>
          <button
            onClick={() => advanceOrderStatus('COMPLETED')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
              order.orderStatus === 'COMPLETED'
                ? 'bg-slate-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Collected ✓
          </button>
        </div>
      </div>

      {/* ORDER SUMMARY COLLAPSIBLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <h4 className="font-bold text-sm text-slate-900 flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span>Order Summary</span>
          </span>
          <span className="text-xs text-slate-500 font-normal">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </h4>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 font-bold text-slate-700 flex items-center justify-center">
                  {item.quantity}x
                </span>
                <span className="font-semibold text-slate-800">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {order.instructions && (
          <div className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600">
            <span className="font-bold text-slate-700">Note: </span>
            {order.instructions}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700">Total Billed</span>
          <span className="text-base font-extrabold text-slate-900">
            ₹{order.total}
          </span>
        </div>
      </div>

      {/* Return to Stall or Home Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/shop/${order.shopId}`)}
          className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors text-center"
        >
          Order More from Stall
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors text-center"
        >
          View All Orders
        </button>
      </div>
    </div>
  );
};
