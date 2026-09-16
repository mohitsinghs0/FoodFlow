import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { orderService } from '../../services/orderService';
import { Home, Search, ReceiptText, Heart, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { route, navigate } = useRouter();
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    const checkActiveOrders = async () => {
      const orders = await orderService.getCustomerOrders();
      const active = orders.some(
        (o) =>
          o.orderStatus === 'PENDING' ||
          o.orderStatus === 'ACCEPTED' ||
          o.orderStatus === 'PREPARING' ||
          o.orderStatus === 'READY'
      );
      setHasActiveOrder(active);
    };

    checkActiveOrders();
    const interval = setInterval(checkActiveOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'nav-home',
      name: 'Home',
      icon: Home,
      path: '/',
      isActive: route.name === 'home' || route.name === 'shops',
    },
    {
      id: 'nav-search',
      name: 'Search',
      icon: Search,
      path: '/search',
      isActive: route.name === 'search',
    },
    {
      id: 'nav-orders',
      name: 'Orders',
      icon: ReceiptText,
      path: '/orders',
      isActive: route.name === 'order-history' || route.name === 'order-tracker',
      badge: hasActiveOrder,
    },
    {
      id: 'nav-saved',
      name: 'Saved',
      icon: Heart,
      path: '/saved',
      isActive: route.name === 'saved',
    },
    {
      id: 'nav-profile',
      name: 'Profile',
      icon: User,
      path: '/profile',
      isActive: route.name === 'profile',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-pb"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                item.isActive ? 'text-orange-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight font-medium ${
                  item.isActive ? 'font-bold text-orange-600' : 'text-slate-600'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
