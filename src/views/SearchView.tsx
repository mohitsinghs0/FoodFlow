import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { shopService } from '../services/shopService';
import { Shop, MenuItem, ShopCategory } from '../types';
import { ShopCard } from '../components/shop/ShopCard';
import { EmptyState } from '../components/common/EmptyState';
import { VegBadge } from '../components/common/VegBadge';
import { Search, X, Flame, Clock, ArrowRight, Store, Sparkles } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedShopIds, setSavedShopIds] = useState<string[]>([]);

  useEffect(() => {
    shopService.getCategories().then(setCategories);
    setSavedShopIds(shopService.getSavedShopIds());
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      setLoading(true);
      const res = await shopService.searchShopsAndItems(query);
      setShops(res.shops);
      setItems(res.items);
      setLoading(false);
    };

    const debounce = setTimeout(handleSearch, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  const quickPills = ['Vada Pav', 'Chai', 'Maggi', 'Sandwich', 'Pav Bhaji', 'Juice'];

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-5 animate-in fade-in duration-200">
      {/* Search Header Input */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Search Stalls & Food
        </h1>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            placeholder="Search by stall name, snack, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-slate-400 mr-1 flex-shrink-0">
            Suggestions:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => setQuery(pill)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                query.toLowerCase() === pill.toLowerCase()
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Results presentation */}
      {loading ? (
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      ) : shops.length === 0 && items.length === 0 ? (
        <EmptyState
          type="search"
          title="No shops or food items found"
          description={`We couldn't find anything matching "${query}". Try searching for tea, vada pav, or sandwiches.`}
          actionText="Clear Search"
          onAction={() => setQuery('')}
        />
      ) : (
        <div className="space-y-6">
          {/* Matched Stalls */}
          {shops.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-orange-600" />
                  <span>Stalls & Counters ({shops.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {shops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    isSaved={savedShopIds.includes(shop.id)}
                    layout="horizontal"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Matched Dishes & Food Items */}
          {items.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Matching Menu Items ({items.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/shop/${item.shopId}`)}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-orange-300 p-3.5 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <VegBadge isVeg={item.isVeg} size="sm" />
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 truncate">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs font-black text-slate-900">
                          ₹{item.price}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600 flex-shrink-0 pl-2">
                      <span className="hidden sm:inline">Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
