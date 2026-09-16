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
  | 'profile';

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
