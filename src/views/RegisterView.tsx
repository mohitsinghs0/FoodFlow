import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Store, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { route, navigate } = useRouter();
  const { registerCustomer, registerOwner, signInWithGoogle } = useAuth();

  const [roleTab, setRoleTab] = useState<'customer' | 'owner'>('customer');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Owner specific fields
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [stallType, setStallType] = useState('Thela / Food Stall');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTarget = route.params.redirect || '';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Common validations
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (roleTab === 'customer') {
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        await registerCustomer({
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          password: password.trim(),
        });
        // Prompt newly registered customers to complete location & profile
        navigate('/complete-profile');
      } catch (err: any) {
        setError(err?.message || 'Failed to register customer account.');
      } finally {
        setLoading(false);
      }
    } else {
      // Owner validations
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Valid email address is required for stall owners.');
        return;
      }

      setLoading(true);
      try {
        await registerOwner({
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: email.trim(),
          password: password.trim(),
          shopName: shopName.trim() || undefined,
          shopAddress: shopAddress.trim() || undefined,
          stallType,
        });
        // Navigate owner to setup stall location, UPI ID, and hours
        navigate('/setup-shop');
      } catch (err: any) {
        setError(err?.message || 'Failed to register shop owner account.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-2xl shadow-md shadow-orange-500/20 mb-3 hover:scale-105 transition-transform"
        >
          FF
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Join FoodFlow
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Fast counter ordering for foodies & digital token management for stalls
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
        {/* Role Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl gap-1">
          <button
            type="button"
            id="register-tab-customer"
            onClick={() => {
              setRoleTab('customer');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'customer'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            id="register-tab-owner"
            onClick={() => {
              setRoleTab('owner');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'owner'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-orange-600" />
            <span>Shop Owner</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              {roleTab === 'customer' ? 'Full Name' : 'Owner Name'}
            </label>
            <div className="relative">
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={roleTab === 'customer' ? 'e.g. Rahul Sharma' : 'e.g. Ramesh Sharma'}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              {roleTab === 'customer' && (
                <span className="text-[10px] text-slate-400 font-medium">(Optional)</span>
              )}
            </div>
            <div className="relative">
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Owner-Specific Shop Registration Fields */}
          {roleTab === 'owner' && (
            <div className="pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>Shop / Food Stall Details</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Stall / Shop Name
                </label>
                <div className="relative">
                  <input
                    id="register-shop-name"
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Gupta Sandwich & Juice"
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Stall Type
                </label>
                <select
                  value={stallType}
                  onChange={(e) => setStallType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                  disabled={loading}
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
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Stall Address / Location
                </label>
                <div className="relative">
                  <input
                    id="register-shop-address"
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="e.g. Counter 3, College Campus Gate, Vile Parle"
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{roleTab === 'customer' ? 'Create Customer Account' : 'Register Stall & Open Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate(`/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`)}
              className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
