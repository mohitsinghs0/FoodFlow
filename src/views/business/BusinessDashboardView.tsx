import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { OrderCard } from '../../components/business/OrderCard';
import { RushModeView } from '../../components/business/RushModeView';
import { 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  Flame, 
  CheckCircle2, 
  UtensilsCrossed, 
  QrCode, 
  Plus, 
  Zap, 
  Sparkles, 
  IndianRupee, 
  AlertCircle, 
  RefreshCw,
  ChevronRight,
  Bell
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { shopService } from '../../services/shopService';
import { salesService } from '../../services/salesService';
import { orderRealtimeService } from '../../services/orderRealtimeService';
import { Order, SalesSummary, Shop } from '../../types';

export const BusinessDashboardView: React.FC = () => {
  const { navigate } = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRushModeOpen, setIsRushModeOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const loadData = async () => {
    try {
      const [shopData, allOrders, salesSummary] = await Promise.all([
        shopService.getShop('sharma-vada-pav'),
        orderService.getShopOrders('sharma-vada-pav'),
        salesService.getTodaySales('sharma-vada-pav'),
      ]);
      setShop(shopData);
      setOrders(allOrders);
      setSales(salesSummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time order updates
    const unsub = orderRealtimeService.subscribeToShop('sharma-vada-pav', (updatedOrders) => {
      setOrders(updatedOrders);
      salesService.getTodaySales('sharma-vada-pav').then(setSales);
    });

    return () => unsub();
  }, []);

  const handleSimulateOrder = async () => {
    setSimulating(true);
    try {
      await orderRealtimeService.simulateIncomingOrder('sharma-vada-pav');
      await loadData();
    } finally {
      setSimulating(false);
    }
  };

  const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'ACCEPTED');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'PREPARING');
  const readyOrders = orders.filter((o) => o.orderStatus === 'READY');
  const completedOrders = orders.filter((o) => o.orderStatus === 'COMPLETED');

  return (
    <BusinessLayout activeTab="dashboard" title={shop?.name || 'Sharma Vada Pav'}>
      {/* Rush Mode Fullscreen Overlay */}
      {isRushModeOpen && (
        <RushModeView
          orders={orders}
          onClose={() => setIsRushModeOpen(false)}
          onRefresh={loadData}
        />
      )}

      <div className="space-y-6">
        {/* Banner Alert if Stall is CLOSED */}
        {shop && !shop.isOpen && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                !
              </div>
              <div>
                <h4 className="font-bold text-sm">Stall is Currently Offline</h4>
                <p className="text-xs text-rose-700">Customers scanning the QR code cannot place new orders.</p>
              </div>
            </div>
            <button
              onClick={async () => {
                const updated = await shopService.updateShopStatus(shop.id, true);
                if (updated) setShop(updated);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
            >
              Open Stall
            </button>
          </div>
        )}

        {/* Top Summary Metrics Row */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-slate-900">Today's Stall Overview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateOrder}
                disabled={simulating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-bold transition-colors"
                title="Simulate incoming test order from customer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                <span>Simulate Order</span>
              </button>

              <button
                onClick={() => setIsRushModeOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Rush Mode</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Orders */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Orders</span>
                <ShoppingBag className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900">{orders.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Today</div>
            </div>

            {/* Total Sales */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Total Sales</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{sales?.totalSales || 1280}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                ₹{sales?.cashSales || 720} cash • ₹{sales?.onlineSales || 560} online
              </div>
            </div>

            {/* Pending */}
            <div 
              onClick={() => navigate('/business/orders?filter=PENDING')}
              className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-xs cursor-pointer hover:bg-amber-100/70 transition-colors"
            >
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-xs font-bold">New</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950">{pendingOrders.length}</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Action Needed</div>
            </div>

            {/* Preparing */}
            <div 
              onClick={() => navigate('/business/orders?filter=PREPARING')}
              className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200 shadow-xs cursor-pointer hover:bg-orange-100/70 transition-colors"
            >
              <div className="flex items-center justify-between text-orange-800 mb-1">
                <span className="text-xs font-bold">Preparing</span>
                <Flame className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-950">{preparingOrders.length}</div>
              <div className="text-[11px] text-orange-700 font-semibold mt-0.5">On the tawa/stove</div>
            </div>

            {/* Ready */}
            <div 
              onClick={() => navigate('/business/orders?filter=READY')}
              className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-xs cursor-pointer hover:bg-emerald-100/70 transition-colors"
            >
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-xs font-bold">Ready</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950">{readyOrders.length}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Awaiting pickup</div>
            </div>

            {/* Completed */}
            <div 
              onClick={() => navigate('/business/orders?filter=COMPLETED')}
              className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-xs font-medium">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-800">{completedOrders.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tokens served</div>
            </div>
          </div>
        </div>

        {/* Quick Operational Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => navigate('/business/menu/new')}
            className="p-3 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 rounded-2xl flex items-center gap-3 transition-colors shadow-xs text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">+ Add Item</div>
              <div className="text-[10px] text-slate-500">Add to live menu</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/business/availability')}
            className="p-3 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-2xl flex items-center gap-3 transition-colors shadow-xs text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Item Availability</div>
              <div className="text-[10px] text-slate-500">Quick on/off toggles</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/business/qr')}
            className="p-3 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl flex items-center gap-3 transition-colors shadow-xs text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Stall QR Code</div>
              <div className="text-[10px] text-slate-500">View & print standee</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/business/sales')}
            className="p-3 bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 rounded-2xl flex items-center gap-3 transition-colors shadow-xs text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Reconciliation</div>
              <div className="text-[10px] text-slate-500">Cash vs Online totals</div>
            </div>
          </button>
        </div>

        {/* Section 1: NEW / PENDING ORDERS (Highest Priority) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-bold text-base text-slate-900">
                New Orders Waiting for Acceptance ({pendingOrders.length})
              </h3>
            </div>
            {pendingOrders.length > 0 && (
              <span className="text-xs text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                Immediate Action
              </span>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-white text-center space-y-1">
              <p className="text-sm font-semibold text-slate-700">No pending orders in queue</p>
              <p className="text-xs text-slate-400">
                Incoming orders from QR code scans will chime and appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={loadData}
                  onViewDetails={(id) => navigate(`/business/orders/${id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: PREPARING ORDERS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-base text-slate-900">
                Currently Preparing ({preparingOrders.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/business/orders?filter=PREPARING')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center text-xs text-slate-500">
              No orders are currently cooking.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={loadData}
                  onViewDetails={(id) => navigate(`/business/orders/${id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 3: READY ORDERS (Pickup Counter) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                Ready at Counter for Customer Handover ({readyOrders.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/business/orders?filter=READY')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {readyOrders.length === 0 ? (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center text-xs text-slate-500">
              No orders are waiting for pickup.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={loadData}
                  onViewDetails={(id) => navigate(`/business/orders/${id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </BusinessLayout>
  );
};
