import { getDatabase, Order } from "../db/index.js";

/**
 * QUERY: Get all orders
 * Used by: GET /orders
 */
export function getAllOrders(): Order[] {
  const db = getDatabase();
  return db.data.orders;
}

/**
 * QUERY: Get order by ID
 * Used by: Order lookup, validation
 */
export function getOrderById(id: string): Order | undefined {
  const db = getDatabase();
  return db.data.orders.find((order) => order.id === id);
}
