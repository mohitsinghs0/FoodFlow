import React from 'react';
import { useRouter } from '../context/RouterContext';
import { LiveOrderTracker } from '../components/order/LiveOrderTracker';
import { ArrowLeft, Home, ReceiptText } from 'lucide-react';

interface OrderTrackerViewProps {
  orderId: string;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ orderId }) => {
  const { navigate } = useRouter();

  return (
    <div className="pb-24">
      {/* Top action header */}
      <div className="max-w-lg mx-auto px-4 pt-3 sm:pt-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
      </div>

      <LiveOrderTracker orderId={orderId} />
    </div>
  );
};
