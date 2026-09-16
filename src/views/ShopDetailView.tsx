import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { shopService } from '../services/shopService';
import { menuService } from '../services/menuService';
import { Shop, MenuItem, ShopCategory } from '../types';
import { MenuItemCard } from '../components/shop/MenuItemCard';
import { EmptyState } from '../components/common/EmptyState';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Star, 
  Heart, 
  Share2, 
  Store, 
  Search,
  CheckCircle,
  QrCode,
  Sparkles
} from 'lucide-react';

interface ShopDetailViewProps {
  shopId: string;
}

export const ShopDetailView: React.FC<ShopDetailViewProps> = ({ shopId }) => {
  const { route, navigate, goBack } = useRouter();
  const { isAuthenticated } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);
  const [tableContext, setTableContext] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopAndMenu = async () => {
      setLoading(true);
      const [shopData, items, allCats] = await Promise.all([
        shopService.getShopById(shopId),
        menuService.getShopMenu(shopId),
        shopService.getCategories(),
      ]);

      setShop(shopData);
      setMenuItems(items);
      setCategories(allCats);
      setIsSaved(shopService.isShopSaved(shopId));

      const prefilledTable = sessionStorage.getItem('foodflow_prefill_table');
      if (prefilledTable) {
        setTableContext(prefilledTable);
      }

      setLoading(false);
    };

    fetchShopAndMenu();
  }, [shopId]);

  const handleToggleSaved = () => {
    if (!shop) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(route.path || `/shop/${shop.slug}`)}`);
      return;
    }
    const nowSaved = shopService.toggleSaveShop(shop.id);
    setIsSaved(nowSaved);
  };

  const handleShare = () => {
    if (!shop) return;
    if (navigator.share) {
      navigator.share({
        title: `${shop.name} on FoodFlow`,
        text: `Order food & skip counter queue at ${shop.name}:`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-56 bg-slate-200 rounded-3xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <EmptyState
          type="shops"
          title="Stall Not Found"
          description="The shop QR or link may be expired or incorrect."
          actionText="Find Other Stalls"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  // Filter menu items by category and search text
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'popular'
        ? item.isBestseller
        : item.categoryId === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Group items by category for realistic display
  const shopCategoryIds = Array.from(new Set(menuItems.map((i) => i.categoryId)));
  const availableCategories = categories.filter((c) =>
    shopCategoryIds.includes(c.id)
  );

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-5 animate-in fade-in duration-200">
      {/* Top back & actions navigation bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {tableContext && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>QR: {tableContext}</span>
            </span>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Share Shop Link / QR"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSaved}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 transition-colors"
            title={isSaved ? 'Saved stall' : 'Save stall'}
          >
            <Heart
              className={`w-4 h-4 ${
                isSaved ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {copiedShare && (
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center animate-in fade-in">
          Shop link copied to clipboard!
        </div>
      )}

      {/* SHOP HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
        {/* Banner image */}
        <div className="relative h-44 sm:h-56 w-full bg-slate-100">
          <img
            src={shop.bannerImage || shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Stall status overlay */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs border border-white/10">
              {shop.stallType}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md ${
                shop.isOpen
                  ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950/85 text-rose-300 border border-rose-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  shop.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              {shop.isOpen ? 'Counter Open' : 'Currently Closed'}
            </span>
          </div>

          {/* Stall Title & Tagline over image */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {shop.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 line-clamp-1 font-medium">
              {shop.tagline}
            </p>
          </div>
        </div>

        {/* Header Details strip */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100">
          {/* Rating, prep, pure veg */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{shop.rating}</span>
              <span className="text-slate-400 text-[11px]">({shop.totalReviews})</span>
            </div>

            <div className="flex items-center gap-1 text-slate-700 font-semibold bg-orange-50 px-2 py-1 rounded-lg border border-orange-200/60">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>Est. {shop.preparationTimeMinutes} min prep</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60">
              <span>🟢 {shop.isPureVeg ? 'Pure Veg' : 'Veg Options'}</span>
            </div>
          </div>

          {/* Location info */}
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[240px]">{shop.location.address}</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-700">{shop.location.distanceKm} km</span>
          </div>
        </div>

        {/* Closed warning banner if shop is closed */}
        {!shop.isOpen && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 text-xs text-rose-800 flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>
              This shop is currently closed ({shop.openingHours}). You can browse items, but counter ordering is paused.
            </span>
          </div>
        )}
      </div>

      {/* SEARCH AND CATEGORY FILTER BAR */}
      <div className="space-y-3 sticky top-16 z-20 bg-[#F8F9FA]/95 backdrop-blur-md py-2">
        {/* Quick Menu Item Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="menu-search-input"
            type="text"
            placeholder={`Search items in ${shop.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
          />
        </div>

        {/* Category horizontal scroller */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Items ({menuItems.length})
          </button>

          <button
            onClick={() => setSelectedCategory('popular')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              selectedCategory === 'popular'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Popular Bestsellers</span>
          </button>

          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* MENU ITEMS LIST */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No menu items match your filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-bold text-orange-600 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                shop={shop}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER HINT: QR ORDERING BENEFIT */}
      <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/50 text-center text-xs text-orange-900 flex items-center justify-center gap-2">
        <QrCode className="w-4 h-4 text-orange-600 flex-shrink-0" />
        <span>
          Scanned this QR at the stall? Your food is prepared fresh and called out by token.
        </span>
      </div>
    </div>
  );
};
