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
