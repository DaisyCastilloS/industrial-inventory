import { z } from 'zod';
import { MovementType } from '../../../../shared/constants/RoleTypes';

export const CreateProductMovementSchema = z.object({
  product_id: z.number().int().positive('El ID de producto es obligatorio'),
  movement_type: z.nativeEnum(MovementType),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  reason: z
    .string()
    .max(200, 'La razón no puede exceder 200 caracteres')
    .optional(),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

export type CreateProductMovementDTO = z.infer<
  typeof CreateProductMovementSchema
>;

// Tipo extendido que incluye user_id inyectado desde el controlador
export type CreateProductMovementWithUserIdDTO = CreateProductMovementDTO & {
  user_id: number;
};

export function validateCreateProductMovement(
  data: unknown
): CreateProductMovementDTO {
  try {
    return CreateProductMovementSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue: any) => issue.message)
        .join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}
