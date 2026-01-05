import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.ts";
import { initDatabase, getDatabase } from "../../db/index.ts";

// Use separate test database if not set by environment
if (!process.env.DB_PATH) {
  process.env.DB_PATH = "./__tests__/test-db.json";
}

describe("Orders API Integration Tests", () => {
  let testProductId1;
  let testProductId2;

  before(async () => {
    // Initialize database before tests
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    const db = getDatabase();
    db.data.products = [];
    db.data.orders = [];
    await db.write();

    // Create test products
    const product1 = await request(app).post("/api/products").send({
      name: "Laptop",
      description: "Gaming laptop",
      price: 1000,
      stock: 100,
      category: "Electronics",
    });
    testProductId1 = product1.body.id;

    const product2 = await request(app).post("/api/products").send({
      name: "Mouse",
      description: "Wireless mouse",
      price: 50,
      stock: 200,
      category: "Electronics",
    });
    testProductId2 = product2.body.id;
  });

  describe("POST /api/orders", () => {
    it("should create a new order with valid data", async () => {
      const newOrder = {
        customerId: "customer-123",
        products: [
          { productId: testProductId1, quantity: 2 },
          { productId: testProductId2, quantity: 3 },
        ],
      };

      const response = await request(app).post("/api/orders").send(newOrder);

      assert.strictEqual(response.status, 201);
      assert.ok(response.body.id);
      assert.strictEqual(response.body.customerId, newOrder.customerId);
      assert.strictEqual(response.body.products.length, 2);
      assert.ok(response.body.finalAmount > 0);
      assert.ok(response.body.createdAt);
    });

    it("should apply volume discount for quantity >= 10", async () => {
      const newOrder = {
        customerId: "customer-123",
        products: [{ productId: testProductId1, quantity: 10 }],
      };

      const response = await request(app).post("/api/orders").send(newOrder);

      assert.strictEqual(response.status, 201);
      // Base price: 1000 * 10 = 10000
      // Volume discount: 20% (quantity 10-49)
      // Expected: 10000 * 0.8 = 8000
      assert.strictEqual(response.body.finalAmount, 8000);
      assert.strictEqual(response.body.discount, 20);
    });

    it("should apply location multiplier for Europe", async () => {
      const newOrder = {
        customerId: "customer-123",
        location: "Europe",
        products: [{ productId: testProductId1, quantity: 1 }],
      };

      const response = await request(app).post("/api/orders").send(newOrder);

      assert.strictEqual(response.status, 201);
      // Base price: 1000
      // Location multiplier: 1.15 (Europe VAT)
      // Expected: 1000 * 1.15 = 1150
      assert.strictEqual(response.body.finalAmount, 1150);
    });

    it("should update product stock after order", async () => {
      const newOrder = {
        customerId: "customer-123",
        products: [{ productId: testProductId1, quantity: 5 }],
      };

      await request(app).post("/api/orders").send(newOrder);

      // Check product stock was updated
      const productsResponse = await request(app).get("/api/products");
      const product = productsResponse.body.find(
        (p) => p.id === testProductId1
      );

      assert.strictEqual(product.stock, 95); // 100 - 5
    });

    it("should reject order with missing customerId", async () => {
      const invalidOrder = {
        products: [{ productId: testProductId1, quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/orders")
        .send(invalidOrder);

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, "Validation failed");
    });

    it("should reject order with empty products array", async () => {
      const invalidOrder = {
        customerId: "customer-123",
        products: [],
      };

      const response = await request(app)
        .post("/api/orders")
        .send(invalidOrder);

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, "Validation failed");
    });

    it("should reject order with invalid quantity", async () => {
      const invalidOrder = {
        customerId: "customer-123",
        products: [{ productId: testProductId1, quantity: -5 }],
      };

      const response = await request(app)
        .post("/api/orders")
        .send(invalidOrder);

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, "Validation failed");
    });

    it("should reject order with insufficient stock", async () => {
      const invalidOrder = {
        customerId: "customer-123",
        products: [{ productId: testProductId1, quantity: 150 }], // stock is 100
      };

      const response = await request(app)
        .post("/api/orders")
        .send(invalidOrder);

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, "Order creation failed");
      assert.ok(response.body.details.includes("Insufficient stock"));
    });

    it("should reject order with non-existent product", async () => {
      const invalidOrder = {
        customerId: "customer-123",
        products: [{ productId: "non-existent-id", quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/orders")
        .send(invalidOrder);

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.details.includes("not found"));
    });
  });

  describe("GET /api/orders", () => {
    it("should return empty array when no orders", async () => {
      const response = await request(app).get("/api/orders");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(Array.isArray(response.body), true);
      assert.strictEqual(response.body.length, 0);
    });

    it("should return all orders", async () => {
      // Create test orders
      await request(app)
        .post("/api/orders")
        .send({
          customerId: "customer-1",
          products: [{ productId: testProductId1, quantity: 1 }],
        });

      await request(app)
        .post("/api/orders")
        .send({
          customerId: "customer-2",
          products: [{ productId: testProductId2, quantity: 2 }],
        });

      const response = await request(app).get("/api/orders");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 2);
      assert.strictEqual(response.body[0].customerId, "customer-1");
      assert.strictEqual(response.body[1].customerId, "customer-2");
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return a single order by id", async () => {
      const createResponse = await request(app)
        .post("/api/orders")
        .send({
          customerId: "customer-123",
          products: [{ productId: testProductId1, quantity: 1 }],
        });

      const orderId = createResponse.body.id;

      const response = await request(app).get(`/api/orders/${orderId}`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.id, orderId);
      assert.strictEqual(response.body.customerId, "customer-123");
    });

    it("should return 404 for non-existent order", async () => {
      const response = await request(app).get("/api/orders/non-existent-id");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.body.error, "Order not found");
    });
  });
});
