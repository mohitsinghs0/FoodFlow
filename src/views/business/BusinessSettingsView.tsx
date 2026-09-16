import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  Bell, 
  Users, 
  ShieldCheck, 
  ArrowLeftRight, 
  RotateCcw, 
  Check, 
  Store,
  Smartphone,
  LogOut,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { MOCK_BUSINESS_OWNER } from '../../data/mockData';

export const BusinessSettingsView: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, currentBusiness, logout } = useAuth();
  const [sound, setSound] = useState(() => localStorage.getItem('foodflow_sound') !== 'false');
  const [rushMode, setRushMode] = useState(() => localStorage.getItem('foodflow_rush_mode') === 'true');
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleToggleSound = () => {
    const next = !sound;
    setSound(next);
    localStorage.setItem('foodflow_sound', String(next));
    if (next) notificationService.playNewOrderAlert();
  };

  const handleToggleRushMode = () => {
    const next = !rushMode;
    setRushMode(next);
    localStorage.setItem('foodflow_rush_mode', String(next));
  };

  const handleRequestPush = async () => {
    const granted = await notificationService.requestNotificationPermission();
    setBrowserAlerts(granted);
  };

  const handleResetData = () => {
    if (confirm('Reset all demo orders and menu items to default state?')) {
      localStorage.removeItem('foodflow_customer_orders');
      localStorage.removeItem('foodflow_menu_items');
      localStorage.removeItem('foodflow_shops_list');
      localStorage.removeItem('foodflow_business_notifications');
      setResetting(true);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BusinessLayout activeTab="more" title="Preferences & Settings">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Owner Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              {(currentUser?.fullName || 'O').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  {currentUser?.fullName || 'Stall Owner'}
                </h3>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {currentUser?.role || 'OWNER'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentBusiness?.name || 'Registered Stall'}
              </p>
              <p className="text-xs text-slate-400">
                {currentUser?.phone} {currentUser?.email && `• ${currentUser?.email}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/business/shop')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
          >
            Edit Shop
          </button>
        </div>

        {/* Counter Operation Preferences */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Counter Sound & Notifications
          </h3>

          <div className="space-y-3 divide-y divide-slate-100">
            {/* Audio chime toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  sound ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Sound Chime on New Orders</div>
                  <div className="text-[11px] text-slate-500">Audible bell whenever a customer places an order</div>
                </div>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  sound ? 'bg-orange-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    sound ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Browser notifications */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Browser Push Notifications</div>
                  <div className="text-[11px] text-slate-500">Alerts when the phone screen is locked or browser minimized</div>
                </div>
              </div>
              <button
                onClick={handleRequestPush}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                {browserAlerts ? 'Enabled' : 'Enable'}
              </button>
            </div>

            {/* Default to Rush Mode */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Default to Rush Mode View</div>
                  <div className="text-[11px] text-slate-500">Auto-launch full screen counter view during peak hours</div>
                </div>
              </div>
              <button
                onClick={handleToggleRushMode}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  rushMode ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    rushMode ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Multi-role preview placeholder (Section 30) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Staff & Counter Permissions (Role Architecture)
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <span className="font-bold text-purple-900 block">Owner</span>
              <span className="text-[10px] text-purple-700">Full control & sales</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block">Manager</span>
              <span className="text-[10px] text-slate-500">Menu & orders</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="font-bold text-slate-800 block">Counter Staff</span>
              <span className="text-[10px] text-slate-500">Accept & prep only</span>
            </div>
          </div>
        </div>

        {/* Switch to Customer Web App and Reset Data */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/shop/sharma-vada-pav')}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>Switch to Customer Web App (Customer Mode)</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full py-2.5 px-4 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Orders & Menu to Defaults</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Owner Account</span>
          </button>
        </div>
      </div>
    </BusinessLayout>
  );
};
