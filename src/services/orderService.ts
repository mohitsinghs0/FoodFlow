import { Order, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/mockData';

const ORDERS_STORAGE_KEY = 'foodflow_customer_orders';
const LISTENERS_MAP = new Map<string, Set<(order: Order) => void>>();

export const orderService = {
  getStoredOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  },

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // fallback
    }
  },

  async getCustomerOrders(): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 60));
    return this.getStoredOrders();
  },

  async getOrder(orderId: string): Promise<Order | null> {
    await new Promise((r) => setTimeout(r, 40));
    const orders = this.getStoredOrders();
    return orders.find((o) => o.id === orderId) || null;
  },

  async createOrder(data: {
    shopId: string;
    shopName: string;
    shopImage?: string;
    shopLocation: string;
    customerName: string;
    customerPhone: string;
    orderType: 'TAKEAWAY' | 'DINE_IN';
    tableNumber?: string;
    paymentMethod: 'CASH_AT_COUNTER' | 'PAY_ONLINE';
    items: {
      id: string;
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      isVeg: boolean;
    }[];
    subtotal: number;
    total: number;
    estimatedPreparationMinutes: string;
    instructions?: string;
  }): Promise<Order> {
    await new Promise((r) => setTimeout(r, 120));
    const orders = this.getStoredOrders();

    // Generate token number (random realistic 3-digit counter token)
    const tokenInt = Math.floor(120 + Math.random() * 80);
    const tokenNumber = `#${tokenInt}`;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      shopId: data.shopId,
      shopName: data.shopName,
      shopImage: data.shopImage,
      shopLocation: data.shopLocation,
      customerId: 'cust-1',
      customerName: data.customerName || 'Guest Customer',
      customerPhone: data.customerPhone || '+91 98765 00000',
      tokenNumber,
      orderType: data.orderType,
      tableNumber: data.tableNumber,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'PAY_ONLINE' ? 'PAID' : 'COLLECT_ON_DELIVERY',
      orderStatus: 'PENDING',
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      estimatedPreparationMinutes: data.estimatedPreparationMinutes,
      createdAt: new Date().toISOString(),
      instructions: data.instructions,
    };

    const updated = [newOrder, ...orders];
    this.saveOrders(updated);
    this.notifyOrderListeners(newOrder);

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const order = { ...orders[index], orderStatus: status };
    if (status === 'READY') {
      order.readyAt = new Date().toISOString();
    } else if (status === 'COMPLETED') {
      order.completedAt = new Date().toISOString();
    }

    orders[index] = order;
    this.saveOrders(orders);
    this.notifyOrderListeners(order);

    return order;
  },

  subscribeToOrder(orderId: string, listener: (order: Order) => void): () => void {
    if (!LISTENERS_MAP.has(orderId)) {
      LISTENERS_MAP.set(orderId, new Set());
    }
    LISTENERS_MAP.get(orderId)!.add(listener);

    return () => {
      const set = LISTENERS_MAP.get(orderId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          LISTENERS_MAP.delete(orderId);
        }
      }
    };
  },

  notifyOrderListeners(order: Order): void {
    const listeners = LISTENERS_MAP.get(order.id);
    if (listeners) {
      listeners.forEach((listener) => listener(order));
    }
  },
};
