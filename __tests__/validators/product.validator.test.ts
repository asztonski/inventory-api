import {
  createProductSchema,
  updateStockSchema,
} from "../../validators/product.validator";

describe("Product Validators", () => {
  describe("createProductSchema", () => {
    it("should validate correct product data", () => {
      const validProduct = {
        name: "Laptop",
        description: "Gaming laptop",
        price: 1299.99,
        stock: 10,
        category: "Electronics",
      };

      const { error, value } = createProductSchema.validate(validProduct);
      expect(error).toBeUndefined();
      expect(value).toEqual(validProduct);
    });

    it("should reject product with missing name", () => {
      const invalidProduct = {
        description: "Test",
        price: 100,
        stock: 5,
      };

      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('"name" is required');
    });

    it("should reject product with name longer than 50 characters", () => {
      const invalidProduct = {
        name: "A".repeat(51),
        description: "Test",
        price: 100,
        stock: 5,
      };

      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain(
        "Name must not exceed 50 characters"
      );
    });

    it("should reject product with negative price", () => {
      const invalidProduct = {
        name: "Product",
        description: "Test",
        price: -10,
        stock: 5,
      };

      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Price must be positive");
    });

    it("should reject product with zero price", () => {
      const invalidProduct = {
        name: "Product",
        description: "Test",
        price: 0,
        stock: 5,
      };

      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Price must be positive");
    });

    it("should reject product with negative stock", () => {
      const invalidProduct = {
        name: "Product",
        description: "Test",
        price: 100,
        stock: -5,
      };

      const { error } = createProductSchema.validate(invalidProduct);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Stock cannot be negative");
    });

    it("should accept product with stock of 0", () => {
      const validProduct = {
        name: "Product",
        description: "Out of stock",
        price: 100,
        stock: 0,
      };

      const { error } = createProductSchema.validate(validProduct);
      expect(error).toBeUndefined();
    });

    it("should accept product without optional category", () => {
      const validProduct = {
        name: "Product",
        description: "Test",
        price: 100,
        stock: 5,
      };

      const { error } = createProductSchema.validate(validProduct);
      expect(error).toBeUndefined();
    });
  });

  describe("updateStockSchema", () => {
    it("should validate correct stock quantity", () => {
      const validStock = { quantity: 10 };

      const { error, value } = updateStockSchema.validate(validStock);
      expect(error).toBeUndefined();
      expect(value).toEqual(validStock);
    });

    it("should reject missing quantity", () => {
      const { error } = updateStockSchema.validate({});
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Quantity is required");
    });

    it("should reject negative quantity", () => {
      const { error } = updateStockSchema.validate({ quantity: -5 });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Quantity must be positive");
    });

    it("should reject zero quantity", () => {
      const { error } = updateStockSchema.validate({ quantity: 0 });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("Quantity must be positive");
    });

    it("should reject decimal quantity", () => {
      const { error } = updateStockSchema.validate({ quantity: 5.5 });
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain(
        "Quantity must be an integer"
      );
    });
  });
});
