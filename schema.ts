import { z } from "zod";

// Product schema for inventory management
export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  markup: z.number().min(0).default(0),
  category: z.string().optional(),
  barcode: z.string().optional(),
  lowStockThreshold: z.number().int().min(0).default(5),
  thumbnail: z.string().optional(),
});

// Cart item schema
export const cartItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  qty: z.number().int().min(1),
});

// Transaction schema
export const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['cash', 'card', 'split']),
  items: z.array(cartItemSchema),
  subtotal: z.number(),
  tax: z.number(),
  total: z.number(),
  date: z.string(),
  paymentDetails: z.object({
    cashAmount: z.number().optional(),
    cardAmount: z.number().optional(),
    change: z.number().optional(),
  }).optional(),
});

// Insert schemas (without auto-generated fields)
export const insertProductSchema = productSchema;
export const insertCartItemSchema = cartItemSchema;
export const insertTransactionSchema = transactionSchema.omit({ id: true });

// Types
export type Product = z.infer<typeof productSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
