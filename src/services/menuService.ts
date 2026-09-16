import { MenuItem } from '../types';
import { MOCK_MENU_ITEMS } from '../data/mockData';

export const menuService = {
  async getShopMenu(shopId: string): Promise<MenuItem[]> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_MENU_ITEMS.filter((item) => item.shopId === shopId);
  },

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    await new Promise((r) => setTimeout(r, 40));
    const found = MOCK_MENU_ITEMS.find((item) => item.id === itemId);
    return found || null;
  },

  async getShopCategoriesWithItems(shopId: string): Promise<{ categoryId: string; items: MenuItem[] }[]> {
    const items = await this.getShopMenu(shopId);
    const categoryMap = new Map<string, MenuItem[]>();

    items.forEach((item) => {
      const current = categoryMap.get(item.categoryId) || [];
      categoryMap.set(item.categoryId, [...current, item]);
    });

    const result: { categoryId: string; items: MenuItem[] }[] = [];
    categoryMap.forEach((catItems, categoryId) => {
      result.push({ categoryId, items: catItems });
    });

    return result;
  },
};
