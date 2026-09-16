import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  UtensilsCrossed, 
  Tag, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { menuService } from '../../services/menuService';
import { MenuItem, ShopCategory } from '../../types';

export const BusinessMenuView: React.FC = () => {
  const { navigate } = useRouter();
  const { activeShopId, currentBusiness } = useAuth();
  const targetShopId = activeShopId || currentBusiness?.id || 'demo-shop-001';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [menuItems, cats] = await Promise.all([
        menuService.getShopMenu(targetShopId),
        menuService.getCategories(targetShopId),
      ]);
      setItems(menuItems);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetShopId]);

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    const updated = await menuService.updateItemAvailability(itemId, !currentStatus);
    if (updated) {
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    await menuService.deleteItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setDeleteConfirmId(null);
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <BusinessLayout 
      activeTab="menu" 
      title="Menu Management"
      subtitle={`${items.length} live items`}
      actions={
        <button
          onClick={() => navigate('/business/menu/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search Bar & Quick Switch to Availability */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu item name or ingredients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
          </div>

          <button
            onClick={() => navigate('/business/availability')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Fast Availability Mode</span>
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Items ({items.length})
          </button>

          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items List */}
        {filteredItems.length === 0 ? (
          <div className="p-10 rounded-2xl border border-slate-200 bg-white text-center space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-sm text-slate-800">No menu items found</p>
            <button
              onClick={() => navigate('/business/menu/new')}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between shadow-xs ${
                  item.isAvailable ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3">
                    {/* Item Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                      </div>

                      <div className="text-base font-extrabold text-slate-900 mt-0.5">
                        ₹{item.price}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      item.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <span>{item.isAvailable ? 'Available' : 'Sold Out'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/business/menu/${item.id}`)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Delete this item?</h3>
              <p className="text-xs text-slate-500">
                This item will be permanently removed from your digital menu and customer QR orders.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="py-2.5 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
};
