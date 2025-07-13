import { z } from 'zod';

// Schema de validación para crear producto
export const CreateProductSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),
  description: z.string()
    .min(1, 'Product description is required')
    .max(500, 'Product description must be less than 500 characters'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price must be less than 1,000,000'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity must be non-negative')
    .max(999999, 'Quantity must be less than 1,000,000'),
  categoryId: z.number()
    .int('Category ID must be an integer')
    .positive('Category ID must be positive'),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  criticalStock: z.number()
    .int('Critical stock must be an integer')
    .min(0, 'Critical stock must be non-negative')
    .max(999999, 'Critical stock must be less than 1,000,000'),
  isActive: z.boolean().default(true)
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

/**
 * Valida los datos de entrada para crear un producto
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws ProductValidationError si la validación falla
 */
export function validateCreateProductDTO(data: unknown): CreateProductDTO {
  try {
    return CreateProductSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue: any) => issue.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
} 