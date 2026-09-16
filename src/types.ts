export type StallType = 
  | 'Thela / Food Stall'
  | 'College Canteen'
  | 'Tea Tapri'
  | 'Fast Food Counter'
  | 'Sandwich Cart'
  | 'Juice Point';

export interface ShopCategory {
  id: string;
  name: string;
  iconName: string;
  description?: string;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  stallType: StallType;
  tagline: string;
  description: string;
  image: string;
  bannerImage: string;
  location: {
    address: string;
    landmark: string;
    distanceKm: number;
  };
  isOpen: boolean;
  openingHours: string;
  rating: number;
  totalReviews: number;
  categories: string[];
  preparationTimeMinutes: string; // e.g. "5-10" or "10-15"
  isPureVeg: boolean;
  tableServiceAvailable: boolean;
  featuredItem?: string;
}

export interface MenuItem {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isVeg: boolean;
  isBestseller?: boolean;
  preparationTimeMin?: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  shopId: string;
}

export interface Cart {
  items: CartItem[];
  shopId: string | null;
  shopName: string | null;
  shopImage?: string;
}

export type OrderType = 'TAKEAWAY' | 'DINE_IN';

export type PaymentMethod = 'CASH_AT_COUNTER' | 'PAY_ONLINE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'COLLECT_ON_DELIVERY';

export type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  shopImage?: string;
  shopLocation: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tokenNumber: string; // e.g. "#142"
  orderType: OrderType;
  tableNumber?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  estimatedPreparationMinutes: string;
  createdAt: string;
  readyAt?: string;
  completedAt?: string;
  instructions?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  savedShopIds: string[];
  preferredLocation: string;
}
