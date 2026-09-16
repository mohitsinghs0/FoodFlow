import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { shopService } from '../services/shopService';
import { orderService } from '../services/orderService';
import { Shop, ShopCategory, Order } from '../types';
import { ShopCard } from '../components/shop/ShopCard';
import { 
  Search, 
  QrCode, 
  Flame, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Store, 
  Receipt,
  Heart,
  ChevronRight,
  MapPin,
  SlidersHorizontal
} from 'lucide-react';

interface HomeViewProps {
  onOpenQRScanner: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenQRScanner }) => {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '1km' | '2km' | '5km'>('all');
  const [onlyOpen, setOnlyOpen] = useState<boolean>(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [savedShopIds, setSavedShopIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const userLocation = currentUser?.latitude && currentUser?.longitude
    ? { latitude: currentUser.latitude, longitude: currentUser.longitude }
    : undefined;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cats, allShops, orders] = await Promise.all([
        shopService.getCategories(),
        shopService.getNearbyShops(undefined, undefined, userLocation),
        orderService.getCustomerOrders(),
      ]);
      setCategories(cats);
      setShops(allShops);
      setRecentOrders(orders.slice(0, 2));
      setSavedShopIds(shopService.getSavedShopIds());
      setLoading(false);
    };

    fetchData();
  }, [currentUser?.latitude, currentUser?.longitude]);

  const handleToggleSaved = (shopId: string) => {
    shopService.toggleSaveShop(shopId);
    setSavedShopIds(shopService.getSavedShopIds());
  };

  let filteredShops = selectedCategory === 'all'
    ? shops
    : shops.filter((s) => s.categories && s.categories.includes(selectedCategory));

  if (onlyOpen) {
    filteredShops = filteredShops.filter((s) => s.isOpen);
  }

  if (distanceFilter === '1km') {
    filteredShops = filteredShops.filter((s) => (s.location?.distanceKm ?? 0) <= 1.0);
  } else if (distanceFilter === '2km') {
    filteredShops = filteredShops.filter((s) => (s.location?.distanceKm ?? 0) <= 2.0);
  } else if (distanceFilter === '5km') {
    filteredShops = filteredShops.filter((s) => (s.location?.distanceKm ?? 0) <= 5.0);
  }

  const popularShops = shops.filter((s) => s.rating >= 4.7);
  const savedShops = shops.filter((s) => savedShopIds.includes(s.id));

  // Active token notification preview if user has an ongoing counter order
  const activeOrder = recentOrders.find(
    (o) => o.orderStatus === 'PREPARING' || o.orderStatus === 'READY' || o.orderStatus === 'ACCEPTED'
  );

  return (
    <div className="pb-24 max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 pt-3 sm:pt-5">
      {/* ACTIVE LIVE TOKEN CALLOUT (If customer already ordered) */}
      {activeOrder && (
        <div
          id="active-order-banner"
          onClick={() => navigate(`/order/${activeOrder.id}`)}
          className="cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-600/20 flex items-center justify-between gap-3 hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex flex-col items-center justify-center font-black leading-none text-white">
              <span className="text-[9px] uppercase tracking-wider text-orange-200">Token</span>
              <span className="text-sm">{activeOrder.tokenNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.5 rounded">
                  {activeOrder.orderStatus}
                </span>
                <span className="text-xs text-orange-100 font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                  {activeOrder.shopName}
                </span>
              </div>
              <p className="text-xs text-white/95 mt-0.5 font-medium">
                {activeOrder.orderStatus === 'READY'
                  ? 'Your food is READY at the counter! Tap to collect.'
                  : 'Preparing now. Tap to track live token progress.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
        </div>
      )}

      {/* QUICK HERO & SEARCH BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order. Skip the Queue. Collect.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Instant counter pickup at your college canteen, street thelas & chai stalls.
            </p>
          </div>

          {/* Direct Scan QR Button for mobile quick access */}
          <button
            id="hero-scan-qr-btn"
            onClick={onOpenQRScanner}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-orange-600/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Shop / Table QR</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div
          onClick={() => navigate('/search')}
          className="relative flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-orange-300 transition-all p-3.5 cursor-pointer group"
        >
          <Search className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors mr-3" />
          <span className="text-slate-400 text-sm font-medium">
            Search "Vada Pav", "Cutting Chai", "Maggi", or shop name...
          </span>
          <span className="ml-auto hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
            Tap to search
          </span>
        </div>

        {/* Current User Location & Proximity Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Your Location
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  GPS Active
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {currentUser?.area
                  ? `${currentUser.area}${currentUser.city ? ', ' + currentUser.city : ''}`
                  : 'Mithibai College, Vile Parle West, Mumbai'}
              </p>
            </div>
            <button
              onClick={() => navigate(currentUser ? '/complete-profile' : '/login')}
              className="ml-auto sm:ml-2 text-xs font-bold text-orange-600 hover:text-orange-700 whitespace-nowrap px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Change
            </button>
          </div>

          <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Range:
            </span>
            {(['all', '1km', '2km', '5km'] as const).map((dist) => (
              <button
                key={dist}
                onClick={() => setDistanceFilter(dist)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  distanceFilter === dist
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dist === 'all' ? 'All Distances' : `< ${dist.replace('km', ' km')}`}
              </button>
            ))}
            <button
              onClick={() => setOnlyOpen(!onlyOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                onlyOpen
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Open Now
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORIES PILLS SCROLLER */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Quick Categories
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-chip-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* POPULAR NEAR YOU / BEST STALLS */}
      {selectedCategory === 'all' && popularShops.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Popular Near You
              </h2>
            </div>
            <button
              onClick={() => navigate('/shops')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularShops.slice(0, 3).map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                isSaved={savedShopIds.includes(shop.id)}
                onToggleSaved={handleToggleSaved}
              />
            ))}
          </div>
        </section>
      )}

      {/* NEARBY SHOPS / ALL COUNTERS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {selectedCategory === 'all' ? 'Nearby Food Counters' : 'Category Stalls'}
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              ({filteredShops.length})
            </span>
          </div>
        </div>

        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No stalls found in this category right now.
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-2 text-xs font-bold text-orange-600"
            >
              Show all stalls
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                isSaved={savedShopIds.includes(shop.id)}
                onToggleSaved={handleToggleSaved}
              />
            ))}
          </div>
        )}
      </section>

      {/* SAVED SHOPS SECTION */}
      {selectedCategory === 'all' && savedShops.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                My Saved Shops
              </h2>
            </div>
            <button
              onClick={() => navigate('/saved')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View All ({savedShops.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedShops.slice(0, 2).map((shop) => (
              <ShopCard
                key={`saved-${shop.id}`}
                shop={shop}
                layout="horizontal"
                isSaved={true}
                onToggleSaved={handleToggleSaved}
              />
            ))}
          </div>
        </section>
      )}

      {/* RECENT COUNTER ORDERS SECTION */}
      {selectedCategory === 'all' && recentOrders.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Recent Orders
              </h2>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Order History
            </button>
          </div>

          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/order/${order.id}`)}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-orange-300 p-3 flex items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 font-mono font-bold text-xs text-orange-700 flex items-center justify-center border border-orange-200/60">
                    {order.tokenNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {order.shopName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • ₹{order.total} • {order.orderType === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      order.orderStatus === 'READY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
