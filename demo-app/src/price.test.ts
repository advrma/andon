import { describe, expect, it } from "vitest";
import { subtotal, total } from "./price";

describe("subtotal", () => {
  it("sums price times qty", () => {
    expect(subtotal([{ price: 2.5, qty: 2 }, { price: 1, qty: 3 }])).toBe(8);
  });

  it("is zero for an empty cart", () => {
    expect(subtotal([])).toBe(0);
  });
});

describe("total", () => {
  it("equals subtotal for small orders", () => {
    expect(total([{ price: 20, qty: 2 }])).toBe(40);
  });

  // Strict: exact cents, no float drift. 3 x 33.33 = 99.99, under $100.
  it("rounds to exact cents", () => {
    expect(total([{ price: 33.33, qty: 3 }])).toBe(99.99);
  });
});
