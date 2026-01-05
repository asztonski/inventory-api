/**
 * Calculates discount based on total quantity of products ordered
 * - 5-9 units: 10% discount
 * - 10-49 units: 20% discount
 * - 50+ units: 30% discount
 */

/**
 * Calculate volume-based discount
 * @param totalQuantity - Total number of units across all products
 * @returns Discount percentage (0.0 - 0.3)
 */
export function calculateVolumeDiscount(totalQuantity: number): number {
  if (totalQuantity >= 50) {
    return 0.3; // 30% discount
  }
  if (totalQuantity >= 10) {
    return 0.2; // 20% discount
  }
  if (totalQuantity >= 5) {
    return 0.1; // 10% discount
  }
  return 0; // No discount
}

/**
 * Adjusts price based on customer location
 * - US: Standard pricing (no change)
 * - Europe: +15% due to VAT
 * - Asia: -5% due to lower logistics costs
 */

/**
 * Calculate location-based price multiplier
 * @param location - Customer location (US, Europe, Asia)
 * @returns Price multiplier (0.95 - 1.15)
 */
export function calculateLocationMultiplier(
  location: "US" | "Europe" | "Asia"
): number {
  switch (location) {
    case "Europe":
      return 1.15; // +15% VAT
    case "Asia":
      return 0.95; // -5% lower logistics
    case "US":
    default:
      return 1.0; // Standard pricing
  }
}

/**
 * Applies discounts based on Polish bank holidays
 * Selected categories for holiday discount: Electronics, Toys
 */

/**
 * Calculate seasonal discount based on order date and product categories
 * @param orderDate - Date when order is placed
 * @param productCategories - Array of product categories in the order
 * @returns Discount percentage (0.0 - 0.25)
 */
export function calculateSeasonalDiscount(
  orderDate: Date,
  productCategories: string[]
): number {
  const month = orderDate.getMonth();
  const day = orderDate.getDate();

  // Black Friday: November 25 (25% discount on everything)
  if (month === 10 && day === 25) {
    return 0.25;
  }

  // Christmas Season: December 24-26 (15% discount on Electronics and Toys)
  if (month === 11 && day >= 24 && day <= 26) {
    // Check if order contains Electronics or Toys
    const hasEligibleCategory = productCategories.some(
      (category) => category === "Electronics" || category === "Toys"
    );

    if (hasEligibleCategory) {
      return 0.15;
    }
  }

  return 0; // No seasonal discount
}

/** Chooses the best discount available
 * Compares volume, seasonal, and location-based pricing to select the best
 * discount for the customer (maximum savings).
 *
 * Note: Location multiplier > 1.0 means price INCREASE, not a discount.
 * Only multipliers < 1.0 are treated as discounts.
 */

/**
 * Select the highest applicable discount from available options
 * @param volumeDiscount - Volume-based discount (0.0 - 0.3)
 * @param seasonalDiscount - Seasonal/promotional discount (0.0 - 0.25)
 * @param locationMultiplier - Location-based price multiplier (0.95 - 1.15)
 * @returns The highest discount percentage from customer's perspective
 */
export function chooseBestDiscount(
  volumeDiscount: number,
  seasonalDiscount: number,
  locationMultiplier: number
): number {
  const locationDiscount =
    locationMultiplier < 1.0 ? 1 - locationMultiplier : 0;
  // Compare all discounts and return the maximum
  return Math.max(volumeDiscount, seasonalDiscount, locationDiscount);
}
