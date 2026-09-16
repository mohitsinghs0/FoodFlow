/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { FloatingCartBar } from './components/common/FloatingCartBar';
import { CartConflictModal } from './components/common/CartConflictModal';
import { QRScanModal } from './components/common/QRScanModal';

import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { ShopsView } from './views/ShopsView';
import { ShopDetailView } from './views/ShopDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderTrackerView } from './views/OrderTrackerView';
import { OrdersHistoryView } from './views/OrdersHistoryView';
import { SavedShopsView } from './views/SavedShopsView';
import { ProfileView } from './views/ProfileView';

const AppContent: React.FC = () => {
  const { route } = useRouter();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Render view based on route name
  const renderView = () => {
    const current = route || { name: 'home', path: '/', params: {} };
    switch (current.name) {
      case 'home':
        return <HomeView onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
      case 'search':
        return <SearchView />;
      case 'shops':
        return <ShopsView />;
      case 'shop-detail':
        return <ShopDetailView shopId={current.params.shopId || 'sharma-vada-pav'} />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-tracker':
        return <OrderTrackerView orderId={current.params.orderId || 'order-101'} />;
      case 'order-history':
        return <OrdersHistoryView />;
      case 'saved':
        return <SavedShopsView />;
      case 'profile':
        return <ProfileView onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
      default:
        return <HomeView onOpenQRScanner={() => setIsQRScannerOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <Header onOpenQRScanner={() => setIsQRScannerOpen(true)} />

      {/* Main Page Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {renderView()}
      </main>

      {/* Floating Quick Cart Bar (Hidden in Cart & Checkout Views) */}
      <FloatingCartBar />

      {/* Persistent Bottom Mobile Navigation Bar */}
      <BottomNav />

      {/* Single-Shop Cart Conflict Prevention Modal */}
      <CartConflictModal />

      {/* QR Scanner & Simulation Modal */}
      <QRScanModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </RouterProvider>
  );
}
