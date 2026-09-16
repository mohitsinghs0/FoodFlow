import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  AlertCircle, 
  Check, 
  Sparkles, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { menuService } from '../../services/menuService';
import { MenuItem } from '../../types';

export const BusinessAvailabilityView: React.FC = () => {
  const { navigate } = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      const data = await menuService.getShopMenu('sharma-vada-pav');
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleToggle = async (itemId: string, currentStatus: boolean) => {
    setTogglingId(itemId);
    try {
      const updated = await menuService.updateItemAvailability(itemId, !currentStatus);
      if (updated) {
        setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleMarkAll = async (status: boolean) => {
    const promises = items.map((i) => menuService.updateItemAvailability(i.id, status));
    await Promise.all(promises);
    await loadItems();
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'AVAILABLE' && !item.isAvailable) return false;
    if (filter === 'UNAVAILABLE' && item.isAvailable) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const availableCount = items.filter((i) => i.isAvailable).length;
  const unavailableCount = items.filter((i) => !i.isAvailable).length;

  return (
    <BusinessLayout
      activeTab="menu"
      title="Live Item Availability"
      subtitle="Single-tap toggles update customer QR app in real-time"
      actions={
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleMarkAll(true)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
          >
            All Available
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold">Fast Daily Stock Management</p>
            <p className="text-amber-800">
              Ran out of Pav or Cold Coffee? Tap the switch to instantly disable it so customers at the counter cannot order it.
            </p>
          </div>
        </div>

        {/* Search & Quick Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items to toggle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('AVAILABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filter === 'AVAILABLE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Available ({availableCount})</span>
            </button>
            <button
              onClick={() => setFilter('UNAVAILABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                filter === 'UNAVAILABLE' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Sold Out ({unavailableCount})</span>
            </button>
          </div>
        </div>

        {/* Fast Toggles List */}
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-center justify-between transition-colors ${
                !item.isAvailable ? 'bg-slate-50/80 opacity-75' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-xs border flex items-center justify-center shrink-0 ${
                      item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    ₹{item.price} • {item.preparationMinutes || '5'}m prep
                  </div>
                </div>
              </div>

              {/* Huge Single-Tap Toggle Button */}
              <button
                onClick={() => handleToggle(item.id, item.isAvailable)}
                disabled={togglingId === item.id}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs ${
                  item.isAvailable
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {item.isAvailable ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AVAILABLE</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>SOLD OUT</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </BusinessLayout>
  );
};
