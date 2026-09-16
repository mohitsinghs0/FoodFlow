import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { shopService } from '../services/shopService';
import { Shop } from '../types';
import { ShopCard } from '../components/shop/ShopCard';
import { EmptyState } from '../components/common/EmptyState';
import { Heart, ArrowLeft, Store } from 'lucide-react';

export const SavedShopsView: React.FC = () => {
  const { navigate, goBack } = useRouter();
  const [savedShops, setSavedShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    const savedIds = shopService.getSavedShopIds();
    const allShops = await shopService.getNearbyShops();
    const filtered = allShops.filter((s) => savedIds.includes(s.id));
    setSavedShops(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleToggleSaved = (shopId: string) => {
    shopService.toggleSaveShop(shopId);
    fetchSaved();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded-xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (savedShops.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <EmptyState
          type="saved"
          title="No saved stalls yet"
          description="Save your everyday canteen counter or favorite tea tapri to re-order in seconds."
          actionText="Discover Stalls"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-3xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Saved Stalls
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Quick 1-tap ordering from your frequent local counters
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {savedShops.length} {savedShops.length === 1 ? 'stall' : 'stalls'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {savedShops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            layout="horizontal"
            isSaved={true}
            onToggleSaved={handleToggleSaved}
          />
        ))}
      </div>
    </div>
  );
};
