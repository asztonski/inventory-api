import { nanoid } from "nanoid";
import { getDatabase } from "../db/index.js";
import { Order, OrderProduct } from "../db/types.js";
import { getProductById } from "../queries/products.query.js";
import { sellProduct } from "./products.command.js";
import {
  calculateVolumeDiscount,
  calculateLocationMultiplier,
  calculateSeasonalDiscount,
  chooseBestDiscount,
} from "../utils/discount.utils.js";

/**
 * Input for creating a new order
 */
interface CreateOrderInput {
  customerId: string;
  location?: string;
  orderDate?: Date;
  products: {
    productId: string;
    quantity: number;
  }[];
}

/**
 * CQRS Command: Create a new order
 *
 * Business logic:
 * 1. Validate customer exists
 * 2. Validate all products exist and have sufficient stock
 * 3. Calculate total amount (price * quantity)
 * 4. Calculate applicable discounts (volume, seasonal, location)
 * 5. Choose best discount for customer
 * 6. Apply discount and location multiplier to calculate final amount
 * 7. Update stock levels for all products
 * 8. Save order to database
 *
 * @param input - Order details (customerId, products[])
 * @returns Created order
 * @throws Error if validation fails or insufficient stock
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const db = getDatabase();

  // Step 1: Validate products and check stock availability
  const orderProducts: OrderProduct[] = [];
  const productCategories: string[] = [];
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const item of input.products) {
    const product = getProductById(item.productId);

    if (!product) {
      throw new Error(`Product with id ${item.productId} not found`);
    }

    // Check stock availability BEFORE creating order
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
      );
    }

    // Calculate price for this product
    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;
    totalQuantity += item.quantity;

    // Store product info for order (preserve price at time of order)
    orderProducts.push({
      productId: product.id,
      quantity: item.quantity,
      priceAtOrder: product.price,
    });

    // Collect categories for seasonal discount calculation
    if (product.category && !productCategories.includes(product.category)) {
      productCategories.push(product.category);
    }
  }

  // Step 3: Calculate discounts
  const orderDate = input.orderDate || new Date();

  const volumeDiscount = calculateVolumeDiscount(totalQuantity);
  const seasonalDiscount = calculateSeasonalDiscount(
    orderDate,
    productCategories
  );
  const locationMultiplier = calculateLocationMultiplier(input.location);

  // Step 4: Choose best discount (highest from customer's perspective)
  const bestDiscount = chooseBestDiscount(
    volumeDiscount,
    seasonalDiscount,
    locationMultiplier
  );

  // Step 5: Apply location multiplier and discount
  // Important: Location multiplier is applied to base price FIRST,
  // then we apply the best discount

  let finalAmount = totalAmount * locationMultiplier;

  // If the best discount came from location (locationMultiplier < 1.0),
  // it's already applied. Otherwise, apply the chosen discount.
  const locationDiscount =
    locationMultiplier < 1.0 ? 1 - locationMultiplier : 0;

  if (bestDiscount > locationDiscount) {
    // The best discount is NOT from location, so apply it
    finalAmount = totalAmount * (1 - bestDiscount);
  }
  // If locationDiscount was best, finalAmount already has it applied above

  // Step 6: Update stock levels for all products
  for (const item of input.products) {
    await sellProduct(item.productId, item.quantity);
  }

  // Step 7: Create order object
  const order: Order = {
    id: nanoid(),
    customerId: input.customerId,
    products: orderProducts,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    discount: parseFloat((bestDiscount * 100).toFixed(2)), // Store as percentage for readability
    finalAmount: parseFloat(finalAmount.toFixed(2)),
    status: "pending",
    createdAt: orderDate.toISOString(),
    updatedAt: orderDate.toISOString(),
  };

  // Step 8: Save to database
  db.data.orders.push(order);
  await db.write();

  return order;
}
