import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { getBrowserLocation, DEFAULT_CUSTOMER_LOCATION } from '../services/geoService';
import { 
  MapPin, 
  Navigation, 
  User, 
  Phone, 
  Building2, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Compass
} from 'lucide-react';

export const CompleteProfileView: React.FC = () => {
  const { currentUser, completeCustomerProfile } = useAuth();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [area, setArea] = useState(currentUser?.area || 'Andheri West');
  const [city, setCity] = useState(currentUser?.city || 'Mumbai');
  const [latitude, setLatitude] = useState<number>(currentUser?.latitude || DEFAULT_CUSTOMER_LOCATION.latitude);
  const [longitude, setLongitude] = useState<number>(currentUser?.longitude || DEFAULT_CUSTOMER_LOCATION.longitude);
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '');
  
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('manual');
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(Boolean(currentUser?.latitude));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.fullName || currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (currentUser.latitude && currentUser.longitude) {
        setLatitude(currentUser.latitude);
        setLongitude(currentUser.longitude);
        setLocationDetected(true);
      }
    }
  }, [currentUser]);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setError(null);
    try {
      const coords = await getBrowserLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      setLocationDetected(true);
      setLocationMode('gps');
      // If no area is set, provide a friendly default based on coordinate region
      if (!area || area === 'Andheri West') {
        setArea('Current GPS Location');
      }
    } catch (err: any) {
      console.warn('Geolocation failed:', err);
      setError('Could not access current location. Please allow location permissions or enter your locality manually.');
      setLocationMode('manual');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!area.trim()) {
      setError('Please enter your area or locality.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your city.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeCustomerProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        latitude: latitude || DEFAULT_CUSTOMER_LOCATION.latitude,
        longitude: longitude || DEFAULT_CUSTOMER_LOCATION.longitude,
        area: area.trim(),
        city: city.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });

      // Redirect directly to Home page
      navigate('/');
    } catch (err: any) {
      console.error('Failed to complete profile:', err);
      setError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mb-1">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Set up your location to discover nearby food counters and street stalls within walking distance.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-500" />
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aditi Sharma"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Location Mode Choice */}
          <div className="space-y-3 pt-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              Your Food Location *
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start justify-between gap-2 ${
                  locationMode === 'gps' && locationDetected
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-orange-500' : 'text-orange-600'}`} />
                  <span className="text-xs font-bold">Use Current Location</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {isLocating
                    ? 'Detecting GPS...'
                    : locationDetected && locationMode === 'gps'
                    ? 'GPS Coordinates Saved'
                    : 'Browser Geolocation'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLocationMode('manual')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col items-start justify-between gap-2 ${
                  locationMode === 'manual'
                    ? 'border-orange-500 bg-orange-50/50 text-orange-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold">Enter Manually</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Area & City inputs
                </span>
              </button>
            </div>

            {locationDetected && (
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-medium">
                  GPS Coords: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Area & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Area / Locality *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Andheri West Station"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Optional Profile Photo URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                Profile Photo (Optional)
              </span>
              <span className="text-[10px] text-slate-400">Image URL</span>
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Save Profile & Start Ordering</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
