import { SalesSummary } from '../types';
import { orderService } from './orderService';

export const salesService = {
  async getSalesSummary(shopId: string = 'sharma-vada-pav', period: 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' = 'TODAY'): Promise<SalesSummary> {
    await new Promise((r) => setTimeout(r, 40));
    const allOrders = (await orderService.getShopOrders(shopId)).filter(o => o.orderStatus !== 'CANCELLED');

    // Default target metrics based on specifications for TODAY
    if (period === 'TODAY') {
      const completedOrActive = allOrders;
      const totalOrders = completedOrActive.length || 24;
      
      let cashSales = 0;
      let onlineSales = 0;
      const itemCountMap = new Map<string, { count: number; revenue: number }>();

      completedOrActive.forEach((o) => {
        if (o.paymentMethod === 'CASH_AT_COUNTER') {
          cashSales += o.total;
        } else {
          onlineSales += o.total;
        }

        o.items.forEach((item) => {
          const current = itemCountMap.get(item.name) || { count: 0, revenue: 0 };
          current.count += item.quantity;
          current.revenue += item.price * item.quantity;
          itemCountMap.set(item.name, current);
        });
      });

      // Default realistic fallbacks if mock orders are empty
      if (cashSales === 0 && onlineSales === 0) {
        cashSales = 720;
        onlineSales = 560;
      }

      const totalSales = cashSales + onlineSales;
      const averageOrderValue = Math.round(totalSales / (totalOrders || 1));

      const topSellingItems = Array.from(itemCountMap.entries())
        .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      if (topSellingItems.length === 0) {
        topSellingItems.push(
          { name: 'Classic Mumbai Vada Pav', count: 42, revenue: 840 },
          { name: 'Special Cutting Chai', count: 28, revenue: 420 },
          { name: 'Cheese Burst Vada Pav', count: 18, revenue: 630 },
          { name: 'Crispy Samosa Pav', count: 14, revenue: 350 },
          { name: 'Masala Grilled Sandwich', count: 9, revenue: 450 }
        );
      }

      return {
        period: 'TODAY',
        totalOrders,
        totalSales,
        cashSales,
        onlineSales,
        averageOrderValue,
        topSellingItems,
      };
    }

    if (period === 'YESTERDAY') {
      return {
        period: 'YESTERDAY',
        totalOrders: 31,
        totalSales: 1640,
        cashSales: 980,
        onlineSales: 660,
        averageOrderValue: 53,
        topSellingItems: [
          { name: 'Classic Mumbai Vada Pav', count: 48, revenue: 960 },
          { name: 'Special Cutting Chai', count: 35, revenue: 525 },
          { name: 'Crispy Samosa Pav', count: 20, revenue: 500 },
          { name: 'Cheese Burst Vada Pav', count: 14, revenue: 490 },
        ],
      };
    }

    if (period === 'THIS_WEEK') {
      return {
        period: 'THIS_WEEK',
        totalOrders: 184,
        totalSales: 9850,
        cashSales: 5400,
        onlineSales: 4450,
        averageOrderValue: 54,
        topSellingItems: [
          { name: 'Classic Mumbai Vada Pav', count: 310, revenue: 6200 },
          { name: 'Special Cutting Chai', count: 215, revenue: 3225 },
          { name: 'Cheese Burst Vada Pav', count: 95, revenue: 3325 },
          { name: 'Crispy Samosa Pav', count: 88, revenue: 2200 },
          { name: 'Fresh Lime Soda', count: 62, revenue: 1860 },
        ],
      };
    }

    // THIS_MONTH
    return {
      period: 'THIS_MONTH',
      totalOrders: 742,
      totalSales: 41200,
      cashSales: 22800,
      onlineSales: 18400,
      averageOrderValue: 55,
      topSellingItems: [
        { name: 'Classic Mumbai Vada Pav', count: 1240, revenue: 24800 },
        { name: 'Special Cutting Chai', count: 890, revenue: 13350 },
        { name: 'Cheese Burst Vada Pav', count: 380, revenue: 13300 },
        { name: 'Crispy Samosa Pav', count: 320, revenue: 8000 },
        { name: 'Masala Grilled Sandwich', count: 190, revenue: 9500 },
      ],
    };
  },

  async getTodaySales(shopId: string = 'sharma-vada-pav'): Promise<SalesSummary> {
    return this.getSalesSummary(shopId, 'TODAY');
  },
};
