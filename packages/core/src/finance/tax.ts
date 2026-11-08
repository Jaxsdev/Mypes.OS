import { roundHalfAwayFromZero } from "../money.ts";

export type TaxBreakdown = {
  /** The total transaction amount in minor units */
  total: number;
  /** Subtotal / Net amount without taxes in minor units */
  subtotal: number;
  /** Calculated tax amount in minor units */
  taxAmount: number;
  /** Tax rate as percentage, e.g. 18 for 18% */
  ratePercent: number;
};

/**
 * Calculates tax breakdown when total amount already includes tax (e.g. IGV / IVA included).
 * Formula: subtotal = total / (1 + rate / 100), tax = total - subtotal
 */
export function calculateInclusiveTax(total: number, ratePercent: number): TaxBreakdown {
  if (total <= 0 || ratePercent <= 0) {
    return { total, subtotal: total, taxAmount: 0, ratePercent };
  }
  const factor = 1 + ratePercent / 100;
  const subtotal = roundHalfAwayFromZero(total / factor);
  const taxAmount = total - subtotal;
  return { total, subtotal, taxAmount, ratePercent };
}

/**
 * Calculates tax breakdown when total amount is net / tax exclusive.
 * Formula: tax = subtotal * (rate / 100), total = subtotal + tax
 */
export function calculateExclusiveTax(subtotal: number, ratePercent: number): TaxBreakdown {
  if (subtotal <= 0 || ratePercent <= 0) {
    return { total: subtotal, subtotal, taxAmount: 0, ratePercent };
  }
  const taxAmount = roundHalfAwayFromZero((subtotal * ratePercent) / 100);
  const total = subtotal + taxAmount;
  return { total, subtotal, taxAmount, ratePercent };
}

