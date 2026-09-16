import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { customerService } from '../services/customerService';
import { UserProfile } from '../types';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ReceiptText, 
  Heart, 
  QrCode, 
  Bell, 
  Shield, 
  ChevronRight,
  Check,
  Smartphone
} from 'lucide-react';

interface ProfileViewProps {
  onOpenQRScanner: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenQRScanner }) => {
  const { navigate } = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    customerService.getProfile().then((data) => {
      setProfile(data);
      setName(data.name);
      setPhone(data.phone);
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await customerService.updateProfile({ name, phone });
    setProfile(updated);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!profile) return null;

  return (
    <div className="pb-28 max-w-xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Guest customer details for counter tokens & receipts
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile details updated successfully!</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 leading-snug">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{profile.phone}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{profile.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200/60"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>

      {/* Quick Action Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
        <button
          onClick={() => navigate('/orders')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600">
                My Counter Orders
              </h4>
              <p className="text-[11px] text-slate-500">
                View past tokens, receipts & active orders
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/saved')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600">
                Saved Favorite Stalls
              </h4>
              <p className="text-[11px] text-slate-500">
                Direct access to your go-to tea & food counters
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={onOpenQRScanner}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600">
                Scan Stall QR Simulator
              </h4>
              <p className="text-[11px] text-slate-500">
                Test QR menu access from any camera
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Stall Owner Ecosystem Portal */}
        <button
          onClick={() => navigate('/business')}
          className="w-full p-4 flex items-center justify-between text-left bg-slate-900 text-white hover:bg-slate-800 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-black">
              FF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-white">
                  Stall Owner Dashboard
                </h4>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                  Merchant Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Manage orders, Rush mode, live menu, & sales summary
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Brand Ethos / Product Vision Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/60 text-xs text-slate-700 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-orange-900">
          <Smartphone className="w-4 h-4 text-orange-600" />
          <span>No App Install Mandate</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          FoodFlow runs instantly in any mobile browser when customers scan a stall QR code. No downloads, no storage waste, and no forced signup forms before seeing the menu.
        </p>
      </div>
    </div>
  );
};
