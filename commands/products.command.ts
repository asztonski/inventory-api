import { nanoid } from "nanoid";
import { getDatabase, Product } from "../db/index.js";
import { getProductById } from "../queries/products.query.js";

/**
 * COMMAND: Create a new product
 * Used by: POST /products
 */
export function createProduct(data: {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
}): Product {
  const db = getDatabase();

  const newProduct: Product = {
    id: nanoid(),
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    category: data.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.data.products.push(newProduct);
  db.write();

  return newProduct;
}

/**
 * COMMAND: Increase product stock
 * Used by: POST /products/:id/restock
 */
export function restockProduct(id: string, quantity: number): Product {
  const db = getDatabase();
  const product = getProductById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  product.stock += quantity;
  product.updatedAt = new Date().toISOString();

  db.write();

  return product;
}

/**
 * COMMAND: Decrease product stock (sell)
 * Used by: POST /products/:id/sell
 * Ensures stock cannot go below zero
 */
export function sellProduct(id: string, quantity: number): Product {
  const db = getDatabase();
  const product = getProductById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error(
      `Insufficient stock. Available: ${product.stock}, requested: ${quantity}`
    );
  }

  product.stock -= quantity;
  product.updatedAt = new Date().toISOString();

  db.write();

  return product;
}
