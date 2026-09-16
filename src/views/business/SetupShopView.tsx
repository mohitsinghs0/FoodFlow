import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { getBrowserLocation, DEFAULT_CUSTOMER_LOCATION } from '../../services/geoService';
import {
  Store,
  MapPin,
  Navigation,
  Clock,
  QrCode,
  Building,
  Phone,
  Image as ImageIcon,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const SetupShopView: React.FC = () => {
  const { currentUser, setupOwnerShop } = useAuth();
  const { navigate } = useRouter();

  const [ownerName, setOwnerName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('Andheri West');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400058');
  const [openingTime, setOpeningTime] = useState('08:00 AM');
  const [closingTime, setClosingTime] = useState('10:30 PM');
  const [upiId, setUpiId] = useState('');
  const [stallType, setStallType] = useState('Thela / Food Stall');
  const [image, setImage] = useState('');

  const [latitude, setLatitude] = useState<number>(DEFAULT_CUSTOMER_LOCATION.latitude);
  const [longitude, setLongitude] = useState<number>(DEFAULT_CUSTOMER_LOCATION.longitude);
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('manual');
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setError(null);
    try {
      const coords = await getBrowserLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setLocationDetected(true);
      setLocationMode('gps');
    } catch (err: any) {
      console.warn('Geolocation failed:', err);
      setError('Could not access current location. Please enter your shop address manually.');
      setLocationMode('manual');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopName.trim()) {
      setError('Please provide a Shop / Counter Name.');
      return;
    }
    if (!address.trim()) {
      setError('Please provide the physical stall address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }
    if (!upiId.trim()) {
      setError('Please provide your UPI ID for direct counter payments.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setupOwnerShop({
        ownerName: ownerName.trim() || 'Stall Owner',
        shopName: shopName.trim(),
        description: description.trim(),
        phone: phone.trim(),
        address: address.trim(),
        area: area.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        latitude: latitude || DEFAULT_CUSTOMER_LOCATION.latitude,
        longitude: longitude || DEFAULT_CUSTOMER_LOCATION.longitude,
        openingTime,
        closingTime,
        upiId: upiId.trim(),
        stallType,
        image: image.trim() || undefined,
      });

      // Redirect to Owner Dashboard
      navigate('/business');
    } catch (err: any) {
      console.error('Failed to setup shop:', err);
      setError(err?.message || 'Failed to save shop details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mb-1">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Set Up Your Food Counter / Shop
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Configure your counter details, location, and UPI payment ID so customers can discover you and place orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Owner Name & Shop Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Owner Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Shop / Stall Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Sharma Vada Pav & Chai"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Description & Stall Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Shop Tagline & Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh hot potato vadas fried in groundnut oil with signature garlic chutney..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Stall Type</label>
              <select
                value={stallType}
                onChange={(e) => setStallType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="Thela / Food Stall">Thela / Food Stall</option>
                <option value="College Canteen">College Canteen</option>
                <option value="Fast Food Counter">Fast Food Counter</option>
                <option value="Tea Tapri">Tea Tapri</option>
                <option value="Sandwich Cart">Sandwich Cart</option>
                <option value="Juice Point">Juice Point</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Location Mode */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              Shop GPS Location *
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start justify-between gap-1.5 ${
                  locationMode === 'gps' && locationDetected
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-orange-500' : 'text-orange-600'}`} />
                  <span className="text-xs font-bold">Use Current Location</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {isLocating ? 'Detecting GPS...' : locationDetected ? 'GPS Coordinates Saved' : 'Use stall location'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLocationMode('manual')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start justify-between gap-1.5 ${
                  locationMode === 'manual'
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold">Set Manually</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Type stall address
                </span>
              </button>
            </div>

            {locationDetected && (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Saved Stall GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Full Stall Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Gate 2, Andheri West Metro Station, Mumbai"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Area, City, State, Pincode */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Area *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Andheri West"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="400058"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Opening & Closing Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Opening Time
              </label>
              <input
                type="text"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                placeholder="08:00 AM"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Closing Time
              </label>
              <input
                type="text"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                placeholder="10:30 PM"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900"
              />
            </div>
          </div>

          {/* UPI ID & Optional Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-orange-500" />
                UPI ID (Direct Counter Payment) *
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="sharma@okhdfcbank"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                Shop Photo URL (Optional)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 pt-3"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Save Shop & Open Owner Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
