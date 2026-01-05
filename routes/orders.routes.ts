import { Router, Request, Response } from "express";
import { createOrderSchema } from "../validators/order.validator.js";
import { getAllOrders, getOrderById } from "../queries/orders.query.js";
import { createOrder } from "../commands/orders.command.js";

const router = Router();

/**
 * GET /orders
 * Retrieve all orders
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve orders",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /orders/:id
 * Retrieve a single order by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = getOrderById(req.params.id);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve order",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /orders
 * Create a new order
 *
 * Body: { customerId: string, products: [{ productId: string, quantity: number }] }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        error: "Validation failed",
        details: error.details.map((d) => d.message),
      });
      return;
    }

    // Create order (includes stock validation and discount calculation)
    const order = await createOrder(value);

    res.status(201).json(order);
  } catch (error) {
    // Handle business logic errors (insufficient stock, customer not found, etc.)
    if (error instanceof Error) {
      // Check if it's a validation/business error (400) or server error (500)
      const isBusinessError =
        error.message.includes("not found") ||
        error.message.includes("Insufficient stock");

      res.status(isBusinessError ? 400 : 500).json({
        error: isBusinessError ? "Order creation failed" : "Server error",
        details: error.message,
      });
      return;
    }

    res.status(500).json({ error: "Unknown error occurred" });
  }
});

export default router;
