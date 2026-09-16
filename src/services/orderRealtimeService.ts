import { Order } from '../types';
import { orderService } from './orderService';

type OrderEventCallback = (order: Order) => void;
type OrdersListCallback = (orders: Order[]) => void;

/**
 * Frontend WebSocket / Realtime event bus abstraction.
 * Currently backed by browser in-memory dispatch and localStorage storage events,
 * and architected for 1:1 drop-in replacement with WebSockets, SSE, or Firebase Realtime.
 */
class OrderRealtimeService {
  private isConnected: boolean = true;
  private connectionListeners = new Set<(status: boolean) => void>();

  public subscribeToShop(shopId: string, onOrdersUpdate: OrdersListCallback): () => void {
    // Connect to orderService pub/sub
    const unsubscribeOrderService = orderService.subscribeToShopOrders(shopId, onOrdersUpdate);

    // Cross-tab synchronization via window storage events
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'foodflow_customer_orders') {
        orderService.getShopOrders(shopId).then((orders) => {
          onOrdersUpdate(orders);
        });
      }
    };

    window.addEventListener('storage', storageHandler);

    return () => {
      unsubscribeOrderService();
      window.removeEventListener('storage', storageHandler);
    };
  }

  public subscribeToOrder(orderId: string, onOrderUpdate: OrderEventCallback): () => void {
    return orderService.subscribeToOrder(orderId, onOrderUpdate);
  }

  public setConnectionStatus(online: boolean): void {
    this.isConnected = online;
    this.connectionListeners.forEach((fn) => fn(online));
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public onConnectionChange(listener: (status: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  public async simulateIncomingOrder(shopId: string = 'sharma-vada-pav'): Promise<Order> {
    return orderService.simulateIncomingOrder(shopId);
  }
}

export const orderRealtimeService = new OrderRealtimeService();
