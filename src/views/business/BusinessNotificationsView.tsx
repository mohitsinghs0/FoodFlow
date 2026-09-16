import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  Bell, 
  CheckCircle2, 
  ShoppingBag, 
  CreditCard, 
  AlertCircle, 
  Volume2, 
  Trash2, 
  Check,
  ChevronRight
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { BusinessNotification } from '../../types';

export const BusinessNotificationsView: React.FC = () => {
  const { navigate } = useRouter();
  const [notifications, setNotifications] = useState<BusinessNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    const data = await notificationService.getNotifications('sharma-vada-pav');
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead('sharma-vada-pav');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: BusinessNotification['type']) => {
    switch (type) {
      case 'ORDER_NEW':
        return <ShoppingBag className="w-5 h-5 text-orange-600" />;
      case 'ORDER_READY':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatElapsed = (iso: string) => {
    try {
      const diffMin = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
      if (diffMin === 0) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      return `${Math.floor(diffMin / 60)}h ago`;
    } catch {
      return 'Today';
    }
  };

  return (
    <BusinessLayout
      activeTab="more"
      title="Alerts & Notifications"
      actions={
        <button
          onClick={handleMarkAllRead}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      }
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Test Alert Sound Bar */}
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Sound Alert System</span>
              <p className="text-orange-700">Audio chimes play on new incoming orders and ready pickups.</p>
            </div>
          </div>
          <button
            onClick={() => notificationService.playNewOrderAlert()}
            className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-xs"
          >
            Test Chime
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No alerts found.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className={`p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                  notif.isRead ? 'hover:bg-slate-50/50' : 'bg-orange-50/30 hover:bg-orange-50/60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.isRead ? 'bg-slate-100' : 'bg-white shadow-xs'
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-bold text-slate-900 truncate ${!notif.isRead ? 'text-orange-950' : ''}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {formatElapsed(notif.createdAt)}
                    </span>
                  </div>
                </div>

                {notif.orderId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/business/orders/${notif.orderId}`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};
