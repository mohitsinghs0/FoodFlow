import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { 
  ReceiptText, 
  Clock, 
  Store, 
  ChevronRight, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  ShoppingBag
} from 'lucide-react';

export const OrdersHistoryView: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const data = await orderService.getCustomerOrders(currentUser?.id);
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [currentUser?.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded-xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <EmptyState
          type="orders"
          title="No orders yet"
          description="Your counter tokens and live order status will show up here as soon as you order."
          actionText="Explore Food Stalls"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track active tokens & review past counter orders
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const isActive =
            order.orderStatus === 'PENDING' ||
            order.orderStatus === 'ACCEPTED' ||
            order.orderStatus === 'PREPARING' ||
            order.orderStatus === 'READY';

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer group ${
                isActive
                  ? 'border-orange-300 ring-2 ring-orange-500/15 shadow-md shadow-orange-500/5'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Card top */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black leading-none flex-shrink-0 ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-wider opacity-80">
                      Token
                    </span>
                    <span className="text-base font-mono mt-0.5">
                      {order.tokenNumber}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors">
                      {order.shopName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{order.orderType === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}</span>
                      {order.tableNumber && <span>({order.tableNumber})</span>}
                      <span>•</span>
                      <span>₹{order.total}</span>
                      <span>•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg ${
                      order.orderStatus === 'READY'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : order.orderStatus === 'PREPARING'
                        ? 'bg-orange-100 text-orange-800'
                        : order.orderStatus === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.orderStatus === 'READY' ? '🔔 Ready for Pickup' : order.orderStatus}
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Items preview */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="truncate max-w-[220px] sm:max-w-xs">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </span>

                <div className="flex items-center gap-1 text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                  <span>{isActive ? 'Track Live' : 'View Details'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
