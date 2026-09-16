import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { OrderCard } from '../../components/business/OrderCard';
import { RushModeView } from '../../components/business/RushModeView';
import { 
  Search, 
  Filter, 
  Zap, 
  RefreshCw, 
  ShoppingBag, 
  Flame, 
  CheckCircle2, 
  Clock, 
  X,
  Plus
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { orderRealtimeService } from '../../services/orderRealtimeService';
import { Order, OrderStatus } from '../../types';

export const BusinessOrdersView: React.FC = () => {
  const { route, navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TAKEAWAY' | 'DINE_IN'>('ALL');
  const [isRushModeOpen, setIsRushModeOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Check URL query parameters for initial filter/rush mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('mode=rush')) {
        setIsRushModeOpen(true);
      }
      if (hash.includes('filter=PENDING')) setStatusFilter('PENDING');
      else if (hash.includes('filter=PREPARING')) setStatusFilter('PREPARING');
      else if (hash.includes('filter=READY')) setStatusFilter('READY');
      else if (hash.includes('filter=COMPLETED')) setStatusFilter('COMPLETED');
    }
  }, []);

  const loadOrders = async () => {
    const all = await orderService.getShopOrders('sharma-vada-pav');
    setOrders(all);
  };

  useEffect(() => {
    loadOrders();
    const unsub = orderRealtimeService.subscribeToShop('sharma-vada-pav', setOrders);
    return () => unsub();
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await orderRealtimeService.simulateIncomingOrder('sharma-vada-pav');
      await loadOrders();
    } finally {
      setIsSimulating(false);
    }
  };

  // Filter computation
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter === 'PENDING') {
      if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'ACCEPTED') return false;
    } else if (statusFilter === 'PREPARING') {
      if (order.orderStatus !== 'PREPARING') return false;
    } else if (statusFilter === 'READY') {
      if (order.orderStatus !== 'READY') return false;
    } else if (statusFilter === 'COMPLETED') {
      if (order.orderStatus !== 'COMPLETED') return false;
    }

    // Type filter
    if (typeFilter !== 'ALL' && order.orderType !== typeFilter) {
      return false;
    }

    // Search query (token #, customer phone, customer name, items)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim().replace('#', '');
      const matchToken = order.tokenNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = (order.customerPhone || '').includes(q);
      const matchItem = order.items.some((i) => i.name.toLowerCase().includes(q));
      if (!matchToken && !matchName && !matchPhone && !matchItem) {
        return false;
      }
    }

    return true;
  });

  const pendingCount = orders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'ACCEPTED').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'READY').length;
  const completedCount = orders.filter((o) => o.orderStatus === 'COMPLETED').length;

  return (
    <BusinessLayout activeTab="orders" title="Live Counter Orders">
      {/* Rush Mode Fullscreen */}
      {isRushModeOpen && (
        <RushModeView
          orders={orders}
          onClose={() => setIsRushModeOpen(false)}
          onRefresh={loadOrders}
        />
      )}

      <div className="space-y-4">
        {/* Header Bar with Search & Rush Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token # (e.g. 142), name, phone..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 text-xs font-bold transition-colors border border-orange-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Simulate Order</span>
            </button>

            <button
              onClick={() => setIsRushModeOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Rush View</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>

            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>New</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('PREPARING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === 'PREPARING' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Cooking</span>
              {preparingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center">
                  {preparingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('READY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === 'READY' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Ready</span>
              {readyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center">
                  {readyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Dine-in vs Takeaway selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shrink-0 text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                typeFilter === 'ALL' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('TAKEAWAY')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                typeFilter === 'TAKEAWAY' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
              }`}
            >
              Takeaway
            </button>
            <button
              onClick={() => setTypeFilter('DINE_IN')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                typeFilter === 'DINE_IN' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'
              }`}
            >
              Dine In
            </button>
          </div>
        </div>

        {/* Orders Card Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No orders match the current filter or search query. Click "Simulate Order" above to generate a new live customer test order.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={loadOrders}
                onViewDetails={(id) => navigate(`/business/orders/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </BusinessLayout>
  );
};
