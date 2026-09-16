import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { shopService } from '../services/shopService';
import { Shop, ShopCategory } from '../types';
import { ShopCard } from '../components/shop/ShopCard';
import { EmptyState } from '../components/common/EmptyState';
import { Store, ArrowLeft, Filter, MapPin } from 'lucide-react';

export const ShopsView: React.FC = () => {
  const { navigate, goBack } = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedShopIds, setSavedShopIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [allShops, allCats] = await Promise.all([
        shopService.getNearbyShops(),
        shopService.getCategories(),
      ]);
      setShops(allShops);
      setCategories(allCats);
      setSavedShopIds(shopService.getSavedShopIds());
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleToggleSaved = (shopId: string) => {
    shopService.toggleSaveShop(shopId);
    setSavedShopIds(shopService.getSavedShopIds());
  };

  const filteredShops = shops.filter((s) => {
    const matchesCat =
      selectedCategory === 'all' || s.categories.includes(selectedCategory);
    const matchesOpen = onlyOpen ? s.isOpen : true;
    return matchesCat && matchesOpen;
  });

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>Vile Parle Station Area</span>
        </div>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          All Food Counters & Thelas
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Order in advance from local stalls and skip counter queues
        </p>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Toggle open only */}
        <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="rounded text-orange-600 focus:ring-orange-500"
          />
          <span>Open Now Only</span>
        </label>
      </div>

      {/* Grid of shops */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      ) : filteredShops.length === 0 ? (
        <EmptyState
          type="shops"
          title="No shops found"
          description="Try turning off 'Open Now Only' or selecting 'All Stalls'."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedCategory('all');
            setOnlyOpen(false);
          }}
        />
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
    </div>
  );
};
