import { Order, OrderItem } from '../types';

export class OrderValidationError extends Error {
  public code: string;
  public details: {
    providedTotal: number;
    calculatedTotal: number;
    itemsCount: number;
  };

  constructor(message: string, details: { providedTotal: number; calculatedTotal: number; itemsCount: number }) {
    super(message);
    this.name = 'OrderValidationError';
    this.code = 'INVALID_ORDER_TOTAL';
    this.details = details;
  }
}

export interface OrderValidationResult {
  isValid: boolean;
  error?: string;
  calculatedTotal: number;
  providedTotal: number;
}

/**
 * Validates that an order's total_amount matches sum(order_items.subtotal)
 * as mandated by Section 9 & 10 of the schema.
 */
export function validateOrderTotal(
  items: Array<{ price: number; quantity: number; name?: string }>,
  totalAmount: number
): OrderValidationResult {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      error: 'Order must contain at least one item.',
      calculatedTotal: 0,
      providedTotal: totalAmount,
    };
  }

  // Calculate sum of items subtotal
  const calculatedTotal = items.reduce((sum, item) => {
    const qty = Math.max(0, item.quantity || 1);
    const prc = Math.max(0, item.price || 0);
    const subtotal = Math.round(qty * prc * 100) / 100;
    return sum + subtotal;
  }, 0);

  const roundedCalculated = Math.round(calculatedTotal * 100) / 100;
  const roundedProvided = Math.round(totalAmount * 100) / 100;

  // Allow negligible floating point delta (< 0.01)
  const diff = Math.abs(roundedCalculated - roundedProvided);
  const isValid = diff < 0.01;

  if (!isValid) {
    return {
      isValid: false,
      error: `Order validation failed: Total amount ₹${roundedProvided} does not match sum of item subtotals ₹${roundedCalculated}.`,
      calculatedTotal: roundedCalculated,
      providedTotal: roundedProvided,
    };
  }

  return {
    isValid: true,
    calculatedTotal: roundedCalculated,
    providedTotal: roundedProvided,
  };
}

/**
 * Validates an order object before persisting to Cloud Firestore.
 * Throws OrderValidationError if total amount does not match sum of subtotals.
 */
export function assertValidOrderSubmission(order: Partial<Order>): void {
  const items = (order.items || []).map((i) => ({
    price: i.price,
    quantity: i.quantity,
    name: i.name,
  }));

  const total = order.total !== undefined ? order.total : 0;
  const result = validateOrderTotal(items, total);

  if (!result.isValid) {
    throw new OrderValidationError(result.error || 'Invalid order total', {
      providedTotal: result.providedTotal,
      calculatedTotal: result.calculatedTotal,
      itemsCount: items.length,
    });
  }
}
