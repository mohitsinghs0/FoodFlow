import { Shop, ShopCategory, MenuItem } from '../types';
import { MOCK_SHOPS, MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '../data/mockData';
import { firestoreSync } from './firestoreSyncService';
import { calculateDistanceKm, DEFAULT_CUSTOMER_LOCATION } from './geoService';

// Storage keys for persistence
const SHOPS_STORAGE_KEY = 'foodflow_shops_list';
const SAVED_SHOPS_KEY = 'foodflow_saved_shops';

const SHOP_LISTENERS = new Map<string, Set<(shop: Shop) => void>>();

export const shopService = {
  getStoredShops(): Shop[] {
    try {
      const stored = localStorage.getItem(SHOPS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return MOCK_SHOPS;
  },

  saveStoredShops(shops: Shop[]): void {
    try {
      localStorage.setItem(SHOPS_STORAGE_KEY, JSON.stringify(shops));
    } catch {
      // fallback
    }
  },

  async getNearbyShops(
    categoryId?: string,
    query?: string,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<Shop[]> {
    let shops: Shop[] = [];
    try {
      const remoteShops = await firestoreSync.getShops();
      if (remoteShops && remoteShops.length > 0) {
        shops = remoteShops;
      } else {
        shops = this.getStoredShops();
      }
    } catch {
      shops = this.getStoredShops();
    }

    const loc = userLocation || DEFAULT_CUSTOMER_LOCATION;

    // Recalculate distance for each shop based on coordinates
    shops = shops.map((s) => {
      const shopLat = s.latitude || s.location?.latitude;
      const shopLng = s.longitude || s.location?.longitude;
      if (shopLat && shopLng && loc.latitude && loc.longitude) {
        const dist = calculateDistanceKm(loc.latitude, loc.longitude, shopLat, shopLng);
        return {
          ...s,
          location: {
            ...s.location,
            distanceKm: dist,
          },
        };
      }
      return s;
    });

    // Sort by nearest distance first
    shops.sort((a, b) => (a.location?.distanceKm ?? 999) - (b.location?.distanceKm ?? 999));

    if (categoryId && categoryId !== 'all') {
      shops = shops.filter((s) => s.categories && s.categories.includes(categoryId));
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      shops = shops.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.tagline && s.tagline.toLowerCase().includes(q)) ||
          (s.location?.address && s.location.address.toLowerCase().includes(q)) ||
          (s.categories && s.categories.some((c) => c.toLowerCase().includes(q)))
      );
    }

    return shops;
  },

  async getShop(shopIdOrSlug: string): Promise<Shop | null> {
    return this.getShopById(shopIdOrSlug);
  },

  async getShopById(shopIdOrSlug: string): Promise<Shop | null> {
    await new Promise((r) => setTimeout(r, 40));
    const cleanId = shopIdOrSlug.toLowerCase().trim();
    const shops = this.getStoredShops();
    const found = shops.find(
      (s) => s.id === cleanId || s.slug === cleanId
    );
    return found || null;
  },

  async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop | null> {
    await new Promise((r) => setTimeout(r, 60));
    const shops = this.getStoredShops();
    const idx = shops.findIndex((s) => s.id === shopId || s.slug === shopId);
    if (idx === -1) return null;

    const updated = { ...shops[idx], ...updates };
    shops[idx] = updated;
    this.saveStoredShops(shops);

    const listeners = SHOP_LISTENERS.get(shopId);
    if (listeners) {
      listeners.forEach((fn) => fn(updated));
    }

    return updated;
  },

  async updateShopStatus(shopId: string, isOpen: boolean): Promise<Shop | null> {
    return this.updateShop(shopId, { isOpen });
  },

  subscribeToShop(shopId: string, listener: (shop: Shop) => void): () => void {
    if (!SHOP_LISTENERS.has(shopId)) {
      SHOP_LISTENERS.set(shopId, new Set());
    }
    SHOP_LISTENERS.get(shopId)!.add(listener);

    return () => {
      const set = SHOP_LISTENERS.get(shopId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          SHOP_LISTENERS.delete(shopId);
        }
      }
    };
  },

  async searchShopsAndItems(query: string): Promise<{ shops: Shop[]; items: MenuItem[] }> {
    await new Promise((r) => setTimeout(r, 80));
    const q = query.toLowerCase().trim();
    const shops = this.getStoredShops();
    if (!q) {
      return { shops: shops.slice(0, 4), items: [] };
    }

    const matchedShops = shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.stallType.toLowerCase().includes(q) ||
        s.location.landmark.toLowerCase().includes(q)
    );

    const matchedItems = MOCK_MENU_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );

    return { shops: matchedShops, items: matchedItems };
  },

  async getCategories(): Promise<ShopCategory[]> {
    return MOCK_CATEGORIES;
  },

  getSavedShopIds(): string[] {
    try {
      const stored = localStorage.getItem(SAVED_SHOPS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return ['sharma-vada-pav', 'college-canteen'];
  },

  toggleSaveShop(shopId: string): boolean {
    const current = this.getSavedShopIds();
    let updated: string[];
    const exists = current.includes(shopId);
    if (exists) {
      updated = current.filter((id) => id !== shopId);
    } else {
      updated = [...current, shopId];
    }
    try {
      localStorage.setItem(SAVED_SHOPS_KEY, JSON.stringify(updated));
    } catch {
      // fallback
    }
    return !exists;
  },

  isShopSaved(shopId: string): boolean {
    return this.getSavedShopIds().includes(shopId);
  },
};
