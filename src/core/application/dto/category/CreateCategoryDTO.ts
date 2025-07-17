import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional(),
  parentId: z.number().int().positive('parentId debe ser positivo').nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;

export function validateCreateCategory(data: unknown): CreateCategoryDTO {
  try {
    return CreateCategorySchema.parse(data);
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
