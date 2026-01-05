import {
  calculateVolumeDiscount,
  calculateLocationMultiplier,
  calculateSeasonalDiscount,
  chooseBestDiscount,
} from "../../utils/discount.utils";

describe("Discount Utils", () => {
  describe("calculateVolumeDiscount", () => {
    it("should return 0 for quantity less than 5", () => {
      expect(calculateVolumeDiscount(4)).toBe(0);
      expect(calculateVolumeDiscount(1)).toBe(0);
      expect(calculateVolumeDiscount(0)).toBe(0);
    });

    it("should return 0.1 (10%) for quantity 5-9", () => {
      expect(calculateVolumeDiscount(5)).toBe(0.1);
      expect(calculateVolumeDiscount(7)).toBe(0.1);
      expect(calculateVolumeDiscount(9)).toBe(0.1);
    });

    it("should return 0.2 (20%) for quantity 10-49", () => {
      expect(calculateVolumeDiscount(10)).toBe(0.2);
      expect(calculateVolumeDiscount(25)).toBe(0.2);
      expect(calculateVolumeDiscount(49)).toBe(0.2);
    });

    it("should return 0.3 (30%) for quantity 50+", () => {
      expect(calculateVolumeDiscount(50)).toBe(0.3);
      expect(calculateVolumeDiscount(100)).toBe(0.3);
      expect(calculateVolumeDiscount(1000)).toBe(0.3);
    });
  });

  describe("calculateLocationMultiplier", () => {
    it("should return 1.0 for US", () => {
      expect(calculateLocationMultiplier("US")).toBe(1.0);
    });

    it("should return 1.15 for Europe", () => {
      expect(calculateLocationMultiplier("Europe")).toBe(1.15);
    });

    it("should return 0.95 for Asia", () => {
      expect(calculateLocationMultiplier("Asia")).toBe(0.95);
    });

    it("should return 1.0 for unknown location (default)", () => {
      expect(calculateLocationMultiplier("Australia" as any)).toBe(1.0);
      expect(calculateLocationMultiplier("" as any)).toBe(1.0);
    });
  });

  describe("calculateSeasonalDiscount", () => {
    it("should return 0.25 (25%) for Black Friday (Nov 25)", () => {
      const blackFriday = new Date(2025, 10, 25); // Month 10 = November
      expect(calculateSeasonalDiscount(blackFriday, ["Electronics"])).toBe(
        0.25
      );
      expect(calculateSeasonalDiscount(blackFriday, ["Toys", "Books"])).toBe(
        0.25
      );
    });

    it("should return 0.15 (15%) for Holiday Sales with Electronics", () => {
      const christmas = new Date(2025, 11, 25); // Dec 25
      expect(calculateSeasonalDiscount(christmas, ["Electronics"])).toBe(0.15);
    });

    it("should return 0.15 (15%) for Holiday Sales with Toys", () => {
      const christmasEve = new Date(2025, 11, 24); // Dec 24
      expect(calculateSeasonalDiscount(christmasEve, ["Toys"])).toBe(0.15);
    });

    it("should return 0 for Holiday Sales without Electronics/Toys", () => {
      const christmas = new Date(2025, 11, 25);
      expect(calculateSeasonalDiscount(christmas, ["Books", "Clothing"])).toBe(
        0
      );
    });

    it("should return 0 for regular days", () => {
      const regularDay = new Date(2026, 2, 15); // March 15
      expect(calculateSeasonalDiscount(regularDay, ["Electronics"])).toBe(0);
      expect(calculateSeasonalDiscount(regularDay, ["Toys"])).toBe(0);
    });

    it("should return 0 for empty categories array", () => {
      const blackFriday = new Date(2025, 10, 25);
      expect(calculateSeasonalDiscount(blackFriday, [])).toBe(0.25);

      const christmas = new Date(2025, 11, 25);
      expect(calculateSeasonalDiscount(christmas, [])).toBe(0);
    });
  });

  describe("chooseBestDiscount", () => {
    it("should choose volume discount when highest", () => {
      expect(chooseBestDiscount(0.3, 0.15, 1.0)).toBe(0.3);
    });

    it("should choose seasonal discount when highest", () => {
      expect(chooseBestDiscount(0.1, 0.25, 1.0)).toBe(0.25);
    });

    it("should choose location discount when highest", () => {
      expect(chooseBestDiscount(0, 0, 0.95)).toBeCloseTo(0.05, 2); // 1 - 0.95 = 0.05
    });

    it("should ignore location multiplier when >= 1.0", () => {
      expect(chooseBestDiscount(0.1, 0, 1.15)).toBe(0.1); // Europe VAT ignored
      expect(chooseBestDiscount(0, 0.15, 1.0)).toBe(0.15); // US multiplier ignored
    });

    it("should return 0 when no discounts available", () => {
      expect(chooseBestDiscount(0, 0, 1.0)).toBe(0);
      expect(chooseBestDiscount(0, 0, 1.15)).toBe(0);
    });

    it("should handle all discounts being equal", () => {
      expect(chooseBestDiscount(0.15, 0.15, 0.85)).toBeCloseTo(0.15, 2);
    });
  });
});
