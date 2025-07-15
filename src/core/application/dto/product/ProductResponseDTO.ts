/**
 * @fileoverview DTO de respuesta para productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { z } from 'zod';
import { StockStatus } from '../../../../shared/constants/RoleTypes';

/**
 * Schema de respuesta para productos
 */
export const ProductResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  price: z.number(),
  quantity: z.number(),
  criticalStock: z.number(),
  categoryId: z.number(),
  locationId: z.number().nullable(),
  supplierId: z.number().nullable(),
  isActive: z.boolean(),
  stockStatus: z.nativeEnum(StockStatus),
  inventoryValue: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema de respuesta para productos con información completa
 */
export const ProductFullResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  sku: z.string(),
  price: z.number(),
  quantity: z.number(),
  criticalStock: z.number(),
  categoryId: z.number(),
  locationId: z.number().nullable(),
  supplierId: z.number().nullable(),
  isActive: z.boolean(),
  stockStatus: z.nativeEnum(StockStatus),
  inventoryValue: z.number(),
  categoryName: z.string().nullable(),
  locationName: z.string().nullable(),
  supplierName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema de respuesta para lista de productos
 */
export const ProductListResponseSchema = z.object({
  products: z.array(ProductFullResponseSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});

/**
 * Schema de respuesta para estadísticas de inventario
 */
export const InventoryStatsResponseSchema = z.object({
  totalProducts: z.number(),
  activeProducts: z.number(),
  criticalStockCount: z.number(),
  outOfStockCount: z.number(),
  totalValue: z.number(),
  averagePrice: z.number(),
  totalQuantity: z.number(),
});

/**
 * Tipo TypeScript para respuesta de producto
 */
export type ProductResponseDTO = z.infer<typeof ProductResponseSchema>;

/**
 * Tipo TypeScript para respuesta de producto con información completa
 */
export type ProductFullResponseDTO = z.infer<typeof ProductFullResponseSchema>;

/**
 * Tipo TypeScript para respuesta de lista de productos
 */
export type ProductListResponseDTO = z.infer<typeof ProductListResponseSchema>;

/**
 * Tipo TypeScript para respuesta de estadísticas de inventario
 */
export type InventoryStatsResponseDTO = z.infer<
  typeof InventoryStatsResponseSchema
>;

/**
 * Valida la respuesta de producto
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateProductResponse(data: unknown): ProductResponseDTO {
  return ProductResponseSchema.parse(data);
}

/**
 * Valida la respuesta de producto con información completa
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateProductFullResponse(
  data: unknown
): ProductFullResponseDTO {
  return ProductFullResponseSchema.parse(data);
}

/**
 * Valida la respuesta de lista de productos
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateProductListResponse(
  data: unknown
): ProductListResponseDTO {
  return ProductListResponseSchema.parse(data);
}

/**
 * Valida la respuesta de estadísticas de inventario
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateInventoryStatsResponse(
  data: unknown
): InventoryStatsResponseDTO {
  return InventoryStatsResponseSchema.parse(data);
}
