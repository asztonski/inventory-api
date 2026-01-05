import { Router, Request, Response } from "express";
import { getAllProducts } from "../queries/products.query.js";
import {
  createProduct,
  restockProduct,
  sellProduct,
} from "../commands/products.command.js";
import {
  createProductSchema,
  updateStockSchema,
} from "../validators/product.validator.js";

const router = Router();

/**
 * GET /products
 * Retrieve all products
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const products = getAllProducts();
    res.status(200).json(products);
  } catch {
    res.status(500).json({ error: "Failed to retrieve products" });
  }
});

/**
 * POST /products
 * Create a new product
 */
router.post("/", (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = createProductSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details[0].message,
      });
    }

    // Create product
    const product = createProduct(value);

    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * POST /products/:id/restock
 * Increase product stock
 */
router.post("/:id/restock", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateStockSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details[0].message,
      });
    }

    // Restock product
    const product = restockProduct(id, value.quantity);

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to restock product" });
  }
});

/**
 * POST /products/:id/sell
 * Decrease product stock (cannot go below zero)
 */
router.post("/:id/sell", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateStockSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details[0].message,
      });
    }

    // Sell product
    const product = sellProduct(id, value.quantity);

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Product not found") {
        return res.status(404).json({ error: "Product not found" });
      }
      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({ error: error.message });
      }
    }
    res.status(500).json({ error: "Failed to sell product" });
  }
});

export default router;
