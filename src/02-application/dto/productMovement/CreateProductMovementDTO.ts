import { z } from 'zod';
import { MovementType } from '../../../00-constants/RoleTypes';

/**
 * DTO y validador para la creación de movimientos de producto
 * @author Daisy Castillo
 */
export const CreateProductMovementSchema = z.object({
  productId: z.number().int().positive('El ID de producto es obligatorio'),
  movementType: z.nativeEnum(MovementType),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  previousQuantity: z.number().int().min(0, 'La cantidad anterior no puede ser negativa'),
  newQuantity: z.number().int().min(0, 'La cantidad nueva no puede ser negativa'),
  reason: z.string().max(200, 'La razón no puede exceder 200 caracteres').optional(),
  userId: z.number().int().positive('El ID de usuario es obligatorio')
});

export type CreateProductMovementDTO = z.infer<typeof CreateProductMovementSchema>;

export function validateCreateProductMovement(data: unknown): CreateProductMovementDTO {
  try {
    return CreateProductMovementSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue: any) => issue.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
} 