import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  TrendingUp, 
  ShoppingBag, 
  IndianRupee, 
  CreditCard, 
  Banknote, 
  Award, 
  Calendar,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { salesService } from '../../services/salesService';
import { SalesSummary } from '../../types';

export const BusinessSalesView: React.FC = () => {
  const { activeShopId, currentBusiness } = useAuth();
  const targetShopId = activeShopId || currentBusiness?.id || 'demo-shop-001';

  const [period, setPeriod] = useState<'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH'>('TODAY');
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    salesService.getSalesSummary(targetShopId, period).then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, [targetShopId, period]);

  const printReport = () => {
    window.print();
  };

  return (
    <BusinessLayout activeTab="sales" title="Sales & Cash Reconciliation">
      <div className="space-y-6">
        {/* Period Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setPeriod('TODAY')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === 'TODAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('YESTERDAY')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === 'YESTERDAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setPeriod('THIS_WEEK')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === 'THIS_WEEK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('THIS_MONTH')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                period === 'THIS_MONTH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={printReport}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Summary</span>
          </button>
        </div>

        {/* Primary Metrics 4-Box Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">
              ₹{summary?.totalSales.toLocaleString() || '1,280'}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Gross sales for {period.toLowerCase().replace('_', ' ')}
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {summary?.totalOrders || 24}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Avg value ₹{summary?.averageOrderValue || 53} per order
            </p>
          </div>

          {/* Cash Collected */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cash in Counter</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600">
              ₹{summary?.cashSales.toLocaleString() || '720'}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Physical cash received at stall
            </p>
          </div>

          {/* Online Payments */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Online UPI / Card</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-600">
              ₹{summary?.onlineSales.toLocaleString() || '560'}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Direct settlement to merchant UPI
            </p>
          </div>
        </div>

        {/* Payment Reconciliation Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Cash Drawer & Payment Reconciliation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-emerald-950">Cash Box Match</span>
                </div>
                <span className="text-xs font-black text-emerald-700">₹{summary?.cashSales || 720}</span>
              </div>
              <p className="text-xs text-emerald-800">
                Ensure physical bills and coins in your cash drawer equal this amount at end of shift.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-sm text-purple-950">UPI Bank Settlement</span>
                </div>
                <span className="text-xs font-black text-purple-700">₹{summary?.onlineSales || 560}</span>
              </div>
              <p className="text-xs text-purple-800">
                Verified digital credit to sharmavadapav@oksbi. No cash handling needed.
              </p>
            </div>
          </div>
        </div>

        {/* Top-Selling Items Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Top Selling Items
              </h3>
            </div>
            <span className="text-xs text-slate-500">By quantity sold</span>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.topSellingItems.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                    <span className="text-xs text-slate-500">{item.count} portions sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-900">₹{item.revenue}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Revenue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};
