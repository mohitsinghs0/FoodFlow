import { AuthUser, OwnerBusinessContext, UserRole } from '../types';
import { firestoreSync } from './firestoreSyncService';

// Storage keys
const AUTH_USER_KEY = 'foodflow_auth_user';
const AUTH_BUSINESS_KEY = 'foodflow_auth_business';
const REGISTERED_USERS_KEY = 'foodflow_registered_users';
const REGISTERED_SHOPS_KEY = 'foodflow_registered_shops';

// Centralized Demo Accounts
export const DEMO_CUSTOMER: AuthUser = {
  id: 'demo-customer-001',
  fullName: 'Demo Customer',
  phone: '+91 98765 43210',
  email: 'customer@foodflow.demo',
  role: 'customer',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEMO_OWNER: AuthUser = {
  id: 'demo-owner-001',
  fullName: 'Demo Owner (Ramesh Sharma)',
  phone: '+91 98200 12345',
  email: 'owner@foodflow.demo',
  role: 'owner',
  shopId: 'demo-shop-001',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const DEMO_SHOP: OwnerBusinessContext = {
  id: 'demo-shop-001',
  name: 'Sharma Vada Pav',
  ownerId: 'demo-owner-001',
  phone: '+91 98200 12345',
  address: 'Gate 2, Andheri West Metro Station, Mumbai',
  stallType: 'Thela / Food Stall',
  isOpen: true,
  image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  rating: 4.8,
};

// Demo password for prototype testing
export const DEMO_PASSWORD = 'demo123';

interface StoredAccount {
  user: AuthUser;
  passwordHash: string;
  shop?: OwnerBusinessContext;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private currentBusiness: OwnerBusinessContext | null = null;
  private listeners: Set<(user: AuthUser | null, business: OwnerBusinessContext | null) => void> = new Set();

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedBusiness = localStorage.getItem(AUTH_BUSINESS_KEY);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
      if (storedBusiness) {
        this.currentBusiness = JSON.parse(storedBusiness);
      }
    } catch (err) {
      console.warn('[AuthService] Error restoring session:', err);
      this.currentUser = null;
      this.currentBusiness = null;
    }
  }

  private persistSession(user: AuthUser | null, business: OwnerBusinessContext | null): void {
    this.currentUser = user;
    this.currentBusiness = business;

    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }

    if (business) {
      localStorage.setItem(AUTH_BUSINESS_KEY, JSON.stringify(business));
    } else {
      localStorage.removeItem(AUTH_BUSINESS_KEY);
    }

    this.notifyListeners();
  }

  public subscribe(callback: (user: AuthUser | null, business: OwnerBusinessContext | null) => void): () => void {
    this.listeners.add(callback);
    // Initial call
    callback(this.currentUser, this.currentBusiness);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentUser, this.currentBusiness);
      } catch (err) {
        console.error('[AuthService] Listener error:', err);
      }
    });
  }

  private getRegisteredAccounts(): StoredAccount[] {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [
      {
        user: DEMO_CUSTOMER,
        passwordHash: DEMO_PASSWORD,
      },
      {
        user: DEMO_OWNER,
        passwordHash: DEMO_PASSWORD,
        shop: DEMO_SHOP,
      },
    ];
  }

  private saveRegisteredAccounts(accounts: StoredAccount[]): void {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));
    } catch (err) {
      console.warn('[AuthService] Failed saving registered accounts:', err);
    }
  }

  /**
   * Check if current user is logged in
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get currently authenticated user
   */
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Get active business context for shop owners
   */
  public getCurrentBusiness(): OwnerBusinessContext | null {
    return this.currentBusiness;
  }

  /**
   * Refresh session from storage or remote Firestore
   */
  public async refreshSession(): Promise<{ user: AuthUser | null; business: OwnerBusinessContext | null }> {
    this.restoreSession();
    if (this.currentUser) {
      try {
        const remote = await firestoreSync.getUser(this.currentUser.id);
        if (remote) {
          this.currentUser = {
            ...this.currentUser,
            fullName: remote.fullName || this.currentUser.fullName,
            phone: remote.phone || this.currentUser.phone,
            email: remote.email || this.currentUser.email,
            role: remote.role || this.currentUser.role,
          };
          this.persistSession(this.currentUser, this.currentBusiness);
        }
      } catch {
        // offline or local mode
      }
    }
    return { user: this.currentUser, business: this.currentBusiness };
  }

  /**
   * Login with email or phone + password
   */
  public async login(credentials: { emailOrPhone: string; password?: string }): Promise<{ user: AuthUser; business?: OwnerBusinessContext }> {
    await new Promise((resolve) => setTimeout(resolve, 150)); // Realistic network latency

    const rawInput = credentials.emailOrPhone.trim().toLowerCase();
    const cleanPhone = credentials.emailOrPhone.trim().replace(/\s+/g, '');
    const password = credentials.password?.trim() || '';

    // 1. Check Demo Accounts
    if (
      (rawInput === DEMO_CUSTOMER.email?.toLowerCase() || cleanPhone === DEMO_CUSTOMER.phone.replace(/\s+/g, '')) &&
      (!password || password === DEMO_PASSWORD)
    ) {
      this.persistSession(DEMO_CUSTOMER, null);
      return { user: DEMO_CUSTOMER };
    }

    if (
      (rawInput === DEMO_OWNER.email?.toLowerCase() || cleanPhone === DEMO_OWNER.phone.replace(/\s+/g, '')) &&
      (!password || password === DEMO_PASSWORD)
    ) {
      this.persistSession(DEMO_OWNER, DEMO_SHOP);
      return { user: DEMO_OWNER, business: DEMO_SHOP };
    }

    // 2. Check registered accounts
    const accounts = this.getRegisteredAccounts();
    const matched = accounts.find((acc) => {
      const emailMatch = acc.user.email && acc.user.email.toLowerCase() === rawInput;
      const phoneMatch = acc.user.phone.replace(/\s+/g, '') === cleanPhone;
      return emailMatch || phoneMatch;
    });

    if (!matched) {
      throw new Error('Incorrect email, phone, or password.');
    }

    if (password && matched.passwordHash && matched.passwordHash !== password) {
      throw new Error('Incorrect email, phone, or password.');
    }

    const business = matched.shop || (matched.user.role === 'owner' ? DEMO_SHOP : undefined);
    this.persistSession(matched.user, business || null);
    return { user: matched.user, business };
  }

  /**
   * Quick 1-click Demo Customer Login
   */
  public async loginAsDemoCustomer(): Promise<AuthUser> {
    const res = await this.login({
      emailOrPhone: DEMO_CUSTOMER.email!,
      password: DEMO_PASSWORD,
    });
    return res.user;
  }

  /**
   * Quick 1-click Demo Owner Login
   */
  public async loginAsDemoOwner(): Promise<{ user: AuthUser; business: OwnerBusinessContext }> {
    const res = await this.login({
      emailOrPhone: DEMO_OWNER.email!,
      password: DEMO_PASSWORD,
    });
    return { user: res.user, business: res.business || DEMO_SHOP };
  }

  /**
   * Customer Registration
   */
  public async registerCustomer(data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
  }): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Validation
    if (!data.fullName.trim()) {
      throw new Error('Full name is required.');
    }
    const cleanPhone = data.phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Enter a valid 10-digit phone number.');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      throw new Error('Enter a valid email address.');
    }
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }

    const accounts = this.getRegisteredAccounts();
    const existing = accounts.find(
      (a) =>
        a.user.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '') ||
        (data.email && a.user.email?.toLowerCase() === data.email.trim().toLowerCase())
    );

    if (existing) {
      throw new Error('An account with this phone or email already exists.');
    }

    const newUser: AuthUser = {
      id: `usr-cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
      email: data.email?.trim() || undefined,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    accounts.push({
      user: newUser,
      passwordHash: data.password,
    });
    this.saveRegisteredAccounts(accounts);

    // Save to Firestore
    try {
      await firestoreSync.createUser({
        id: newUser.id,
        phone: newUser.phone,
        email: newUser.email,
        fullName: newUser.fullName,
        role: 'customer',
        isActive: true,
        createdAt: newUser.createdAt!,
        updatedAt: newUser.createdAt!,
      });
    } catch (err) {
      console.warn('[AuthService] Firestore sync fallback:', err);
    }

    this.persistSession(newUser, null);
    return newUser;
  }

  /**
   * Shop Owner Registration
   */
  public async registerOwner(data: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    shopName: string;
    shopAddress: string;
    stallType?: string;
  }): Promise<{ user: AuthUser; shop: OwnerBusinessContext }> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Validation
    if (!data.fullName.trim()) {
      throw new Error('Full name is required.');
    }
    const cleanPhone = data.phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Enter a valid 10-digit phone number.');
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      throw new Error('Enter a valid email address.');
    }
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must contain at least 8 characters.');
    }
    if (!data.shopName.trim()) {
      throw new Error('Shop name is required.');
    }
    if (!data.shopAddress.trim()) {
      throw new Error('Shop address is required.');
    }

    const accounts = this.getRegisteredAccounts();
    const existing = accounts.find(
      (a) =>
        a.user.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '') ||
        a.user.email?.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      throw new Error('An account with this phone or email already exists.');
    }

    const ownerId = `usr-own-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const shopId = `shop-${Date.now().toString().slice(-6)}`;

    const newShop: OwnerBusinessContext = {
      id: shopId,
      name: data.shopName.trim(),
      ownerId: ownerId,
      phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
      address: data.shopAddress.trim(),
      stallType: data.stallType || 'Thela / Food Stall',
      isOpen: true,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    };

    const newOwner: AuthUser = {
      id: ownerId,
      fullName: data.fullName.trim(),
      phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
      email: data.email.trim(),
      role: 'owner',
      shopId: shopId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    accounts.push({
      user: newOwner,
      passwordHash: data.password,
      shop: newShop,
    });
    this.saveRegisteredAccounts(accounts);

    // Save user and shop to Firestore
    try {
      await firestoreSync.createUser({
        id: newOwner.id,
        phone: newOwner.phone,
        email: newOwner.email,
        fullName: newOwner.fullName,
        role: 'owner',
        shopId: shopId,
        isActive: true,
        createdAt: newOwner.createdAt!,
        updatedAt: newOwner.createdAt!,
      });

      await firestoreSync.saveShop({
        id: newShop.id,
        slug: newShop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: newShop.name,
        stallType: (newShop.stallType as any) || 'Thela / Food Stall',
        tagline: 'Fresh street food & quick counter service',
        description: `Welcome to ${newShop.name}. Serving hot, fresh snacks & drinks with instant counter tokens.`,
        image: newShop.image!,
        bannerImage: newShop.image!,
        location: {
          address: newShop.address!,
          landmark: 'Counter Location',
          distanceKm: 0.1,
        },
        isOpen: true,
        openingHours: '08:00 AM – 10:00 PM',
        rating: 5.0,
        totalReviews: 1,
        categories: ['vada-pav', 'snacks', 'tea-coffee'],
        preparationTimeMinutes: '5–10',
        isPureVeg: true,
        tableServiceAvailable: false,
      });
    } catch (err) {
      console.warn('[AuthService] Remote Firestore sync fallback:', err);
    }

    this.persistSession(newOwner, newShop);
    return { user: newOwner, shop: newShop };
  }

  /**
   * Logout user and clear active business context
   */
  public async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.persistSession(null, null);
  }

  /**
   * Update current user profile
   */
  public async updateUserProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('User is not authenticated.');
    }

    const updatedUser: AuthUser = {
      ...this.currentUser,
      ...updates,
    };

    // Update in registered accounts
    const accounts = this.getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.user.id === updatedUser.id);
    if (idx >= 0) {
      accounts[idx].user = updatedUser;
      this.saveRegisteredAccounts(accounts);
    }

    // Sync Firestore
    try {
      await firestoreSync.updateUser(updatedUser.id, {
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        email: updatedUser.email,
      });
    } catch {
      // offline fallback
    }

    this.persistSession(updatedUser, this.currentBusiness);
    return updatedUser;
  }

  /**
   * Update active shop profile for owners
   */
  public async updateOwnerShop(updates: Partial<OwnerBusinessContext>): Promise<OwnerBusinessContext> {
    if (!this.currentBusiness) {
      throw new Error('No active business context found.');
    }

    const updatedShop: OwnerBusinessContext = {
      ...this.currentBusiness,
      ...updates,
    };

    // Update in registered accounts
    const accounts = this.getRegisteredAccounts();
    const idx = accounts.findIndex((a) => a.user.id === this.currentUser?.id);
    if (idx >= 0 && accounts[idx].shop) {
      accounts[idx].shop = updatedShop;
      this.saveRegisteredAccounts(accounts);
    }

    this.persistSession(this.currentUser, updatedShop);
    return updatedShop;
  }

  /**
   * Mock password reset
   */
  public async resetPassword(emailOrPhone: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!emailOrPhone.trim()) {
      throw new Error('Please enter your registered email or phone.');
    }
    return {
      success: true,
      message: `If an account exists for ${emailOrPhone.trim()}, password reset instructions have been prepared. (Demo password: ${DEMO_PASSWORD})`,
    };
  }
}

export const authService = new AuthService();
