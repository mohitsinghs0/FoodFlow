import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  ArrowLeft, 
  Camera, 
  Image as ImageIcon, 
  Check, 
  Save, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { menuService } from '../../services/menuService';
import { MenuItem, ShopCategory } from '../../types';

export const BusinessItemFormView: React.FC = () => {
  const { route, navigate } = useRouter();
  const itemId = route.params.itemId;
  const isEditing = Boolean(itemId && itemId !== 'new');

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('vada-pav');
  const [price, setPrice] = useState<string>('25');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [prepMinutes, setPrepMinutes] = useState('5');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80');
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    menuService.getCategories('sharma-vada-pav').then(setCategories);

    if (isEditing && itemId) {
      menuService.getMenuItem(itemId).then((item) => {
        if (item) {
          setName(item.name);
          setCategoryId(item.categoryId);
          setPrice(String(item.price));
          setDescription(item.description);
          setIsVeg(item.isVeg);
          setIsAvailable(item.isAvailable);
          setPrepMinutes(item.preparationMinutes || '5');
          setImage(item.image);
        }
        setLoading(false);
      });
    }
  }, [isEditing, itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setSaving(true);
    try {
      const numPrice = parseFloat(price) || 20;

      if (isEditing && itemId) {
        await menuService.updateItem(itemId, {
          name: name.trim(),
          categoryId,
          price: numPrice,
          description: description.trim(),
          isVeg,
          isAvailable,
          preparationMinutes: prepMinutes,
          image,
        });
      } else {
        await menuService.createItem({
          shopId: 'sharma-vada-pav',
          name: name.trim(),
          categoryId,
          price: numPrice,
          description: description.trim(),
          isVeg,
          isAvailable,
          preparationMinutes: prepMinutes,
          image,
          customizationOptions: [],
        });
      }

      navigate('/business/menu');
    } finally {
      setSaving(false);
    }
  };

  const sampleImages = [
    { label: 'Vada Pav', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
    { label: 'Chai', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80' },
    { label: 'Samosa', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sandwich', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80' },
    { label: 'Juice / Soda', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80' },
  ];

  if (loading) {
    return (
      <BusinessLayout showBackButton onBack={() => navigate('/business/menu')}>
        <div className="p-8 text-center text-xs text-slate-400">Loading item...</div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout
      showBackButton
      onBack={() => navigate('/business/menu')}
      title={isEditing ? 'Edit Menu Item' : 'Add New Item'}
      subtitle="Changes reflect instantly on customer QR menu"
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          {/* Photo Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Photo
            </label>
            <div className="flex items-center gap-4">
              <img
                src={image}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {sampleImages.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(sample.url)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                        image === sample.url
                          ? 'bg-orange-50 border-orange-300 text-orange-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or enter custom image URL"
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cheese Burst Vada Pav"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
          </div>

          {/* Category & Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Veg / Non-Veg Toggle */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Food Type:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isVeg
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Vegetarian (Pure Veg)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  !isVeg
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                <span>Non-Veg / Egg</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Ingredients
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crispy fried potato vada stuffed in pav with green spicy chutney and sweet tamarind dip..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Initial Availability & Prep Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Live Status
              </label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-colors ${
                  isAvailable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <span>{isAvailable ? 'AVAILABLE FOR ORDERING' : 'SOLD OUT / UNAVAILABLE'}</span>
                <span className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preparation Time (Mins)
              </label>
              <input
                type="text"
                value={prepMinutes}
                onChange={(e) => setPrepMinutes(e.target.value)}
                placeholder="5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          {/* Form Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/business/menu')}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Menu Item' : 'Publish to Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </BusinessLayout>
  );
};
