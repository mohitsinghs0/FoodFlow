import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
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
  ArrowRight
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import { Shop } from '../../types';

export const BusinessShopProfileView: React.FC = () => {
  const { navigate } = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [stallType, setStallType] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [upiId, setUpiId] = useState('sharmavadapav@oksbi');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    shopService.getShop('sharma-vada-pav').then((data) => {
      if (data) {
        setShop(data);
        setName(data.name);
        setTagline(data.tagline);
        setStallType(data.stallType);
        setPhone(data.contactPhone || '+91 98200 12345');
        setAddress(data.location.address);
        setLandmark(data.location.landmark || '');
        const parts = (data.openingHours || '08:00 AM - 10:00 PM').split(' - ');
        setOpeningTime(parts[0] || '08:00 AM');
        setClosingTime(parts[1] || '10:00 PM');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    setSaving(true);
    try {
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
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessLayout activeTab="more" title="Stall & Business Profile">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Stall profile updated successfully!</span>
            </div>
          )}

          {/* Header & Logo */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-md relative group">
              <span>{name.charAt(0) || 'S'}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{name || 'Sharma Vada Pav'}</h2>
              <p className="text-xs text-slate-500">{tagline || 'Authentic Mumbai Street Food'}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                  {stallType || 'Street Food Stall'}
                </span>
                <span className="text-xs text-slate-400">ID: {shop?.id}</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="Street Food Stall / Thela">Street Food Stall / Thela</option>
                <option value="College Canteen Counter">College Canteen Counter</option>
                <option value="Juice / Shake Bar">Juice / Shake Bar</option>
                <option value="Chai & Snack Point">Chai & Snack Point</option>
                <option value="Quick Service Cafe">Quick Service Cafe</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Stall Contact Phone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          {/* UPI ID for Direct Counter Payments */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Direct UPI ID (Merchant Payments)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. sharmavadapav@oksbi"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
            />
            <p className="text-[11px] text-slate-500">
              Payments made via customer QR app will settle directly into this UPI bank VPA.
            </p>
          </div>

          {/* Location details */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Stall Physical Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Gate 2, Andheri West Metro Station"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Near Ticket Counter, Exit 2"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Opening Time
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Closing Time
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="10:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/business/qr')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-orange-600" />
              <span>View Stall QR Standee</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Stall Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </BusinessLayout>
  );
};
