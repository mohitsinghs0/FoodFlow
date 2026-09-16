import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppRoute = 
  | 'home'
  | 'search'
  | 'shops'
  | 'shop-detail'
  | 'cart'
  | 'checkout'
  | 'order-tracker'
  | 'order-history'
  | 'saved'
  | 'profile'
  // Business Owner Routes
  | 'business-dashboard'
  | 'business-orders'
  | 'business-order-detail'
  | 'business-history'
  | 'business-menu'
  | 'business-menu-new'
  | 'business-menu-edit'
  | 'business-availability'
  | 'business-shop'
  | 'business-qr'
  | 'business-sales'
  | 'business-notifications'
  | 'business-settings';

export interface RouteState {
  name: AppRoute;
  path: string;
  params: Record<string, string>;
  searchQuery?: string;
}

interface RouterContextType {
  route: RouteState;
  currentRoute: RouteState;
  navigate: (path: string) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function parsePath(pathname: string): RouteState {
  const clean = pathname.replace(/^#/, '').split('?')[0] || '/';
  
  // Business Routes matching
  if (clean === '/business' || clean === '/business/' || clean.startsWith('/business/dashboard')) {
    return { name: 'business-dashboard', path: '/business', params: {} };
  }

  // /business/orders/:orderId
  const bizOrderMatch = clean.match(/^\/business\/orders\/([^/]+)/);
  if (bizOrderMatch && bizOrderMatch[1] !== '') {
    return { name: 'business-order-detail', path: clean, params: { orderId: bizOrderMatch[1] } };
  }

  if (clean === '/business/orders') {
    return { name: 'business-orders', path: '/business/orders', params: {} };
  }

  if (clean === '/business/history') {
    return { name: 'business-history', path: '/business/history', params: {} };
  }

  if (clean === '/business/menu/new') {
    return { name: 'business-menu-new', path: '/business/menu/new', params: {} };
  }

  const bizMenuEditMatch = clean.match(/^\/business\/menu\/([^/]+)/);
  if (bizMenuEditMatch && bizMenuEditMatch[1] !== '') {
    return { name: 'business-menu-edit', path: clean, params: { itemId: bizMenuEditMatch[1] } };
  }

  if (clean === '/business/menu') {
    return { name: 'business-menu', path: '/business/menu', params: {} };
  }

  if (clean === '/business/availability') {
    return { name: 'business-availability', path: '/business/availability', params: {} };
  }

  if (clean === '/business/shop') {
    return { name: 'business-shop', path: '/business/shop', params: {} };
  }

  if (clean === '/business/qr') {
    return { name: 'business-qr', path: '/business/qr', params: {} };
  }

  if (clean === '/business/sales') {
    return { name: 'business-sales', path: '/business/sales', params: {} };
  }

  if (clean === '/business/notifications') {
    return { name: 'business-notifications', path: '/business/notifications', params: {} };
  }

  if (clean === '/business/settings') {
    return { name: 'business-settings', path: '/business/settings', params: {} };
  }

  // Customer Routes matching
  // Match /shop/:shopId
  const shopMatch = clean.match(/^\/shop\/([^/]+)/);
  if (shopMatch) {
    return {
      name: 'shop-detail',
      path: clean,
      params: { shopId: shopMatch[1] },
    };
  }

  // Match /order/:orderId or /orders/:orderId
  const orderMatch = clean.match(/^\/orders?\/([^/]+)/);
  if (orderMatch && orderMatch[1] !== '') {
    return {
      name: 'order-tracker',
      path: clean,
      params: { orderId: orderMatch[1] },
    };
  }

  if (clean === '/orders') {
    return { name: 'order-history', path: '/orders', params: {} };
  }

  if (clean === '/search') {
    return { name: 'search', path: '/search', params: {} };
  }

  if (clean === '/shops') {
    return { name: 'shops', path: '/shops', params: {} };
  }

  if (clean === '/cart') {
    return { name: 'cart', path: '/cart', params: {} };
  }

  if (clean === '/checkout') {
    return { name: 'checkout', path: '/checkout', params: {} };
  }

  if (clean === '/saved') {
    return { name: 'saved', path: '/saved', params: {} };
  }

  if (clean === '/profile') {
    return { name: 'profile', path: '/profile', params: {} };
  }

  return { name: 'home', path: '/', params: {} };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      return [hash || '/'];
    }
    return ['/'];
  });

  const currentPath = history[history.length - 1] || '/';
  const route = parsePath(currentPath);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      setHistory((prev) => {
        if (prev[prev.length - 1] !== hash) {
          return [...prev, hash];
        }
        return prev;
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    setHistory((prev) => [...prev, path]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const prevPath = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      window.location.hash = prevPath;
    } else {
      navigate('/');
    }
  }, [history, navigate]);

  return (
    <RouterContext.Provider
      value={{
        route,
        currentRoute: route,
        navigate,
        goBack,
        canGoBack: history.length > 1 && route.name !== 'home',
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
