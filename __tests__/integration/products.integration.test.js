import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.ts";
import { initDatabase, getDatabase } from "../../db/index.ts";

// Use separate test database if not set by environment
if (!process.env.DB_PATH) {
  process.env.DB_PATH = "./__tests__/test-db.json";
}

describe("Products API Integration Tests", () => {
  before(async () => {
    // Initialize database before tests
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear products before each test
    const db = getDatabase();
    db.data.products = [];
    await db.write();
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const newProduct = {
        name: "Test Laptop",
        description: "Gaming laptop",
        price: 1299.99,
        stock: 10,
        category: "Electronics",
      };

      const response = await request(app)
        .post("/api/products")
        .send(newProduct);

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.name, newProduct.name);
      assert.strictEqual(response.body.price, newProduct.price);
      assert.ok(response.body.id);
    });

    it("should reject product with invalid data", async () => {
      const invalidProduct = {
        name: "",
        description: "Test",
        price: -100,
        stock: 5,
      };

      const response = await request(app)
        .post("/api/products")
        .send(invalidProduct);

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.body.error, "Validation failed");
    });
  });

  describe("GET /api/products", () => {
    it("should return empty array when no products", async () => {
      const response = await request(app).get("/api/products");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(Array.isArray(response.body), true);
      assert.strictEqual(response.body.length, 0);
    });

    it("should return all products", async () => {
      // Create test products
      await request(app).post("/api/products").send({
        name: "Laptop",
        description: "Gaming laptop",
        price: 1299.99,
        stock: 10,
      });

      await request(app).post("/api/products").send({
        name: "Mouse",
        description: "Wireless mouse",
        price: 29.99,
        stock: 50,
      });

      const response = await request(app).get("/api/products");

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.length, 2);
      assert.strictEqual(response.body[0].name, "Laptop");
      assert.strictEqual(response.body[1].name, "Mouse");
    });
  });

  describe("POST /api/products/:id/restock", () => {
    it("should increase product stock", async () => {
      const createResponse = await request(app).post("/api/products").send({
        name: "Laptop",
        description: "Test",
        price: 1000,
        stock: 10,
      });

      const productId = createResponse.body.id;

      const restockResponse = await request(app)
        .post(`/api/products/${productId}/restock`)
        .send({ quantity: 5 });

      assert.strictEqual(restockResponse.status, 200);
      assert.strictEqual(restockResponse.body.stock, 15);
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app)
        .post("/api/products/non-existent-id/restock")
        .send({ quantity: 5 });

      assert.strictEqual(response.status, 404);
    });
  });

  describe("POST /api/products/:id/sell", () => {
    it("should decrease product stock", async () => {
      const createResponse = await request(app).post("/api/products").send({
        name: "Laptop",
        description: "Test",
        price: 1000,
        stock: 10,
      });

      const productId = createResponse.body.id;

      const sellResponse = await request(app)
        .post(`/api/products/${productId}/sell`)
        .send({ quantity: 3 });

      assert.strictEqual(sellResponse.status, 200);
      assert.strictEqual(sellResponse.body.stock, 7);
    });

    it("should prevent stock from going below zero", async () => {
      const createResponse = await request(app).post("/api/products").send({
        name: "Laptop",
        description: "Test",
        price: 1000,
        stock: 5,
      });

      const productId = createResponse.body.id;

      const response = await request(app)
        .post(`/api/products/${productId}/sell`)
        .send({ quantity: 10 });

      assert.strictEqual(response.status, 400);
      assert.ok(response.body.error.includes("Insufficient stock"));
    });
  });
});
