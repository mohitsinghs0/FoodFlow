import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { BusinessLayout } from '../../components/business/BusinessLayout';
import { 
  QrCode, 
  Download, 
  Printer, 
  Share2, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export const BusinessQRView: React.FC = () => {
  const { navigate } = useRouter();
  const [selectedTable, setSelectedTable] = useState<string>('counter');
  const [copied, setCopied] = useState(false);

  // Target customer URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://foodflow.app';
  const customerPath = selectedTable === 'counter' 
    ? `#/shop/sharma-vada-pav` 
    : `#/shop/sharma-vada-pav?table=${selectedTable}`;
  const fullUrl = `${baseUrl}/${customerPath}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <BusinessLayout activeTab="more" title="Stall QR Standee & Posters">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Sub-header tabs for Counter QR vs Table QRs */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedTable('counter')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                selectedTable === 'counter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Main Counter QR
            </button>
            <button
              onClick={() => setSelectedTable('1')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTable === '1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table 1
            </button>
            <button
              onClick={() => setSelectedTable('2')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTable === '2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table 2
            </button>
            <button
              onClick={() => setSelectedTable('3')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedTable === '3' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table 3
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Standee</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Menu Link'}</span>
            </button>
          </div>
        </div>

        {/* Printable Standee Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Physical Standee Card */}
          <div className="bg-white rounded-3xl border-4 border-slate-900 p-8 shadow-xl text-center space-y-5 max-w-sm mx-auto w-full">
            {/* FoodFlow Header */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                F
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">FoodFlow Counter</span>
            </div>

            {/* Stall Branding */}
            <div>
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Sharma Vada Pav</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Gate 2, Andheri West Metro Station</p>
              {selectedTable !== 'counter' && (
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-black uppercase">
                  Dine-In • Table {selectedTable}
                </div>
              )}
            </div>

            {/* Clean QR Graphic */}
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 inline-block shadow-xs">
              <img
                src={qrImageUrl}
                alt="Sharma Vada Pav QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-1 text-slate-800">
              <div className="font-black text-xs uppercase tracking-wider text-orange-600">
                1. SCAN • 2. ORDER • 3. COLLECT
              </div>
              <p className="text-[11px] text-slate-500">
                No app download required. View live menu & track token number on your phone.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Powered by FoodFlow
            </div>
          </div>

          {/* Configuration & Quick Preview Panel */}
          <div className="space-y-4 text-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">How to use this QR Code:</h3>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">1</span>
                  <span><strong>Place at the counter:</strong> Customers standing in line can scan to view the live menu and order immediately instead of waiting for staff.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">2</span>
                  <span><strong>Table standees:</strong> Print table QRs so seated customers can order food from their seats without leaving the table.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0">3</span>
                  <span><strong>Live sync:</strong> When you mark an item unavailable in the Business app, it disables instantly on this QR code.</span>
                </li>
              </ul>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] break-all text-slate-700">
                {fullUrl}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => navigate('/shop/sharma-vada-pav')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Test Customer Experience</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};
