import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { 
  LogIn, 
  User, 
  Store, 
  Lock, 
  Phone, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { DEMO_CUSTOMER, DEMO_OWNER, DEMO_PASSWORD } from '../services/authService';

export const LoginView: React.FC = () => {
  const { route, navigate } = useRouter();
  const { login, loginAsDemoCustomer, loginAsDemoOwner } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // Extract return/redirect query parameter if present
  const redirectTarget = route.params.redirect || '';

  const handlePostLoginRedirect = (userRole: string) => {
    if (redirectTarget) {
      // If customer attempted to go to owner area, route them to customer home instead
      if (userRole === 'customer' && redirectTarget.startsWith('/business')) {
        navigate('/');
      } else {
        navigate(redirectTarget);
      }
      return;
    }

    if (userRole === 'owner') {
      navigate('/business');
    } else {
      navigate('/');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = emailOrPhone.trim();
    if (!cleanInput) {
      setError('Please enter your email or phone number.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(cleanInput, password.trim());
      handlePostLoginRedirect(loggedUser.role);
    } catch (err: any) {
      setError(err?.message || 'Incorrect email, phone, or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomerDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const u = await loginAsDemoCustomer();
      handlePostLoginRedirect(u.role);
    } catch (err: any) {
      setError(err?.message || 'Failed to login with demo customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOwnerDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const u = await loginAsDemoOwner();
      handlePostLoginRedirect(u.role);
    } catch (err: any) {
      setError(err?.message || 'Failed to login with demo owner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 max-w-md mx-auto animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-2xl shadow-md shadow-orange-500/20 mb-3 hover:scale-105 transition-transform"
        >
          FF
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to FoodFlow
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Single login for both Foodie Customers & Stall Owners
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Phone or Email
            </label>
            <div className="relative">
              <input
                id="login-email-phone"
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="+91 98765 43210 or user@example.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                disabled={loading}
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
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

          {showForgotNotice && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <strong>Testing Tip:</strong> Demo accounts use password <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">{DEMO_PASSWORD}</code>. For newly registered accounts, use the password created during signup.
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to FoodFlow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => navigate(`/register${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`)}
              className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Prototype Testing Quick Demo Section */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Quick Prototype Access</span>
            <span className="text-[10px] text-slate-400 font-normal">1-Click Demo</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-customer-login-btn"
              type="button"
              onClick={handleQuickCustomerDemo}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-left group"
            >
              <div className="flex items-center gap-1.5 text-slate-700 group-hover:text-orange-600 font-bold text-xs">
                <User className="w-3.5 h-3.5" />
                <span>Customer Demo</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">customer@foodflow.demo</p>
            </button>

            <button
              id="demo-owner-login-btn"
              type="button"
              onClick={handleQuickOwnerDemo}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-900 hover:text-white transition-all text-left group"
            >
              <div className="flex items-center gap-1.5 text-slate-900 group-hover:text-white font-bold text-xs">
                <Store className="w-3.5 h-3.5 text-orange-600 group-hover:text-orange-400" />
                <span>Stall Owner Demo</span>
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">owner@foodflow.demo</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
