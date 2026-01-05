import Joi from "joi";

/**
 * Validation schema for creating a new order
 * Requirements:
 * - customerId: ID of the customer placing the order
 * - products: Array of products with productId and quantity
 */
export const createOrderSchema = Joi.object({
  customerId: Joi.string().required().messages({
    "string.empty": "Customer ID is required",
    "any.required": "Customer ID is required",
  }),
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          "string.empty": "Product ID is required",
          "any.required": "Product ID is required",
        }),
        quantity: Joi.number().integer().positive().required().messages({
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.positive": "Quantity must be positive",
          "any.required": "Quantity is required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one product is required",
      "any.required": "Products array is required",
    }),
});
