import { z } from 'zod';
import { StockStatus } from '../../../../shared/constants/RoleTypes';

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

export const ProductListResponseSchema = z.object({
  products: z.array(ProductFullResponseSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional(),
});

export const InventoryStatsResponseSchema = z.object({
  totalProducts: z.number(),
  activeProducts: z.number(),
  criticalStockCount: z.number(),
  outOfStockCount: z.number(),
  totalValue: z.number(),
  averagePrice: z.number(),
  totalQuantity: z.number(),
});

export type ProductResponseDTO = z.infer<typeof ProductResponseSchema>;
export type ProductFullResponseDTO = z.infer<typeof ProductFullResponseSchema>;
export type ProductListResponseDTO = z.infer<typeof ProductListResponseSchema>;
export type InventoryStatsResponseDTO = z.infer<
  typeof InventoryStatsResponseSchema
>;

export function validateProductResponse(data: unknown): ProductResponseDTO {
  return ProductResponseSchema.parse(data);
}

export function validateProductFullResponse(
  data: unknown
): ProductFullResponseDTO {
  return ProductFullResponseSchema.parse(data);
}

export function validateProductListResponse(
  data: unknown
): ProductListResponseDTO {
  return ProductListResponseSchema.parse(data);
}

export function validateInventoryStatsResponse(
  data: unknown
): InventoryStatsResponseDTO {
  return InventoryStatsResponseSchema.parse(data);
}
