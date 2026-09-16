import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  ArrowLeft, 
  Clock, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Printer, 
  IndianRupee, 
  Check, 
  AlertCircle,
  Share2
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { Order, OrderStatus } from '../../types';

export const BusinessOrderDetailView: React.FC = () => {
  const { route, navigate } = useRouter();
  const orderId = route.params.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      orderService.getOrder(orderId).then((o) => {
        setOrder(o);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) {
    return (
      <BusinessLayout showBackButton onBack={() => navigate('/business/orders')}>
        <div className="p-8 text-center text-xs text-slate-400">Loading order #{orderId}...</div>
      </BusinessLayout>
    );
  }

  if (!order) {
    return (
      <BusinessLayout showBackButton onBack={() => navigate('/business/orders')}>
        <div className="p-8 text-center space-y-3">
          <p className="font-bold text-sm text-slate-800">Order Not Found</p>
          <button
            onClick={() => navigate('/business/orders')}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
          >
            Back to Orders
          </button>
        </div>
      </BusinessLayout>
    );
  }

  const handleNextStatus = async () => {
    setActionLoading(true);
    let updated: Order | null = null;
    try {
      if (order.orderStatus === 'PENDING') {
        updated = await orderService.acceptOrder(order.id);
      } else if (order.orderStatus === 'ACCEPTED') {
        updated = await orderService.startPreparing(order.id);
      } else if (order.orderStatus === 'PREPARING') {
        updated = await orderService.markReady(order.id);
        notificationService.playReadyChime();
        notificationService.sendReadyNotification(order.tokenNumber, order.shopName);
      } else if (order.orderStatus === 'READY') {
        updated = await orderService.completeOrder(order.id);
      }

      if (updated) {
        setOrder(updated);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCashPaid = async () => {
    const updated = await orderService.markPaymentPaid(order.id);
    if (updated) setOrder(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <BusinessLayout 
      showBackButton 
      onBack={() => navigate('/business/orders')}
      title={`Token ${order.tokenNumber}`}
      subtitle={`${order.orderType === 'DINE_IN' ? (order.tableNumber || 'Dine-In') : 'Takeaway'} • ${order.customerName}`}
    >
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Token and Status Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black ${
              order.orderStatus === 'READY'
                ? 'bg-emerald-600 text-white'
                : order.orderStatus === 'PENDING'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-white'
            }`}>
              <span className="text-xs uppercase font-bold tracking-wider opacity-80">TOKEN</span>
              <span className="text-3xl tracking-tight">{order.tokenNumber}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                  order.orderType === 'DINE_IN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {order.orderType === 'DINE_IN' ? `Dine In • ${order.tableNumber || 'Table'}` : 'Takeaway'}
                </span>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {order.orderStatus}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{order.customerName}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{order.customerPhone}</span>
                <span>•</span>
                <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print KOT</span>
            </button>

            {order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
              <button
                onClick={handleNextStatus}
                disabled={actionLoading}
                className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                {order.orderStatus === 'PENDING' && 'Accept Order'}
                {order.orderStatus === 'ACCEPTED' && 'Start Cooking'}
                {order.orderStatus === 'PREPARING' && 'Mark Ready for Pickup'}
                {order.orderStatus === 'READY' && 'Complete Order'}
              </button>
            )}
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Order Items</h3>
          
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
                    item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  </span>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      <span className="text-orange-600 mr-2">{item.quantity}×</span>
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500">₹{item.price} each</div>
                  </div>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {order.instructions && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Customer Cooking Note: </span>
                <span>{order.instructions}</span>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-1">
              <span>Grand Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Payment Reconciliation Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                {order.paymentMethod === 'PAY_ONLINE' ? 'Online Payment (UPI/Card)' : 'Cash at Counter'}
              </div>
              <div className="text-xs text-slate-500">
                Status: <span className="font-bold">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

          {order.paymentStatus !== 'PAID' ? (
            <button
              onClick={handleCashPaid}
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
            >
              Collect Cash ₹{order.total}
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Payment Received
            </span>
          )}
        </div>

        {/* Order Lifecycle Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Order Timeline</h3>
          <div className="space-y-3 pl-2 border-l-2 border-slate-200 text-xs">
            <div className="relative pl-4">
              <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="font-bold text-slate-800">Order Placed by Customer</div>
              <div className="text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</div>
            </div>

            {order.readyAt && (
              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <div className="font-bold text-slate-800">Marked Ready for Pickup</div>
                <div className="text-slate-400">{new Date(order.readyAt).toLocaleTimeString()}</div>
              </div>
            )}

            {order.completedAt && (
              <div className="relative pl-4">
                <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                <div className="font-bold text-slate-800">Handed Over & Completed</div>
                <div className="text-slate-400">{new Date(order.completedAt).toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};
