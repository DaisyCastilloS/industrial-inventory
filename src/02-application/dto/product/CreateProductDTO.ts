/**
 * @fileoverview DTO para crear productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { z } from 'zod';

/**
 * Schema de validación para crear productos
 */
export const CreateProductSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/, 'El nombre solo puede contener letras, números, espacios, guiones y puntos'),
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  sku: z.string()
    .min(3, 'El SKU debe tener al menos 3 caracteres')
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9\-]+$/, 'El SKU solo puede contener letras mayúsculas, números y guiones'),
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(9999999.99, 'El precio no puede exceder 9,999,999.99'),
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(0, 'La cantidad no puede ser negativa')
    .default(0),
  criticalStock: z.number()
    .int('El stock crítico debe ser un número entero')
    .min(0, 'El stock crítico no puede ser negativo')
    .default(0),
  categoryId: z.number()
    .int('El ID de categoría debe ser un número entero')
    .positive('El ID de categoría debe ser mayor a 0'),
  locationId: z.number()
    .int('El ID de ubicación debe ser un número entero')
    .positive('El ID de ubicación debe ser mayor a 0')
    .optional(),
  supplierId: z.number()
    .int('El ID de proveedor debe ser un número entero')
    .positive('El ID de proveedor debe ser mayor a 0')
    .optional(),
  isActive: z.boolean().optional().default(true)
});

/**
 * Tipo TypeScript para crear productos
 */
export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

/**
 * Valida los datos para crear un producto
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateCreateProduct(data: unknown): CreateProductDTO {
  return CreateProductSchema.parse(data);
}

/**
 * Valida los datos para crear un producto de forma segura
 * @param data - Datos a validar
 * @returns Resultado de la validación
 */
export function safeValidateCreateProduct(data: unknown): { success: true; data: CreateProductDTO } | { success: false; errors: string[] } {
  const result = CreateProductSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map(err => err.message);
    return { success: false, errors };
  }
} 