import { z } from 'zod';

export const CreateLocationSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional(),
  code: z
    .string()
    .min(2, 'El código es obligatorio')
    .max(20, 'El código no puede exceder 20 caracteres'),
  type: z
    .string()
    .min(2, 'El tipo es obligatorio')
    .max(50, 'El tipo no puede exceder 50 caracteres'),
  parentId: z
    .number()
    .positive('El ID de padre debe ser un número positivo')
    .optional(),
  zone: z.string().max(50, 'La zona no puede exceder 50 caracteres').optional(),
  shelf: z
    .string()
    .max(50, 'El estante no puede exceder 50 caracteres')
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateLocationDTO = z.infer<typeof CreateLocationSchema>;

export function validateCreateLocation(data: unknown): CreateLocationDTO {
  try {
    return CreateLocationSchema.parse(data);
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
