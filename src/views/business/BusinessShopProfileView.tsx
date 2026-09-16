import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  Save, 
  Check, 
  IndianRupee, 
  Camera, 
  QrCode,
  ArrowRight,
  User,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import { Shop } from '../../types';

export const BusinessShopProfileView: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, currentBusiness, activeShopId, updateOwnerShop } = useAuth();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState(currentBusiness?.name || '');
  const [tagline, setTagline] = useState('');
  const [stallType, setStallType] = useState(currentBusiness?.stallType || 'Thela / Food Stall');
  const [phone, setPhone] = useState(currentBusiness?.phone || currentUser?.phone || '');
  const [address, setAddress] = useState(currentBusiness?.address || '');
  const [landmark, setLandmark] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');
  const [upiId, setUpiId] = useState('sharmavadapav@oksbi');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const targetShopId = currentBusiness?.id || activeShopId || 'demo-shop-001';
    shopService.getShop(targetShopId).then((data) => {
      if (data) {
        setShop(data);
        setName(data.name);
        setTagline(data.tagline || '');
        setStallType(data.stallType);
        setPhone(data.contactPhone || currentBusiness?.phone || currentUser?.phone || '+91 98200 12345');
        setAddress(data.location.address || currentBusiness?.address || '');
        setLandmark(data.location.landmark || '');
        const parts = (data.openingHours || '08:00 AM - 10:00 PM').split(' - ');
        setOpeningTime(parts[0] || '08:00 AM');
        setClosingTime(parts[1] || '10:00 PM');
      } else if (currentBusiness) {
        setName(currentBusiness.name);
        setPhone(currentBusiness.phone || currentUser?.phone || '');
        setAddress(currentBusiness.address || '');
      }
    });
  }, [activeShopId, currentBusiness, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (shop) {
        const updated = await shopService.updateShop(shop.id, {
          name,
          tagline,
          stallType: (stallType as any) || shop.stallType,
          contactPhone: phone,
          location: {
            ...shop.location,
            address,
            landmark,
          },
          openingHours: `${openingTime} - ${closingTime}`,
        });
        if (updated) {
          setShop(updated);
        }
      }

      // Also update auth currentBusiness context
      await updateOwnerShop({
        name,
        phone,
        address,
        stallType,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update stall profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessLayout activeTab="shop" title="Stall Profile & Info">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Authenticated Owner Identity Information */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Authenticated Owner Identity
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase">
              {currentUser?.role || 'OWNER'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Owner Full Name
              </span>
              <span className="font-bold text-white text-sm">
                {currentUser?.fullName || 'Ramesh Sharma'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Registered Stall Name
              </span>
              <span className="font-bold text-orange-400 text-sm">
                {currentBusiness?.name || name || 'Sharma Vada Pav'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Contact Phone
              </span>
              <span className="font-medium text-slate-200">
                {currentUser?.phone || phone}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Login Email
              </span>
              <span className="font-medium text-slate-200">
                {currentUser?.email || 'owner@foodflow.demo'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Stall Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Stall profile updated successfully!</span>
            </div>
          )}

          {/* Header & Logo */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-md relative group">
              <span>{name.charAt(0) || 'S'}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{name || 'Sharma Vada Pav'}</h2>
              <p className="text-xs text-slate-500">{tagline || 'Authentic Street Food Counter'}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md">
                  {stallType || 'Street Food Stall'}
                </span>
                <span className="text-[11px] text-slate-400">ID: {currentBusiness?.id || shop?.id || 'demo-shop-001'}</span>
              </div>
            </div>
          </div>

          {/* Stall Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stall Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Authentic Mumbai Street Food"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          {/* Stall Type & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stall Category *
              </label>
              <select
                value={stallType}
                onChange={(e) => setStallType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              >
                <option value="Thela / Food Stall">Thela / Food Stall</option>
                <option value="College Canteen">College Canteen</option>
                <option value="Tea Tapri">Tea Tapri / Chai Counter</option>
                <option value="Fast Food Counter">Fast Food Counter</option>
                <option value="Sandwich Cart">Sandwich Cart</option>
                <option value="Juice Point">Juice & Shake Point</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Public Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          {/* Location & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              Counter Location
            </h3>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">
                Landmark / Counter Position
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Entry Gate 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-600" />
              Counter Operating Hours
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Opening Time</label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Closing Time</label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Stall Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </BusinessLayout>
  );
};
