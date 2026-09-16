import { PaymentMethod } from '../types';

export interface PaymentSessionResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'INITIATED' | 'COMPLETED' | 'PENDING_COLLECTION';
  message: string;
  gatewayMock: boolean;
}

export const paymentService = {
  /**
   * Initializes a payment session.
   * Clearly surfaces gateway mock status while retaining production API structure.
   */
  async createPaymentSession(
    orderId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<PaymentSessionResponse> {
    // Simulate brief network handshake with payment service
    await new Promise((r) => setTimeout(r, 200));

    if (method === 'CASH_AT_COUNTER') {
      return {
        paymentId: `cash_${Date.now()}`,
        orderId,
        amount,
        currency: 'INR',
        method: 'CASH_AT_COUNTER',
        status: 'PENDING_COLLECTION',
        message: 'Pay in cash or UPI at the shop counter when picking up your order.',
        gatewayMock: true,
      };
    }

    // Online payment placeholder architecture (e.g. Razorpay/UPI/PayTM integration hook)
    return {
      paymentId: `pay_mock_${Date.now()}`,
      orderId,
      amount,
      currency: 'INR',
      method: 'PAY_ONLINE',
      status: 'COMPLETED',
      message: 'Payment simulation successful. Real UPI/Gateway webhook hook ready.',
      gatewayMock: true,
    };
  },

  async getPayment(orderId: string): Promise<{ orderId: string; status: string; isVerified: boolean }> {
    await new Promise((r) => setTimeout(r, 40));
    return {
      orderId,
      status: 'COMPLETED',
      isVerified: true,
    };
  },

  async markCashPaid(orderId: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 50));
    return true;
  },

  async verifyOnlinePayment(orderId: string, utrOrRef?: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 60));
    return true;
  },

  async verifyPayment(paymentId: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 100));
    return paymentId.startsWith('pay_') || paymentId.startsWith('cash_');
  },
};
