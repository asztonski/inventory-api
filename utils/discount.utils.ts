/**
 * Calculates discount based on total quantity of products ordered
 * Rules from task:
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
 * Rules from task:
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
