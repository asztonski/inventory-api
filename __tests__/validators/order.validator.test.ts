import { createOrderSchema } from "../../validators/order.validator";

describe("Order Validators", () => {
  describe("createOrderSchema", () => {
    it("should validate correct order data", () => {
      const validOrder = {
        customerId: "customer-us-1",
        products: [
          { productId: "prod-123", quantity: 5 },
          { productId: "prod-456", quantity: 10 },
        ],
      };

      const { error, value } = createOrderSchema.validate(validOrder);
      expect(error).toBeUndefined();
      expect(value).toEqual(validOrder);
    });

    it("should reject order without customerId", () => {
      const invalidOrder = {
        products: [{ productId: "prod-123", quantity: 5 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Customer ID is required");
    });

    it("should reject order with empty customerId", () => {
      const invalidOrder = {
        customerId: "",
        products: [{ productId: "prod-123", quantity: 5 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Customer ID is required");
    });

    it("should reject order without products array", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Products array is required");
    });

    it("should reject order with empty products array", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain(
        "At least one product is required"
      );
    });

    it("should reject product without productId", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [{ quantity: 5 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Product ID is required");
    });

    it("should reject product with empty productId", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [{ productId: "", quantity: 5 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Product ID is required");
    });

    it("should reject product without quantity", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [{ productId: "prod-123" }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Quantity is required");
    });

    it("should reject product with negative quantity", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [{ productId: "prod-123", quantity: -5 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Quantity must be positive");
    });

    it("should reject product with zero quantity", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [{ productId: "prod-123", quantity: 0 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Quantity must be positive");
    });

    it("should reject product with decimal quantity", () => {
      const invalidOrder = {
        customerId: "customer-us-1",
        products: [{ productId: "prod-123", quantity: 5.5 }],
      };

      const { error } = createOrderSchema.validate(invalidOrder);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain(
        "Quantity must be an integer"
      );
    });

    it("should accept order with multiple products", () => {
      const validOrder = {
        customerId: "customer-us-1",
        products: [
          { productId: "prod-1", quantity: 1 },
          { productId: "prod-2", quantity: 2 },
          { productId: "prod-3", quantity: 3 },
        ],
      };

      const { error } = createOrderSchema.validate(validOrder);
      expect(error).toBeUndefined();
    });
  });
});
