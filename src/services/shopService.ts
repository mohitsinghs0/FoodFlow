import { Shop, ShopCategory, MenuItem } from '../types';
import { MOCK_SHOPS, MOCK_CATEGORIES, MOCK_MENU_ITEMS } from '../data/mockData';

// Storage keys for customer persistence
const SAVED_SHOPS_KEY = 'foodflow_saved_shops';

export const shopService = {
  async getNearbyShops(categoryId?: string, query?: string): Promise<Shop[]> {
    // Simulated network latency for realism
    await new Promise((r) => setTimeout(r, 80));

    let shops = [...MOCK_SHOPS];

    if (categoryId && categoryId !== 'all') {
      shops = shops.filter((s) => s.categories.includes(categoryId));
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      shops = shops.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.location.address.toLowerCase().includes(q) ||
          s.categories.some((c) => c.toLowerCase().includes(q))
      );
    }

    return shops;
  },

  async getShopById(shopIdOrSlug: string): Promise<Shop | null> {
    await new Promise((r) => setTimeout(r, 60));
    const cleanId = shopIdOrSlug.toLowerCase().trim();
    const found = MOCK_SHOPS.find(
      (s) => s.id === cleanId || s.slug === cleanId
    );
    return found || null;
  },

  async searchShopsAndItems(query: string): Promise<{ shops: Shop[]; items: MenuItem[] }> {
    await new Promise((r) => setTimeout(r, 100));
    const q = query.toLowerCase().trim();
    if (!q) {
      return { shops: MOCK_SHOPS.slice(0, 4), items: [] };
    }

    const matchedShops = MOCK_SHOPS.filter(
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
