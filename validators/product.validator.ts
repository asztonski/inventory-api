import Joi from "joi";

/**
 * Validation schema for creating a new product
 * Requirements:
 * - All fields required: name, description, price, stock
 * - Max length 50 for name and description
 * - Price must be positive
 */
export const createProductSchema = Joi.object({
  name: Joi.string().required().max(50).messages({
    "string.empty": "Name is required",
    "string.max": "Name must not exceed 50 characters",
  }),
  description: Joi.string().required().max(50).messages({
    "string.empty": "Description is required",
    "string.max": "Description must not exceed 50 characters",
  }),
  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be positive",
    "any.required": "Price is required",
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock is required",
  }),
  category: Joi.string().max(50).optional().messages({
    "string.max": "Category must not exceed 50 characters",
  }),
});

/**
 * Validation schema for stock updates (restock/sell)
 */
export const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.positive": "Quantity must be positive",
    "any.required": "Quantity is required",
  }),
});
