import { describe, expect, it } from "vitest";
import { calculateExclusiveTax, calculateInclusiveTax } from "../src/finance/tax.ts";

describe("tax calculation module", () => {
  it("calculates inclusive tax (e.g. 18% IGV / IVA included in Peru / Latam)", () => {
    // Total: S/ 118.00 (11800 minor units). Rate: 18%
    // Subtotal should be S/ 100.00 (10000), Tax should be S/ 18.00 (1800)
    const breakdown = calculateInclusiveTax(11_800, 18);
    expect(breakdown).toEqual({
      total: 11_800,
      subtotal: 10_000,
      taxAmount: 1_800,
      ratePercent: 18,
    });
  });

  it("handles rounding with precision in inclusive tax", () => {
    // Total: 100.00 (10000 minor units) with 18%
    // 10000 / 1.18 = 8474.576... -> 8475. Tax: 1525.
    const breakdown = calculateInclusiveTax(10_000, 18);
    expect(breakdown.subtotal).toBe(8_475);
    expect(breakdown.taxAmount).toBe(1_525);
    expect(breakdown.subtotal + breakdown.taxAmount).toBe(breakdown.total);
  });

  it("calculates exclusive tax (subtotal + tax = total)", () => {
    // Subtotal: $50.00 (5000 minor units), Rate: 19%
    // Tax: 5000 * 0.19 = 950. Total: 5950
    const breakdown = calculateExclusiveTax(5_000, 19);
    expect(breakdown).toEqual({
      total: 5_950,
      subtotal: 5_000,
      taxAmount: 950,
      ratePercent: 19,
    });
  });

  it("handles zero rate or zero amount safely", () => {
    expect(calculateInclusiveTax(5000, 0)).toEqual({
      total: 5000,
      subtotal: 5000,
      taxAmount: 0,
      ratePercent: 0,
    });
  });
});

