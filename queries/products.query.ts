import { getDatabase, Product } from "../db/index.js";

/**
 * QUERY: Get all products
 * Used by: GET /products
 */
export function getAllProducts(): Product[] {
  const db = getDatabase();
  return db.data.products;
}

/**
 * QUERY: Get product by ID
 * Used by: Stock operations, order validation
 */
export function getProductById(id: string): Product | undefined {
  const db = getDatabase();
  return db.data.products.find((product) => product.id === id);
}
